# Jobryx

> Le moteur de recherche d'emploi tech qui comprend ce qu'on cherche.

Jobryx agrège des offres d'emploi tech depuis plusieurs sources, les nettoie automatiquement, en extrait les compétences clés avec une IA légère, et les expose dans une plateforme web sécurisée avec recherche en langage naturel.

---

## Démarrage rapide

```bash
# 1. Cloner le repo
git clone <url-du-repo> jobryx && cd jobryx

# 2. Configurer l'environnement
cp backend/.env.example backend/.env   # remplir JWT_SECRET, DB_PASSWORD

# 3. Lancer toute la stack (Postgres + backend + frontend)
docker compose up -d

# 4. Ouvrir le site
# Aller sur localhost:5173 dans le navigateur
```

| Service | Adresse | Description |
|---|---|---|
| Frontend | localhost:5173 | Site web React |
| Backend API | localhost:3000 | API REST sécurisée |
| Postgres | localhost:5432 | Base de données |

**Compte admin de démo** (créé par le seed) : `admin@jobryx.dev` / `Admin@jobryx1!`

---

## Documentation

| Document | Pour qui ? | Sujet |
|---|---|---|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Tout le monde | Cible, valeur, positionnement |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech | Schéma système, décisions, ADRs |
| [docs/API.md](docs/API.md) | Tech | Référence complète des endpoints REST |
| [docs/DATA.md](docs/DATA.md) | Tech | Pipeline d'ingestion, schéma, IA |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Tech | Benchmarks, métriques, méthodologie |
| [docs/SECURITY.md](docs/SECURITY.md) | Tech | Modèle de menaces, contre-mesures |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | DevOps | Docker, CI/CD, variables d'env |
| [docs/TEAM.md](docs/TEAM.md) | Tout le monde | Workflow, organisation, contributions |

Une question rapide ? Voir [docs/FAQ.md](docs/FAQ.md).

---

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS · React Router 7 |
| Backend | Node.js · Express 5 · TypeScript · Prisma ORM |
| Base de données | PostgreSQL 16 (prod) · SQLite (dev) |
| IA / Data | Python · Flask · RAKE-NLTK |
| Infra | Docker Compose · GitHub Actions (self-hosted runners) |

---

## Équipe

| Membre | Rôle | Responsabilités principales |
|---|---|---|
| Sohan | Frontend lead | UI/UX, design system, chatbot widget |
| Rayane | Backend & Sécurité | Auth JWT, RBAC, base de données, sécu |
| Fael | Backend Validation | Erreurs structurées, rate limiting, validators |
| Liam | Data & IA | Pipeline d'ingestion, extraction NLP, normalisation |

Détails du workflow → [docs/TEAM.md](docs/TEAM.md).

---

## Licence

Projet pédagogique Epitech — Web Tech B1.
