# Jobryx — Backend

Express 5 + TypeScript + Prisma (SQLite dev / PostgreSQL prod) + JWT auth.

## Premier lancement (dev local, sans Docker)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le .env à partir de l'exemple
cp .env.example .env
```

Editer `.env` et remplir :
- `JWT_SECRET` — générer avec `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `DATABASE_URL` — laisser `file:./dev.db` pour SQLite local

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=<secret_64_bytes>
JWT_EXPIRES_IN=15m
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=file:./dev.db
```

```bash
# 3. Générer le client Prisma (SQLite)
npm run db:generate

# 4. Appliquer les migrations
npm run db:migrate

# 5. Peupler la DB (admin + 5 offres)
npm run db:seed

# 6. Lancer le serveur de dev
npm run dev
```

Le backend écoute sur **http://localhost:3000**.

## Comptes par défaut (après seed)

| Rôle  | Email               | Mot de passe    |
|-------|---------------------|-----------------|
| ADMIN | admin@jobryx.dev    | Admin@jobryx1!  |

## Scripts disponibles

| Commande             | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Serveur dev avec rechargement automatique |
| `npm run build`      | Compilation TypeScript                   |
| `npm run db:generate`| Génère le client Prisma (SQLite)         |
| `npm run db:migrate` | Applique les migrations SQLite           |
| `npm run db:seed`    | Insère l'admin et des offres de test     |

## Routes API

```
POST   /api/v1/auth/register   Créer un compte
POST   /api/v1/auth/login      Connexion → { access_token }
GET    /api/v1/auth/me         Profil (auth requis)

GET    /api/v1/jobs            Liste des offres (auth requis)
GET    /api/v1/jobs/:id        Détail d'une offre (auth requis)

GET    /api/v1/admin/users     Liste utilisateurs (admin)
PATCH  /api/v1/admin/users/:id Modifier rôle/is_active (admin)
DELETE /api/v1/admin/users/:id Supprimer utilisateur (admin)

GET    /api/v1/admin/offers    Toutes les offres (admin)
POST   /api/v1/admin/offers    Créer une offre (admin)
PATCH  /api/v1/admin/offers/:id Modifier une offre (admin)
DELETE /api/v1/admin/offers/:id Supprimer une offre (admin)
```

## Règles de mot de passe

8 caractères minimum, avec au moins : 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.  
Exemple valide : `MonPass1!`

## Production (Docker)

```bash
cp .env.example .env  # remplir DB_PASSWORD, JWT_SECRET, CORS_ORIGINS
docker compose up -d
```
