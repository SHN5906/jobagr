# Déploiement & DevOps

> Adresse le critère : **Deployment & DevOps**

---

## 1. Vue d'ensemble

Le projet est entièrement conteneurisé. Une seule commande lance toute la stack :

```bash
docker compose up -d
```

Cela démarre 2 services orchestrés :
1. **postgres** — base de données PostgreSQL 16
2. **backend** — API Node.js + Express

Le frontend est servi séparément (dev : `npm run dev` dans `frontend/`, prod : build statique servi par Nginx ou Vercel).

---

## 2. Prérequis

| Outil | Version minimale | Comment vérifier |
|---|---|---|
| Docker | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Node.js (pour dev local) | 20+ | `node --version` |
| Git | 2.40+ | `git --version` |

---

## 3. Démarrage rapide (production locale)

### 3.1 Cloner et configurer

```bash
git clone <url-du-repo> jobryx
cd jobryx
```

### 3.2 Variables d'environnement

Créer `backend/.env` depuis le template :

```bash
cp backend/.env.example backend/.env
```

Remplir les valeurs sensibles :

```env
# Sécurité (à générer)
JWT_SECRET=<résultat de: openssl rand -hex 64>
DB_PASSWORD=<mot de passe Postgres>

# Configuration (par défaut OK)
NODE_ENV=production
PORT=3000
JWT_EXPIRES_IN=15m
BCRYPT_ROUNDS=12
CORS_ORIGINS=localhost:5173

# Base de données (auto en Docker)
DATABASE_URL=postgresql://jobryx:${DB_PASSWORD}@postgres:5432/jobryx
```

### 3.3 Lancer

```bash
docker compose up -d
```

Vérifier que tout tourne :

```bash
docker compose ps
# postgres   running (healthy)
# backend    running

curl localhost:3000/api/v1/health
# { "status": "ok", "version": "1.0.0" }
```

### 3.4 Initialiser la base

```bash
docker compose exec backend npm run db:migrate:prod
docker compose exec backend npm run db:seed
```

Cela applique les migrations et insère :
- 1 utilisateur admin (`admin@jobryx.dev` / `Admin@jobryx1!`)
- ~8 offres réalistes pour tester

---

## 4. Développement local (sans Docker pour le back)

Pour itérer rapidement sur le backend :

```bash
cd backend
npm install
cp .env.example .env   # mode SQLite par défaut
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev            # nodemon + ts-node, port 3000
```

Le frontend :

```bash
cd frontend
npm install
npm run dev            # Vite, port 5173
```

---

## 5. Architecture Docker

### 5.1 `docker-compose.yml` commenté

```yaml
services:
  postgres:
    image: postgres:16-alpine        # Image officielle minimale
    restart: unless-stopped          # Redémarrage auto sauf arrêt manuel
    environment:
      POSTGRES_DB: jobryx
      POSTGRES_USER: jobryx
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data   # Persistance hors container
    healthcheck:                         # Pour que backend attende Postgres
      test: ["CMD-SHELL", "pg_isready -U jobryx -d jobryx"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy     # Attend que Postgres soit prêt
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://jobryx:${DB_PASSWORD}@postgres:5432/jobryx
      JWT_SECRET: ${JWT_SECRET}
      # ... autres variables
    ports:
      - "3000:3000"

volumes:
  pgdata:    # Volume nommé, survit aux redémarrages
```

### 5.2 Dockerfile backend

```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Pourquoi multi-stage ?**
- Image finale ne contient que le runtime + le code compilé.
- Pas de TypeScript, pas de devDependencies.
- Taille finale : ~150 Mo au lieu de ~500 Mo.

---

## 6. CI / CD (GitHub Actions)

### 6.1 Vue d'ensemble

À chaque push sur une PR :
1. **Lint** front + back
2. **Build** front + back (vérifie qu'il n'y a pas d'erreur de compilation)
3. **Tests** unitaires et d'intégration
4. Si tout passe → la PR peut être mergée

Sur `main`, en plus :
5. Build des images Docker
6. Push vers le registry (futur)

### 6.2 Self-hosted runners

Le sujet impose des **self-hosted runners** (pas `ubuntu-latest`) :

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: self-hosted   # IMPORTANT — exigence du sujet
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
```

**Pourquoi self-hosted ?**
- Le sujet l'exige (cf. spec Epitech).
- Maîtrise totale de l'environnement.
- Pas de quota minutes GitHub Actions.

### 6.3 Stratégie de tests CI

Les tests CI tournent **sans base de données** réelle :
- Mocks Prisma pour le backend.
- Mocks WeLoveDevs pour la couche data.

**Pourquoi ?**
- Temps de test < 30 s (vs. > 2 min avec un container Postgres).
- Pas de flakiness liée au démarrage de Postgres.
- Pas besoin de seed/teardown entre tests.

---

## 7. Variables d'environnement

### 7.1 Tableau complet

| Variable | Service | Obligatoire | Valeur par défaut | Description |
|---|---|---|---|---|
| `NODE_ENV` | backend | non | `production` | `development` désactive le rate limiter |
| `PORT` | backend | non | `3000` | Port HTTP |
| `JWT_SECRET` | backend | **oui** | — | Clé de signature JWT (64 bytes) |
| `JWT_EXPIRES_IN` | backend | non | `15m` | Durée de vie du token |
| `BCRYPT_ROUNDS` | backend | non | `12` | Coût bcrypt |
| `DATABASE_URL` | backend | **oui** | — | Connexion Postgres ou SQLite |
| `DB_PASSWORD` | postgres | **oui** | — | Mot de passe Postgres |
| `CORS_ORIGINS` | backend | **oui** | — | Whitelist d'origines |
| `WLD_API_KEY` | backend | non | — | Clé d'API WeLoveDevs (sinon ingestion désactivée) |

### 7.2 Fichier `.env.example`

Fourni dans `backend/.env.example`. **Jamais** committer le vrai `.env`.

---

## 8. Déploiement en production

### 8.1 Option A — Serveur dédié (VPS)

Cible : Hetzner CX21, OVH VPS, ou équivalent. ~5 €/mois.

```bash
# 1. SSH sur le serveur
ssh root@<ip>

# 2. Installer Docker
# (suivre la procédure officielle Docker pour votre distribution)

# 3. Cloner et configurer
git clone <url-du-repo> jobryx
cd jobryx
cp backend/.env.example backend/.env
# éditer .env avec les vraies valeurs

# 4. Lancer
docker compose up -d

# 5. Reverse proxy (Caddy ou Nginx) en façade pour HTTPS
# voir DEPLOYMENT.md §9
```

### 8.2 Option B — Plateforme managée

| Service | Cible | Coût mensuel |
|---|---|---|
| Frontend | Vercel / Netlify (build statique) | Gratuit |
| Backend | Railway / Fly.io | ~5-10 € |
| Postgres | Railway / Neon | Gratuit jusqu'à 500 Mo |

Le frontend se construit via :
```bash
cd frontend
npm run build
# → dossier dist/ à servir
```

---

## 9. Reverse proxy & HTTPS

En production, on met **Caddy** ou **Nginx** devant le backend pour :
- Terminaison TLS (HTTPS).
- Compression gzip.
- Rate limiting de bord.

Exemple Caddyfile :

```caddy
jobryx.example.com {
  reverse_proxy backend:3000
}

api.jobryx.example.com {
  reverse_proxy backend:3000
}
```

Caddy gère **automatiquement** Let's Encrypt → HTTPS gratuit.

---

## 10. Monitoring & santé

### 10.1 Healthcheck

Endpoint dédié :
```
GET /api/v1/health
→ { "status": "ok", "version": "1.0.0", "db": "up" }
```

Le healthcheck Docker (Postgres) utilise `pg_isready` :
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U jobryx -d jobryx"]
  interval: 5s
  timeout: 5s
  retries: 10
```

### 10.2 Logs

Logs accessibles via :
```bash
docker compose logs -f backend
docker compose logs -f postgres
```

En prod : centralisation prévue (Loki/Grafana, phase 2).

### 10.3 Sauvegardes

Backup quotidien du volume Postgres :
```bash
docker compose exec postgres pg_dump -U jobryx jobryx | gzip > backup_$(date +%F).sql.gz
```

Conservation : 30 jours. À automatiser via cron sur le serveur de prod.

---

## 11. Mises à jour

### 11.1 Workflow

```bash
# 1. Sur le serveur
cd jobryx
git pull origin main

# 2. Rebuild et redémarrer
docker compose up -d --build

# 3. Migrations si besoin
docker compose exec backend npm run db:migrate:prod
```

Temps d'indisponibilité : < 30 secondes (le temps du restart).

### 11.2 Rollback

Si une mise à jour casse la prod :
```bash
git checkout <previous-commit>
docker compose up -d --build
```

Les migrations DB doivent être pensées **rétro-compatibles** (ajout de colonne nullable, jamais de drop direct).

---

## 12. Troubleshooting

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Connection refused` sur Postgres | Container pas encore healthy | Attendre 10 s, retenter |
| `JWT_SECRET is required` | Variable manquante | Vérifier `.env` |
| `Rate limited` en dev | `NODE_ENV != development` | Mettre `NODE_ENV=development` |
| Front blanc en local | API down | `docker compose ps`, vérifier le backend |
| `EACCES` sur le volume | Permissions Docker | `chown -R 1000:1000 ./pgdata` |
| `Prisma client out of sync` | Schéma modifié sans regenerate | `npm run db:generate` |

---

## 13. Checklist avant mise en production

- [ ] `JWT_SECRET` régénéré (pas la valeur par défaut)
- [ ] `DB_PASSWORD` régénéré
- [ ] `.env` **non commité** (vérifier `git status`)
- [ ] HTTPS configuré (Caddy/Nginx + Let's Encrypt)
- [ ] `CORS_ORIGINS` restreint aux vrais domaines de prod
- [ ] Backup Postgres automatique configuré
- [ ] Healthcheck supervisé (UptimeRobot ou équivalent)
- [ ] Logs surveillés
- [ ] Documentation déploiement à jour
