# Architecture — Vue système

> Adresse les critères : **System Design** · **System Integration** · **Code Quality**

---

## 1. Vue d'ensemble

### 1.1 Schéma système

```
┌────────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                             │
│                  (navigateur · mobile · desktop)               │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  FRONTEND  (React 19 + Vite)                   │
│  · Pages  · Composants  · Chatbot widget                       │
│  · React Router 7         · État dans l'URL (useUrlState)      │
└──────────────────────────┬─────────────────────────────────────┘
                           │ fetch JSON · Bearer JWT
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              BACKEND API  (Node.js + Express 5)                │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐      │
│  │ /auth      │  │ /jobs      │  │ /admin               │      │
│  │ /chat      │  │ /favorites │  │  (RBAC: ADMIN only)  │      │
│  └────────────┘  └────────────┘  └──────────────────────┘      │
│  · Helmet  · CORS strict  · Rate limit  · express-validator    │
└──────────────────────────┬─────────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              POSTGRESQL 16  (volume Docker persistant)         │
│   Tables : users · offers · favorites · ingestion_logs         │
└────────────────────────────────────────────────────────────────┘
                           ▲
                           │
┌────────────────────────────────────────────────────────────────┐
│           DATA PIPELINE  (cron · 1× / heure)                   │
│                                                                │
│  WeLoveDevs API ──► Normalisation ──► IA (RAKE) ──► Postgres   │
│  (1 req/s)         (HTML, salaires)  (keywords)                │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Composants principaux

| Composant | Responsabilité | Stack |
|---|---|---|
| **Frontend** | Interface utilisateur, navigation, chatbot widget | React 19, TypeScript, Tailwind, Vite |
| **Backend API** | Logique métier, sécurité, persistance | Node.js, Express 5, Prisma |
| **Base de données** | Stockage relationnel des utilisateurs, offres, favoris | PostgreSQL 16 (prod), SQLite (dev) |
| **Service IA** | Extraction de mots-clés depuis les descriptions | Python, Flask, RAKE-NLTK |
| **Pipeline d'ingestion** | Collecte et normalisation des offres externes | Node.js (intégré au backend, déclenché par cron) |

---

## 2. Décisions d'architecture (ADRs)

### ADR-001 — Mono-repo

**Décision :** un seul dépôt Git pour frontend, backend et data.

**Pourquoi :**
- Équipe de 4, projet pédagogique court : pas le bandwidth pour gérer 3 dépôts séparés.
- Refactorings cross-couche (changer un contrat d'API) trivialisés.
- Une seule CI à configurer.

**Alternatives rejetées :**
- *Polyrepo* : trop de friction pour une équipe junior.
- *Submodules Git* : complexité opérationnelle excessive.

**Trade-off accepté :** scoping fin des permissions impossible (toute l'équipe a accès à tout).

---

### ADR-002 — Double schéma Prisma (SQLite dev / Postgres prod)

**Décision :** maintenir deux fichiers de schéma Prisma — un pour SQLite en dev, un pour PostgreSQL en prod.

**Pourquoi :**
- Onboarding instantané : `npm run db:seed` fonctionne sans installer Postgres.
- Tests CI rapides : pas besoin de container Postgres pour les tests d'intégration.
- Le sujet impose Postgres en prod : on doit le supporter.

**Alternatives rejetées :**
- *Postgres uniquement* : ralentit l'équipe au quotidien.
- *Docker pour dev* : surcouche pour les développeurs qui veulent juste lire les logs.

**Trade-off accepté :** quelques fonctionnalités Postgres (arrays natifs) sont émulées en JSON-string en SQLite.

→ Détails dans [DATA.md §3](DATA.md#3-schéma-de-données).

---

### ADR-003 — Authentification par JWT court (15 min) sans refresh token

**Décision :** JWT signé HS256, expiration 15 minutes, pas de refresh token pour le MVP.

**Pourquoi :**
- Simplicité d'implémentation pour une équipe junior.
- Limite la fenêtre d'exploitation en cas de vol de session.
- Roadmap : refresh token rotation prévu en phase 2.

**Trade-off accepté :** l'utilisateur doit se reconnecter toutes les 15 minutes en utilisation longue. Documenté comme dette technique.

→ Détails dans [SECURITY.md](SECURITY.md).

---

### ADR-004 — IA locale (RAKE) plutôt qu'une API LLM externe

**Décision :** extraction de mots-clés via RAKE-NLTK en local, pas d'appel à OpenAI ou autre API LLM.

**Pourquoi :**
- **Coût** : appel API LLM ≈ $0.001 par offre × 1000 offres × 365 jours = $365/an. RAKE = gratuit.
- **Latence** : RAKE < 200 ms en local vs. 500-1500 ms par appel LLM.
- **Souveraineté** : pas de fuite de données vers un tiers.
- **Empreinte** : < 50 Mo RAM, tient sur n'importe quel hébergement.

**Alternatives rejetées :**
- *OpenAI GPT-4* : trop cher pour un projet pédagogique.
- *Hugging Face transformers locaux* : > 500 Mo, trop lourd.

**Trade-off accepté :** RAKE est moins précis qu'un LLM sur des cas ambigus. Documenté comme axe d'amélioration (cf. roadmap phase 3).

---

### ADR-005 — Architecture monolithique pour le backend

**Décision :** un seul service backend qui contient routes, validation, ORM, jobs d'ingestion.

**Pourquoi :**
- Trafic attendu < 1000 utilisateurs : pas besoin de microservices.
- Mono-déploiement : 1 commande Docker = tout est up.
- Refactoring vers microservices possible plus tard si besoin (extraction du pipeline d'ingestion en premier candidat).

**Trade-off accepté :** un crash du backend tombe l'API ET l'ingestion. Atténué par un healthcheck Docker qui redémarre automatiquement.

---

## 3. Contraintes système

### 3.1 Performance

| Contrainte | Cible | Mesure actuelle |
|---|---|---|
| Temps de réponse API (p95) | < 300 ms | ~120 ms |
| Premier rendu page d'accueil (FCP) | < 1.5 s | ~900 ms |
| Latence chatbot | < 500 ms | ~250 ms |
| Ingestion d'1 offre (pipeline complet) | < 300 ms | ~180 ms |

Méthodologie complète → [PERFORMANCE.md](PERFORMANCE.md).

### 3.2 Scalabilité

Le système est dimensionné pour :
- **1 000 utilisateurs actifs concurrents** sans tuning supplémentaire.
- **10 000 offres actives** en base.
- **3 sources d'ingestion** simultanées.

Points de blocage identifiés au-delà :
- Le backend monolithique : à découper si > 5 000 RPS.
- Postgres en instance unique : à passer en lecture-replica si > 100 000 offres.
- Le service IA : actuellement synchrone, à passer en queue async si > 10 ingestions parallèles.

### 3.3 Maintenabilité

| Mesure | Pratique |
|---|---|
| Lisibilité | Conventions de commit (`feat:`, `fix:`, `docs:`), TypeScript strict |
| Modularité | Séparation par couche (routes / services / middleware) |
| Testabilité | Tests d'intégration sans BDD via mocks Prisma |
| Documentation | Cette documentation + commentaires sur les zones non-triviales |
| Onboarding | < 10 minutes pour démarrer en local (`docker compose up`) |

---

## 4. Structure du dépôt

```
jobryx/
├── README.md                  # Point d'entrée
├── docker-compose.yml         # Orchestration prod (postgres + backend)
├── docs/                      # ← Cette documentation
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATA.md
│   ├── PERFORMANCE.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   └── TEAM.md
├── frontend/
│   ├── README.md
│   ├── src/
│   │   ├── pages/             # Home, Login, Register, Dashboard, …
│   │   ├── components/        # Chatbot, Navbar, Footer, ProtectedRoute
│   │   ├── hooks/             # useAuth, useUrlState
│   │   ├── services/          # apiClient
│   │   ├── copy/              # i18n FR centralisé
│   │   └── types/
│   └── package.json
└── backend/
    ├── README.md
    ├── src/
    │   ├── routes/            # auth, jobs, admin, chat
    │   ├── middleware/        # auth, requireAdmin, rateLimiter, validate
    │   ├── services/          # prisma
    │   ├── seed.ts
    │   └── index.ts
    ├── prisma/
    │   ├── schema.prisma      # Postgres (prod)
    │   ├── schema.dev.prisma  # SQLite (dev)
    │   └── migrations/
    └── package.json
```

---

## 5. Flux de données critiques

### 5.1 Authentification

```
1. Front : POST /api/v1/auth/login { email, password }
2. Back  : vérification bcrypt → génération JWT (15 min)
3. Front : stockage du token, ajout en header Authorization
4. Back  : middleware auth() vérifie la signature à chaque requête
5. Front : redirection si 401 → page de login
```

### 5.2 Recherche par chatbot

```
1. Front : POST /api/v1/chat { message: "stage React à Paris" }
2. Back  : parser NLP → { keyword: "react", location: "Paris", contractType: "STAGE" }
3. Back  : query Prisma sur la table offers avec ces filtres
4. Back  : retourne max 5 offres + message de contexte
5. Front : affichage des cartes d'offres dans le widget chatbot
```

### 5.3 Ingestion d'offres

```
1. Cron déclenche le pipeline (configurable, défaut 1×/h)
2. Appel à l'API WeLoveDevs, throttlé à 1 req/s
3. Pour chaque offre brute :
   a. Normalisation (HTML, salaires, types de contrat)
   b. Si nouvelle → appel au service IA pour extraire les keywords
   c. Si déjà ingérée → skip de l'IA, refresh des champs volatiles
4. Upsert en base avec source = "WeLoveDevs"
5. Log dans ingestion_logs (succès / erreurs)
```

Détails → [DATA.md](DATA.md).

---

## 6. Décisions futures à documenter

Quand on les prendra, créer un nouvel ADR :

- Choix d'un service de queue (BullMQ, RabbitMQ, SQS ?)
- Stratégie de cache (Redis ? Cache HTTP côté CDN ?)
- Choix d'un provider OAuth (NextAuth ? Lucia ?)
- Migration vers un modèle IA fine-tuné (quel hébergeur ?)
