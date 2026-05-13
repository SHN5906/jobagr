# Product — Cible, valeur, positionnement

> Adresse les critères : **Product Understanding** · **Product Value & Positioning**

---

## 1. Le problème

### 1.1 Constat

Chercher un emploi tech en 2025, c'est :

- **15 à 20 sources fragmentées** : LinkedIn, Indeed, Welcome to the Jungle, WeLoveDevs, Hellowork, Jobteaser, AppliEpitech, sites carrières individuels…
- **Données incohérentes** : salaires absents 6 fois sur 10, types de contrat formulés en 4-5 manières différentes (« CDI », « contrat à durée indéterminée », « permanent », « full-time »), descriptions truffées de HTML mal nettoyé.
- **Filtres rigides** : la recherche se fait par mots-clés exacts, pas par intention. « Stage React Paris » force à cliquer 3 menus différents.
- **Aucune intelligence sémantique** : impossible de demander « offres de dev junior avec du télétravail partiel ».

### 1.2 Quantification

Estimation moyenne d'un étudiant Epitech en recherche active de stage :
- **45 minutes/jour** passées à parcourir les sites
- **18 onglets ouverts** simultanément en moyenne
- **65 %** des candidatures envoyées finissent sans réponse parce que mal ciblées

> Sources : sondage interne mené auprès de 32 étudiants B1/B2 (avril 2026), comparaison qualitative avec les indicateurs publics de LinkedIn Talent Insights et France Travail.

---

## 2. La cible

### 2.1 Persona principal — « Léa, étudiante en recherche de stage »

| Attribut | Valeur |
|---|---|
| Âge | 19-22 ans |
| Profil | Étudiant·e tech (Epitech, école d'ingé, université info) |
| Contexte | Recherche de stage / alternance · 2-3 candidatures par jour |
| Tech literacy | Élevée — habitué·e à utiliser plusieurs outils |
| Frustration principale | « Je perds 80 % de mon temps à dédupliquer entre sites » |
| Critère de décision | Rapidité, données complètes (salaire affiché), pertinence |
| Device | 65 % desktop, 35 % mobile |

### 2.2 Persona secondaire — « Marc, jeune diplômé »

| Attribut | Valeur |
|---|---|
| Âge | 22-25 ans |
| Profil | Bac+3 à Bac+5 — premier CDI |
| Contexte | Recherche active, 6-10 candidatures par semaine |
| Frustration principale | « Aucun outil ne croise stack technique et salaire » |
| Critère de décision | Adéquation des compétences, qualité de l'entreprise |

### 2.3 Hors-cible (explicite)

- **Profils non-tech** : Jobryx ne couvre que les annonces dev / data / DevOps / cyber.
- **Recruteurs** : on ne propose pas (encore) de portail employeur.
- **Profils seniors (10+ ans)** : leur recherche passe surtout par cooptation et chasse.

---

## 3. Proposition de valeur

### 3.1 La promesse en une phrase

> **Trouver une offre tech pertinente en 30 secondes au lieu de 30 minutes**, en parlant en français normal.

### 3.2 Les 4 piliers de valeur

| Pilier | Bénéfice utilisateur | Mécanisme technique |
|---|---|---|
| **Agrégation** | Un seul site au lieu de 15 | Pipeline d'ingestion automatique |
| **Données propres** | Salaires affichés, contrats homogènes | Couche de normalisation (cf. [DATA.md](DATA.md)) |
| **Intelligence sémantique** | Recherche en langage naturel | Chatbot avec extraction d'intention |
| **Compétences mises en avant** | Vue immédiate des technos demandées | Extraction NLP avec RAKE |

### 3.3 Anti-valeurs (ce qu'on ne fait PAS)

- Pas de recommandations algorithmiques opaques type LinkedIn.
- Pas de tracking comportemental ni de publicité.
- Pas de paywall — l'accès aux offres reste gratuit.

---

## 4. Positionnement

### 4.1 Tableau comparatif

| Critère | Jobryx | LinkedIn | Indeed | Welcome to the Jungle | WeLoveDevs |
|---|---|---|---|---|---|
| Spécialisé tech | ✅ | ❌ | ❌ | ⚠️ partiel | ✅ |
| Recherche en langage naturel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Salaire normalisé | ✅ | ❌ | ⚠️ partiel | ⚠️ partiel | ✅ |
| Extraction des skills | ✅ | ⚠️ tags manuels | ❌ | ⚠️ tags manuels | ✅ |
| Sans tracking publicitaire | ✅ | ❌ | ❌ | ❌ | ✅ |
| Open source | ✅ | ❌ | ❌ | ❌ | ❌ |

### 4.2 Notre niche

Jobryx se positionne sur **l'intersection de trois axes**:
1. **Spécialisation tech** (vs. généralistes comme Indeed)
2. **Recherche intelligente** (vs. filtres rigides classiques)
3. **Données ouvertes et propres** (vs. silos propriétaires)

### 4.3 Hypothèses de succès

| Hypothèse | Comment on la teste |
|---|---|
| Les étudiants préfèrent la recherche en langage naturel | Taux d'utilisation du chatbot vs. filtres classiques |
| La normalisation des salaires augmente la confiance | Taux de clic sur les offres avec salaire vs. sans |
| L'extraction de skills réduit le temps de tri | Temps moyen entre arrivée sur le site et clic sur une offre |

---

## 5. Roadmap produit

### Phase 1 — MVP (livré)
- Agrégation d'une source (WeLoveDevs)
- Recherche par filtres + chatbot
- Comptes utilisateurs avec favoris
- Dashboard analytique (skills, salaires, contrats)

### Phase 2 — Court terme (3 mois)
- 2 sources supplémentaires (Indeed, Welcome to the Jungle)
- Alertes email personnalisées
- Connexion OAuth (Google, GitHub)

### Phase 3 — Moyen terme (6 mois)
- IA spécialisée sur le vocabulaire tech (fine-tuning)
- Score de pertinence personnalisé par profil
- Application mobile (PWA → React Native)

### Phase 4 — Long terme
- Portail employeur (publication d'offres)
- API publique pour intégrations tierces
- Internationalisation (EN, ES, DE)

---

## 6. Métriques produit suivies

| Métrique | Objectif | Source |
|---|---|---|
| Time-to-first-click | < 30 s | Logs front |
| Offres actives | > 200 | Base de données |
| Couverture salaire | > 60 % | Base de données |
| Précision du chatbot (intention extraite correcte) | > 85 % | Tests sur jeu d'évaluation |
| Taux de rebond | < 40 % | Analytics |

Détails et benchmarks → [PERFORMANCE.md](PERFORMANCE.md).
