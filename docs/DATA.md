# Data — Pipeline, schéma, IA

> Adresse les critères : **Data Preparation Strategy** · **Data Analysis** · **Algorithmic Implementation**

---

## 1. Vue d'ensemble du pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  WeLoveDevs  │───►│ Normalisation│───►│   IA RAKE    │───►│  PostgreSQL  │
│     API      │    │ (HTML, prix, │    │  (keywords)  │    │   (offers)   │
│  1 req/sec   │    │  contrats)   │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                    │                   │
       ▼                   ▼                    ▼                   ▼
    20 offres         données propres      tags extraits      offres servies
    par page          + schéma unifié      ["react", "ts"]    au site + chatbot
```

---

## 2. Sources de données

### 2.1 WeLoveDevs API (source principale)

| Attribut | Valeur |
|---|---|
| Endpoint | API publique WeLoveDevs |
| Authentification | API key (env : `WLD_API_KEY`) |
| Throttling | **1 requête / seconde** (limite imposée par WLD) |
| Pagination | 20 offres par page |
| Fréquence d'ingestion | 1× par heure (configurable) |

### 2.2 Pourquoi WeLoveDevs ?

- **Spécialisé tech** : 90 % du contenu est dev/data/devops, peu de bruit.
- **Données structurées** : champs typés contrairement aux scrapes HTML.
- **API officielle** : pas de zone grise légale (vs. scraping LinkedIn).

### 2.3 Sources futures

| Source | Priorité | Difficulté |
|---|---|---|
| Indeed | Haute | Moyenne (API limitée, scraping possible) |
| Welcome to the Jungle | Haute | Élevée (pas d'API publique) |
| France Travail | Moyenne | Faible (API gouvernementale gratuite) |
| Hellowork | Basse | Moyenne |

---

## 3. Schéma de données

### 3.1 Diagramme entité-relation

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │   1:N   │  Favorite    │   N:1   │    Offer    │
├─────────────┤────────►├──────────────┤◄────────├─────────────┤
│ id          │         │ id           │         │ id          │
│ email       │         │ user_id      │         │ title       │
│ username    │         │ offer_id     │         │ company     │
│ password_h. │         │ created_at   │         │ location    │
│ role        │         └──────────────┘         │ work_mode   │
│ is_active   │                                  │ contract    │
│ created_at  │                                  │ salary      │
└─────────────┘                                  │ tags[]      │
                                                 │ score       │
┌─────────────────┐                              │ is_active   │
│ IngestionLog    │                              │ source      │
├─────────────────┤                              │ posted_at   │
│ id              │                              │ created_at  │
│ source          │                              └─────────────┘
│ started_at      │
│ ended_at        │
│ offers_added    │
│ offers_updated  │
│ errors          │
└─────────────────┘
```

### 3.2 Détail des champs `Offer`

| Champ | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | non | Identifiant unique |
| `title` | String | non | Titre de l'offre |
| `company` | String | non | Nom de l'entreprise |
| `location` | String | non | Ville (normalisée) |
| `work_mode` | String | non | `onsite` · `hybrid` · `remote` |
| `contract` | Enum | non | `CDI` · `STAGE` · `ALTERNANCE` · `FREELANCE` |
| `salary` | String | oui | Format normalisé (cf. §4.3) |
| `tags` | String[] | non | Mots-clés extraits par l'IA |
| `score` | Int | non | Score de fraîcheur (cf. §6) |
| `is_active` | Boolean | non | Soft-delete |
| `source` | String | oui | `WeLoveDevs`, `Indeed`, etc. |
| `posted_at` | DateTime | non | Date de publication originale |
| `created_at` | DateTime | non | Date d'ingestion |

### 3.3 Index SQL

Pour optimiser les requêtes les plus fréquentes :

```sql
CREATE INDEX idx_offers_active_posted ON offers(is_active, posted_at DESC);
CREATE INDEX idx_offers_contract     ON offers(contract);
CREATE INDEX idx_offers_location     ON offers(location);
```

**Justification :** la requête principale du dashboard est :
```sql
SELECT * FROM offers WHERE is_active = true ORDER BY posted_at DESC LIMIT 20;
```
Sans l'index composite, c'est un scan complet à chaque chargement. Avec, c'est une lecture indexée → **gain mesuré ×10**.

→ Voir [PERFORMANCE.md](PERFORMANCE.md) pour les benchmarks.

---

## 4. Normalisation

Les offres brutes sont sales. Voici les transformations appliquées.

### 4.1 Pourquoi normaliser ?

Sans normalisation :
- 18 % des descriptions contiennent du HTML mal échappé (`<p>`, `&amp;`, etc.).
- 12 manières différentes d'écrire « stage » : `Stage`, `internship`, `Intern`, `Stagiaire`, `apprenticeship 6 mois`, etc.
- Salaires en string libre : `"30k€"`, `"30 000"`, `"30000 EUR"`, `"selon profil"`.

Résultat : impossible de filtrer correctement, agrégations cassées.

### 4.2 Détail par champ

| Champ entrant | Problème | Solution |
|---|---|---|
| `description` | HTML : `<p>Bonjour &amp; bienvenue</p>` | Strip tags + décodage entités HTML → `"Bonjour & bienvenue"` |
| `contractType` | Strings hétérogènes : `"internship"`, `"Stage"`, `"VIE"` | Mapping vers enum unifié (cf. table ci-dessous) |
| `salary` | Format libre : `"30 000 €/an"`, `30000`, `"selon profil"` | Parser regex → entier ou `null` |
| `location` | Variations : `"Paris 11ème"`, `"Paris, France"` | Normalisation à la ville principale → `"Paris"` |
| `posted_at` | Formats variés ISO / `"il y a 3 jours"` | Parser flexible → `DateTime` |

### 4.3 Table de mapping des contrats

| Entrée WLD | Sortie unifiée |
|---|---|
| `internship`, `intern`, `Stage`, `Stagiaire` | `STAGE` |
| `apprenticeship`, `alternance`, `contrat pro` | `ALTERNANCE` |
| `permanent`, `CDI`, `full-time` | `CDI` |
| `freelance`, `mission`, `tjm`, `contractor` | `FREELANCE` |
| `VIE`, `volunteer`, `temporary` | `OTHER` (filtré par défaut) |

### 4.4 Alternatives rejetées

| Alternative | Pourquoi rejetée |
|---|---|
| *Stocker les données brutes telles quelles* | Filtrage côté front impossible, perf catastrophique |
| *Faire la normalisation à la volée à chaque requête* | CPU gaspillé, latence ×3 |
| *Utiliser un service externe (Apify, Diffbot)* | Coût, dépendance externe, latence réseau |

---

## 5. Chatbot — Extraction d'intention

Le chatbot accepte une phrase en français/anglais et en extrait jusqu'à 3 critères : `keyword`, `location`, `contractType`.

### 5.1 Algorithme

1. **Suppression des stop-words** (liste de ~40 mots : « je », « cherche », « offre »…).
2. **Détection du type de contrat** via patterns regex sur 4 contrats :
   - `STAGE` ← `stage|internship|intern|stagiaire`
   - `ALTERNANCE` ← `alternance|alternant|apprentissage|apprenticeship`
   - `FREELANCE` ← `freelance|free-lance|mission|tjm`
   - `CDI` ← `cdi`
3. **Détection de la ville** :
   - Pattern « à/a/en + Mot » → première capture.
   - Sinon, recherche dans une liste de 16 villes connues.
4. **Mot-clé restant** : ce qui n'est ni stop-word, ni contrat, ni ville.

### 5.2 Exemples

| Phrase | Sortie |
|---|---|
| « stage React à Paris » | `{ keyword: "react", location: "Paris", contractType: "STAGE" }` |
| « je cherche un cdi remote » | `{ keyword: null, location: "Remote", contractType: "CDI" }` |
| « mission freelance node.js » | `{ keyword: "node.js", location: null, contractType: "FREELANCE" }` |

### 5.3 Pourquoi pas un LLM ?

- Latence : LLM ≈ 800 ms, RAKE/regex ≈ 50 ms.
- Coût : LLM ≈ $0.001/requête × 50k requêtes/mois = $50/mois. Notre solution = $0.
- Précision : pour un cas d'usage aussi structuré (3 entités), un système à règles est compétitif.

**Trade-off documenté :** sur les phrases ambiguës (« je veux quelque chose en informatique »), notre extracteur retourne souvent `keyword=null`. Un LLM ferait mieux. C'est dans la roadmap.

---

## 6. Extraction de mots-clés (skills)

### 6.1 Algorithme : RAKE-NLTK

RAKE = *Rapid Automatic Keyword Extraction*. Algorithme à base de fréquence + co-occurrence, sans modèle entraîné.

**Pipeline :**
```
Description brute
  → tokenisation
  → suppression des stop-words FR + EN
  → groupement par phrases
  → score = fréquence(mot) / longueur(phrase)
  → top N mots-clés
```

### 6.2 Exemple

**Entrée :**
> « Nous cherchons un développeur React confirmé avec une bonne maîtrise de TypeScript et Docker. Expérience en CI/CD appréciée. »

**Sortie :**
```json
["react", "typescript", "docker", "ci/cd", "développeur"]
```

### 6.3 Optimisation : skip-if-exists

**Problème observé :** au début, on relançait RAKE sur **toutes** les offres à chaque ingestion. ~200 ms × N offres = 3+ min pour 1000 offres.

**Solution :** on regarde si l'offre a déjà été ingérée (par `external_id` + `source`). Si oui, on saute l'IA et on rafraîchit uniquement les champs volatiles (`is_active`, `score`).

**Gain mesuré :** ingestion ~10× plus rapide à régime stable (seules les nouvelles offres déclenchent l'IA).

### 6.4 Performance

| Métrique | Valeur |
|---|---|
| Empreinte mémoire | < 50 Mo |
| Latence p50 | 120 ms / offre |
| Latence p95 | 200 ms / offre |
| Précision (mesurée sur 100 offres annotées) | 78 % |

→ Méthodologie complète → [PERFORMANCE.md §3](PERFORMANCE.md#3-évaluation-de-lia).

---

## 7. Score de pertinence

Chaque offre a un champ `score` calculé à l'ingestion :

```
score = 100
      - (jours_depuis_publication × 2)    # fraîcheur
      + (10 si salaire renseigné)         # complétude
      + (5 si tags.length >= 3)           # richesse
```

Plage : 0 à 100. Une offre publiée aujourd'hui avec salaire et 3+ tags = score ≈ 115 (capé à 100).

**Usage :** tri par défaut sur le dashboard, pondération possible dans la recherche.

---

## 8. Tests de la couche data

Les tests tournent **sans base de données** grâce à des mocks WeLoveDevs.

### 8.1 Couverture

| Module | Fonctions testées | Cas |
|---|---|---|
| `normalizeText` | Strip HTML, décodage entités | 6 cas (entités, balises, vides) |
| `normalizeSalary` | Parse de string libre | 8 cas (k€, €/an, "selon profil"…) |
| `normalizeContractType` | Mapping vers enum | 10 cas (incluant VIE → OTHER) |
| `extractIntent` (chatbot) | Extraction des 3 critères | 12 cas (FR + EN) |
| Pipeline complet | Offre brute → DB row | 6 cas (CDI, stage, alternance, missing fields) |

### 8.2 Exemples de cas

```
"stage"           → STAGE       ✓
"internship"      → STAGE       ✓
"30 000 €"        → 30000       ✓
"<p>Bonjour</p>"  → "Bonjour"   ✓
"&amp;"           → "&"         ✓
```

À chaque push sur GitHub, ces tests s'exécutent en CI (cf. [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 9. Justification des choix de préparation

| Choix | Pourquoi | Alternative rejetée |
|---|---|---|
| Normaliser à l'ingestion (pas à la requête) | Latence p95 < 300 ms vs. > 1 s | Normalisation lazy à la lecture |
| Enum DB pour `contract` | Filtres SQL rapides + sécurité de typage | String libre |
| Tags en `String[]` (Postgres) | Recherche full-text simple | Table `OfferTag` séparée (overkill) |
| Salaire en String + parsing | Conserve la nuance (« selon profil ») | Int strict (perd de l'info) |
| Stocker `source` | Permet d'auditer la provenance | Pas de tracking (perte d'info) |
