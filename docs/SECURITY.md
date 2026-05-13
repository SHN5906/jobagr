# Sécurité — Modèle de menaces & contre-mesures

> Adresse le critère : **Security Practices**

---

## 1. Approche : defense in depth

Le principe : **empiler plusieurs couches indépendantes**. Si une couche tombe, les autres tiennent. Aucune ne suffit seule.

```
┌────────────────────────────────────────────┐
│ 1. HTTPS / TLS (en prod via reverse proxy) │
├────────────────────────────────────────────┤
│ 2. CORS strict (whitelist d'origines)      │
├────────────────────────────────────────────┤
│ 3. Helmet (headers HTTP sûrs)              │
├────────────────────────────────────────────┤
│ 4. Rate limiting (anti brute-force / DOS)  │
├────────────────────────────────────────────┤
│ 5. Validation des inputs (express-validator)│
├────────────────────────────────────────────┤
│ 6. JWT signé + expiration courte           │
├────────────────────────────────────────────┤
│ 7. bcrypt (mots de passe hashés + salés)   │
├────────────────────────────────────────────┤
│ 8. RBAC (séparation USER / ADMIN)          │
├────────────────────────────────────────────┤
│ 9. Prisma (paramétrage SQL, anti-injection)│
├────────────────────────────────────────────┤
│ 10. Secrets en variables d'env (jamais code)│
└────────────────────────────────────────────┘
```

---

## 2. Authentification

### 2.1 Stockage des mots de passe

| Aspect | Implémentation |
|---|---|
| Algorithme | **bcrypt** |
| Coût | **12 rounds** |
| Sel | Intégré automatiquement par bcrypt |
| Plain-text en DB | **Jamais** |
| Plain-text en logs | **Jamais** |

**Pourquoi bcrypt 12 rounds ?**
- 12 = ~150 ms par hash sur CPU moderne. Trop lent pour bruteforce, transparent pour l'UX.
- bcrypt résiste aux GPU mieux que SHA-256 (memory-hard).
- Standard industriel (OWASP recommandation).

### 2.2 Tokens JWT

| Paramètre | Valeur | Justification |
|---|---|---|
| Algorithme | HS256 | Symétrique, suffisant pour un service monolithique |
| Secret | 64 bytes aléatoires (env `JWT_SECRET`) | Force cryptographique |
| Durée de vie | **15 minutes** | Limite la fenêtre d'exploitation en cas de vol |
| Stockage côté front | Memory + localStorage fallback | Compromis XSS / DX |
| Renouvellement | Non implémenté (MVP) | Dette technique documentée |

### 2.3 Politique de mot de passe

Validation **côté serveur ET côté client** :

| Règle | Raison |
|---|---|
| 8 caractères minimum | Anti-bruteforce de base |
| 1 majuscule + 1 minuscule | Augmente l'entropie |
| 1 chiffre | Augmente l'entropie |
| 1 caractère spécial | Augmente l'entropie |

**Entropie résultante** : ~52 bits min, ~80 bits moyen. Acceptable pour un compte utilisateur.

### 2.4 Pourquoi double validation ?

- **Côté client** : UX immédiate (feedback live).
- **Côté serveur** : **vraie** sécurité (impossible de contourner).

Ne jamais faire confiance au client. Tout est revérifié côté serveur.

---

## 3. Autorisation (RBAC)

### 3.1 Modèle

Deux rôles :
- `USER` : peut lire les offres, gérer ses favoris.
- `ADMIN` : tout ce que peut faire USER + gestion d'utilisateurs + CRUD des offres.

### 3.2 Implémentation

Middleware Express :
```ts
// middleware/requireAdmin.ts
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Admin only' }
    });
  }
  next();
}
```

Appliqué à toutes les routes `/api/v1/admin/*` :
```ts
router.use('/admin', authMiddleware, requireAdmin, adminRoutes);
```

### 3.3 Tests de pénétration manuels effectués

| Scénario | Résultat |
|---|---|
| USER essaie d'accéder à `/admin/users` | 403 FORBIDDEN ✓ |
| USER modifie son rôle dans le JWT (signature invalide) | 401 UNAUTHORIZED ✓ |
| USER désactivé (`is_active = false`) essaie de se connecter | 401 UNAUTHORIZED ✓ |
| Token expiré utilisé sur endpoint protégé | 401 UNAUTHORIZED ✓ |

---

## 4. Protection contre les attaques classiques

### 4.1 Injection SQL

**Mitigation :** utilisation exclusive de **Prisma ORM** avec requêtes paramétrées.

```ts
// SÉCURISÉ — Prisma paramètre automatiquement
const offers = await prisma.offer.findMany({
  where: { title: { contains: userInput } }
});
```

Pas d'utilisation de requêtes SQL brutes avec interpolation utilisateur.

### 4.2 XSS (Cross-Site Scripting)

**Mitigations :**
- **React échappe automatiquement** tout texte rendu via `{variable}`.
- Pas d'injection HTML brut dans le DOM (l'API React qui le permettrait est interdite par convention).
- **Helmet** active la CSP (Content Security Policy).
- Validation stricte des inputs côté serveur (longueur max, regex).

### 4.3 CSRF (Cross-Site Request Forgery)

**Mitigation :** API stateless basée sur JWT en header `Authorization`, **pas de cookies**.
→ Une page malveillante ne peut pas piéger le navigateur à envoyer le token.

### 4.4 Brute-force

**Mitigation :** rate limiter sur les endpoints sensibles :

| Endpoint | Limite |
|---|---|
| `POST /auth/login` | 5 / min / IP |
| `POST /auth/register` | 3 / min / IP |

Au-delà : `429 RATE_LIMITED`.

### 4.5 Énumération d'utilisateurs

Sur `POST /auth/login`, on retourne **toujours** `401 UNAUTHORIZED` que l'email existe ou non. Pas de distinction entre « email inexistant » et « mot de passe faux ».

### 4.6 Headers HTTP sûrs (Helmet)

Activé par défaut :

| Header | Effet |
|---|---|
| `Content-Security-Policy` | Restreint les sources de scripts |
| `Strict-Transport-Security` | Force HTTPS pendant 1 an |
| `X-Content-Type-Options: nosniff` | Empêche le MIME-sniffing |
| `X-Frame-Options: DENY` | Anti-clickjacking |
| `Referrer-Policy: no-referrer` | Préserve la vie privée |

### 4.7 CORS

```ts
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: false
}));
```

- Whitelist explicite via variable d'env.
- Pas de wildcard `*` même en dev.
- En prod : seul le domaine officiel du site est autorisé.

---

## 5. Gestion des secrets

### 5.1 Règles

1. **Aucun secret dans le code source.** Tout passe par variables d'environnement.
2. **`.env` jamais commit.** Ajouté au `.gitignore` à la création du repo.
3. **`.env.example` fourni** avec des placeholders pour onboarder un nouveau dev.
4. **Rotation prévue** : `JWT_SECRET` à régénérer si compromission suspectée.

### 5.2 Variables sensibles

| Variable | Usage | Forme attendue |
|---|---|---|
| `JWT_SECRET` | Signature des tokens | 64 bytes aléatoires (`openssl rand -hex 64`) |
| `DB_PASSWORD` | Mot de passe Postgres | Aléatoire, long |
| `BCRYPT_ROUNDS` | Coût du hash | 12 |
| `WLD_API_KEY` | Accès WeLoveDevs | Fourni par leur dashboard |
| `CORS_ORIGINS` | Whitelist CORS | URLs autorisées séparées par virgule |

### 5.3 Audit du repo

Vérifications effectuées avant chaque push :
```bash
git secrets --scan          # scan d'anti-patterns connus
```

Aucun secret n'a été commit historiquement. Audit confirmé.

---

## 6. Failles connues et roadmap

| Faille | Sévérité | État | Mitigation prévue |
|---|---|---|---|
| Pas de refresh token | Faible (UX > sécu) | Connu | Phase 2 : rotation refresh tokens |
| Pas de 2FA | Moyen | Connu | Phase 2 : TOTP optionnel |
| Pas d'audit log admin | Moyen | Connu | Phase 2 : table `audit_logs` |
| Pas de détection d'anomalies (login depuis pays inhabituel) | Faible | Connu | Phase 3 |
| HTTPS non implémenté en local | Faible (env local) | Accepté | Reverse proxy en prod (Caddy/Nginx) |

---

## 7. Procédure en cas d'incident

### 7.1 Si un secret est compromis

1. Régénérer immédiatement le secret (`openssl rand -hex 64`).
2. Mettre à jour la variable d'env en prod.
3. Redémarrer le service backend → invalide tous les tokens existants.
4. Avertir les utilisateurs (s'il y a vraiment exposition de comptes).

### 7.2 Si une vulnérabilité critique est découverte

1. Évaluer la sévérité (CVSS).
2. Patch immédiat si exploitable à distance.
3. Notification utilisateurs si données personnelles touchées.
4. Post-mortem écrit dans `docs/incidents/` (à créer).

---

## 8. Conformité

### 8.1 RGPD (UE)

| Exigence | Statut |
|---|---|
| Données personnelles minimisées (email + username) | ✓ |
| Mots de passe hashés (jamais stockés en clair) | ✓ |
| Droit à la suppression (`DELETE /api/v1/users/me`) | À implémenter (phase 2) |
| Droit à l'export | À implémenter (phase 2) |
| CGU et politique de confidentialité | À rédiger avant mise en prod |

### 8.2 OWASP Top 10 (2021)

| Risque OWASP | Couvert ? | Comment |
|---|---|---|
| A01 — Broken Access Control | ✓ | RBAC + tests |
| A02 — Cryptographic Failures | ✓ | bcrypt + JWT signé |
| A03 — Injection | ✓ | Prisma ORM, validation |
| A04 — Insecure Design | Partiel | Threat modeling documenté ici |
| A05 — Security Misconfiguration | ✓ | Helmet + CORS + env vars |
| A06 — Vulnerable Components | ✓ | `npm audit` en CI |
| A07 — Identification & Authentication Failures | ✓ | Rate limit, bcrypt, JWT court |
| A08 — Software & Data Integrity Failures | Partiel | Pas de signature des artifacts |
| A09 — Security Logging & Monitoring | À faire | Logs structurés prévus phase 2 |
| A10 — Server-Side Request Forgery | N/A | Pas de proxy URL utilisateur |

---

## 9. Démonstration de compréhension

Chaque mesure est volontaire et discutée. L'équipe sait répondre à :

- *« Pourquoi bcrypt et pas SHA-256 ? »* → memory-hard, résistant aux GPU.
- *« Pourquoi 12 rounds ? »* → équilibre sécurité / latence (~150 ms).
- *« Pourquoi 15 min de JWT ? »* → limite la fenêtre d'exploitation.
- *« Pourquoi pas de cookies pour le JWT ? »* → évite CSRF.
- *« Pourquoi Helmet et CORS sont nécessaires ensemble ? »* → ils protègent contre des classes d'attaques différentes (headers vs. origines).
