# API REST — Référence complète

> Adresse les critères : **Project Communication** · **System Integration**

Base en local : `localhost:3000`
Préfixe : tous les endpoints sont préfixés par `/api/v1`.

---

## Conventions

### Format des réponses

**Succès :**
```json
{ "data": { ... } }   // ou { ... } directement pour la rétrocompatibilité
```

**Erreur :**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email invalide",
    "fields": ["email"]
  }
}
```

### Codes d'erreur

| Code HTTP | Code interne | Sens |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Champ invalide ou manquant |
| 401 | `UNAUTHORIZED` | Token absent / invalide / expiré |
| 403 | `FORBIDDEN` | Token valide mais rôle insuffisant |
| 404 | `NOT_FOUND` | Ressource inexistante |
| 409 | `CONFLICT` | Conflit (ex. email déjà pris) |
| 429 | `RATE_LIMITED` | Trop de requêtes |
| 500 | `INTERNAL_ERROR` | Erreur serveur (à signaler) |

### Authentification

La plupart des endpoints exigent un header :
```
Authorization: Bearer <jwt_token>
```
Le token est obtenu via `POST /auth/login`. Durée de vie : **15 minutes**.

---

## 1. Auth

### `POST /api/v1/auth/register`
Créer un compte.

**Body :**
```json
{
  "email": "user@example.com",
  "username": "user42",
  "password": "MonPass1!",
  "passwordConfirm": "MonPass1!"
}
```

**Règles mot de passe :** 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.

**Réponses :**
- `201 Created` → `{ "id": "uuid", "email": "...", "username": "..." }`
- `400 VALIDATION_ERROR` → champs invalides
- `409 CONFLICT` → email ou username déjà pris

---

### `POST /api/v1/auth/login`
Connexion.

**Body :**
```json
{ "email": "user@example.com", "password": "MonPass1!" }
```

**Réponses :**
- `200 OK` → `{ "access_token": "eyJ...", "user": { "id": "...", "email": "...", "role": "USER" } }`
- `401 UNAUTHORIZED` → identifiants invalides
- `429 RATE_LIMITED` → trop de tentatives (5/min)

---

### `GET /api/v1/auth/me`
Récupérer le profil de l'utilisateur courant.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "user42",
  "role": "USER",
  "is_active": true,
  "created_at": "2026-05-01T10:00:00Z"
}
```

---

## 2. Offres

### `GET /api/v1/jobs`
Liste paginée des offres.

**Headers :** `Authorization: Bearer <token>`

**Query parameters :**

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `q` | string | — | Recherche textuelle (titre, entreprise, tags) |
| `location` | string | — | Filtre ville |
| `contract` | enum | — | `CDI` · `STAGE` · `ALTERNANCE` · `FREELANCE` |
| `page` | number | `1` | Numéro de page (à partir de 1) |
| `limit` | number | `20` | Taille de page (max 50) |

**Exemple :**
```
GET /api/v1/jobs?q=react&location=Paris&contract=STAGE&page=1&limit=10
```

**Réponse :**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Stage Dev React",
      "company": "Acme",
      "location": "Paris",
      "work_mode": "hybrid",
      "contract": "STAGE",
      "salary": "1200€/mois",
      "tags": ["react", "typescript"],
      "score": 87,
      "posted_at": "2026-05-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### `GET /api/v1/jobs/:id`
Détail d'une offre.

**Réponses :**
- `200 OK` → objet complet de l'offre
- `404 NOT_FOUND` → id inconnu

---

## 3. Chatbot

### `POST /api/v1/chat`
Recherche en langage naturel.

**Body :**
```json
{ "message": "stage React à Paris" }
```

**Contraintes :** message ≤ 500 caractères.

**Réponse :**
```json
{
  "reply": "Voici 3 offres récentes :",
  "offers": [
    { "id": "...", "title": "...", "company": "...", "tags": ["react"] }
  ],
  "intent": {
    "keyword": "react",
    "location": "Paris",
    "contractType": "STAGE"
  }
}
```

Détails de l'algorithme d'extraction → [DATA.md §5](DATA.md#5-chatbot--extraction-dintention).

---

## 4. Favoris

### `GET /api/v1/favorites`
Liste des offres favorites de l'utilisateur courant.

### `POST /api/v1/favorites`
Ajouter une offre aux favoris.

**Body :** `{ "offerId": "uuid" }`

**Réponses :**
- `201 Created`
- `404 NOT_FOUND` → offre inexistante
- `409 CONFLICT` → déjà en favoris

### `DELETE /api/v1/favorites/:offerId`
Retirer une offre des favoris.

---

## 5. Admin (rôle ADMIN requis)

Tous les endpoints sous `/api/v1/admin/*` :
- Exigent un token JWT valide.
- Vérifient `role === "ADMIN"`.
- Retournent `403 FORBIDDEN` sinon.

### Utilisateurs

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | Liste des utilisateurs |
| `PATCH` | `/admin/users/:id` | Modifier (rôle, is_active) |
| `DELETE` | `/admin/users/:id` | Supprimer |

### Offres

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/offers` | Liste complète (incluant inactives) |
| `POST` | `/admin/offers` | Créer une offre |
| `PATCH` | `/admin/offers/:id` | Modifier une offre |
| `DELETE` | `/admin/offers/:id` | Supprimer une offre |

---

## 6. Limites de débit (rate limiting)

| Endpoint | Limite |
|---|---|
| `POST /auth/login` | 5 / min / IP (anti brute-force) |
| `POST /auth/register` | 3 / min / IP |
| `POST /chat` | 30 / min / utilisateur |
| Autres endpoints | 100 / min / utilisateur |

En mode développement (`NODE_ENV=development`), le rate limiter est **désactivé** pour ne pas bloquer l'équipe pendant le debug.

---

## 7. Exemples avec curl

### Inscription + connexion + recherche

```bash
BASE=localhost:3000/api/v1

# 1. Inscription
curl -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Test1234!","passwordConfirm":"Test1234!"}'

# 2. Connexion → récupération du token
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  | jq -r '.access_token')

# 3. Recherche d'offres
curl $BASE/jobs?contract=STAGE \
  -H "Authorization: Bearer $TOKEN"

# 4. Chatbot
curl -X POST $BASE/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"alternance react à Lyon"}'
```

---

## 8. Versionning

L'API est versionnée par préfixe d'URL (`/api/v1/...`). Toute modification cassant la rétrocompatibilité ouvre une nouvelle version (`/api/v2/...`). Les anciennes versions sont maintenues 6 mois après dépréciation.
