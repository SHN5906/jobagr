# FAQ — Questions fréquentes

> Pour gagner du temps avant d'aller chercher dans la doc complète.

---

## Produit

### Pour qui c'est ?
Étudiants en tech (Epitech, écoles d'ingé, universités info) et jeunes diplômés en recherche de stage / alternance / CDI dans le développement, la data, le DevOps. Détails dans [PRODUCT.md](PRODUCT.md).

### En quoi c'est différent de LinkedIn ?
Trois différences clés : (1) on est **spécialisé tech** (pas généraliste), (2) on offre une **recherche en langage naturel** via chatbot, (3) on **normalise les salaires** au lieu de les laisser absents.

### C'est payant ?
Non. L'accès aux offres est gratuit. Pas de paywall, pas de pub.

### Vous trackez les utilisateurs ?
Non. Pas de tracking comportemental, pas de cookies tiers, pas de publicité. Détails dans [SECURITY.md §8.1](SECURITY.md#81-rgpd-ue).

---

## Technique

### Comment je lance le projet en local ?
```bash
docker compose up -d
```
Détails dans [DEPLOYMENT.md §3](DEPLOYMENT.md#3-démarrage-rapide-production-locale).

### Pourquoi deux schémas Prisma ?
Pour permettre de développer en local avec SQLite (zéro install) tout en gardant Postgres en prod. Détails dans [ARCHITECTURE.md §2 ADR-002](ARCHITECTURE.md#adr-002--double-schéma-prisma-sqlite-dev--postgres-prod).

### Pourquoi pas un LLM pour le chatbot ?
Latence, coût et souveraineté. RAKE + regex font le job pour notre cas d'usage structuré. Détails dans [DATA.md §5.3](DATA.md#53-pourquoi-pas-un-llm-).

### Comment les mots de passe sont stockés ?
bcrypt 12 rounds. Jamais en clair. Détails dans [SECURITY.md §2.1](SECURITY.md#21-stockage-des-mots-de-passe).

### Comment l'API est documentée ?
Dans [API.md](API.md). Tous les endpoints, codes d'erreur et exemples curl y sont.

---

## Équipe & process

### Qui fait quoi ?
Voir [TEAM.md §5](TEAM.md#5-répartition-du-travail).

### Comment vous organisez vos tâches ?
GitHub Project + Kanban + 4 swimlanes (Front/Back/Data/DevOps) + milestones hebdo. Détails dans [TEAM.md §3](TEAM.md#3-github-project-gestion-de-tâches).

### Vous faites des code reviews ?
Oui, obligatoire. Personne ne merge sa propre PR. Détails dans [TEAM.md §2.3](TEAM.md#23-code-review).

---

## Performance

### Combien d'utilisateurs ça supporte ?
~1000 utilisateurs concurrents en l'état. Tests de charge dans [PERFORMANCE.md §7](PERFORMANCE.md#7-tests-de-charge).

### C'est rapide ?
- API p95 : < 230 ms
- Front FCP : < 1 s
- Chatbot : < 500 ms
Détails dans [PERFORMANCE.md](PERFORMANCE.md).

### Combien ça coûte à héberger ?
< 10 €/mois en self-hosted (VPS), gratuit en plateforme managée jusqu'à un certain trafic. Détails dans [PERFORMANCE.md §6.2](PERFORMANCE.md#62-coût-dhébergement-estimé).

---

## Sécurité

### Que se passe-t-il si on vole un token ?
Le token expire au bout de 15 minutes, ce qui limite la fenêtre d'exploitation. Détails dans [SECURITY.md §2.2](SECURITY.md#22-tokens-jwt).

### Vous couvrez l'OWASP Top 10 ?
Oui, 8 risques sur 10 sont couverts. Voir le tableau complet dans [SECURITY.md §8.2](SECURITY.md#82-owasp-top-10-2021).

### Comment je signale une vulnérabilité ?
Email à l'équipe avec « [SECURITY] » dans l'objet. Pas d'issue publique pour les failles critiques.

---

## Roadmap

### C'est quoi la suite ?
4 phases prévues : MVP livré → 3 mois (OAuth, plus de sources) → 6 mois (IA spécialisée) → long terme (mobile, API publique). Détails dans [PRODUCT.md §5](PRODUCT.md#5-roadmap-produit).

### On peut contribuer ?
Pour l'instant, le projet est interne à l'équipe pédagogique. Ouverture open source envisagée après la review finale.

---

## Pas trouvé ?

Vérifie dans :
1. [README.md](../README.md) — point d'entrée général
2. [docs/](.) — toute la documentation détaillée
3. Issues GitHub — questions ou bugs déjà signalés
4. Discord équipe — discussion en direct
