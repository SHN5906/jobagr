# Équipe — Organisation & workflow

> Adresse les critères : **Project Communication** · **Code Quality (organisation)**

---

## 1. Composition de l'équipe

| Membre | Rôle principal | Contributions |
|---|---|---|
| **Sohan** | Frontend lead | Site web React, design system, chatbot widget |
| **Rayane** | Backend & Cybersécurité | API REST, authentification JWT, RBAC, base de données |
| **Fael** | Backend Validation | Erreurs structurées, rate limiting, validators |
| **Liam** | Data & IA | Pipeline d'ingestion, extraction NLP, normalisation |

---

## 2. Workflow Git

### 2.1 Branches

```
main                  # branche stable, toujours déployable
├── feat/frontend-*   # features front (Sohan)
├── feat/backend-*    # features back (Rayane / Fael)
├── feat/data-*       # pipeline et IA (Liam)
└── fix/*             # correctifs urgents
```

**Règle d'or :** personne ne push directement sur `main`. Tout passe par PR.

### 2.2 Conventions de commit

Format : `<type>(<scope>): <description>`

| Type | Quand l'utiliser |
|---|---|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation uniquement |
| `perf:` | Amélioration de performance |
| `refactor:` | Refacto sans changement fonctionnel |
| `test:` | Ajout / modification de tests |
| `chore:` | Outillage, config, dépendances |

**Exemples réels du projet :**
- `feat(chatbot): add floating chat assistant (POST /api/v1/chat)`
- `fix(dev): disable rate limiter in development mode`
- `perf(data): add missing indexes on offers table`
- `docs(data): expand data decisions with Why/How/Trade-off`

### 2.3 Code review

| Règle | Détail |
|---|---|
| **Au moins 1 reviewer** | Personne ne merge sa propre PR |
| **CI verte obligatoire** | Lint + build + tests doivent passer |
| **Pas de TODO bloquant** | Si un TODO reste, créer une issue de suivi |
| **Description claire** | Quoi + pourquoi, pas juste « cf. ticket » |

---

## 3. GitHub Project (gestion de tâches)

### 3.1 Board Kanban

4 colonnes :

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Backlog  │  │ In       │  │ In       │  │ Done     │
│          │  │ Progress │  │ Review   │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

Une tâche passe par les 4 étapes. Pas de raccourci.

### 3.2 Swimlanes (lignes par couche)

| Swimlane | Responsable principal |
|---|---|
| Frontend | Sohan |
| Backend | Rayane + Fael |
| Data | Liam |
| DevOps | Rotation |

### 3.3 Milestones

Le projet a été découpé en 5 milestones (1 par semaine) :

| Milestone | Objectif |
|---|---|
| M1 — Setup | Repo, specs, GitHub Project, README initial |
| M2 — Fondations | Base de données, auth, premières pages |
| M3 — Construction | Pages principales, API complète |
| M4 — Intelligence | Pipeline d'ingestion, IA, chatbot |
| M5 — Finitions | Tests, perfs, démo, doc finale |

---

## 4. Communication

### 4.1 Synchrones

| Format | Fréquence | Sujet |
|---|---|---|
| Daily stand-up | Tous les jours, 15 min | Ce que j'ai fait, ce que je fais, ce qui me bloque |
| Visio équipe | 2× par semaine | Décisions techniques, démos intermédiaires |
| Sessions à 2 | Au besoin | Pair-programming sur des points complexes |

### 4.2 Asynchrones

- **Discord** : canal projet, partage de liens, ping rapide.
- **GitHub Discussions** : décisions structurantes (ADRs).
- **PRs** : tout debate technique trace écrite via les commentaires.

### 4.3 Exemples concrets de déblocage

| Situation | Solution apportée | Bénéficiaire |
|---|---|---|
| Sohan a besoin du format des erreurs côté front | Fael écrit le contrat `{ code, message, fields }` dans une doc partagée | Sohan |
| Rayane galère à seed Postgres en local | Mise en place du double schéma Prisma (SQLite dev) | Toute l'équipe |
| Sohan bloqué toutes les 30 s par le rate limiter | Fael conditionne le middleware sur `NODE_ENV` | Toute l'équipe (½ journée gagnée) |
| Liam doit tester l'ingestion sans Postgres | Mocks Prisma + WLD pour la CI | Liam + CI |

---

## 5. Répartition du travail

### 5.1 Diagramme

```
                        ┌─────────────────┐
                        │     JOBRYX      │
                        └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
       ┌────▼─────┐        ┌─────▼─────┐        ┌─────▼─────┐
       │ FRONTEND │        │  BACKEND  │        │   DATA    │
       │  Sohan   │        │ Rayane +  │        │   Liam    │
       │          │        │   Fael    │        │           │
       └──────────┘        └───────────┘        └───────────┘
            │                    │                    │
            │  ◄── Contrats ───► │                    │
            │     d'API          │ ◄── Schéma DB ───► │
            │                    │                    │
            └────────────────────┴────────────────────┘
                            DevOps
                          (rotation)
```

### 5.2 Répartition fine

| Bloc | Sohan | Rayane | Fael | Liam |
|---|:-:|:-:|:-:|:-:|
| Pages React | ✅ | | | |
| Design system | ✅ | | | |
| Chatbot widget (UI) | ✅ | | | |
| Auth / JWT | | ✅ | | |
| Base de données / Prisma | | ✅ | | |
| RBAC | | ✅ | | |
| Validation des inputs | | | ✅ | |
| Erreurs structurées | | | ✅ | |
| Rate limiting | | | ✅ | |
| Pipeline d'ingestion | | | | ✅ |
| Normalisation | | | | ✅ |
| Service IA (RAKE) | | | | ✅ |
| Chatbot parser (backend) | | | | ✅ |
| CI / Tests data | | | | ✅ |
| Docker Compose | | ✅ | | |
| Documentation | ✅ | ✅ | ✅ | ✅ |

---

## 6. Méthodologie

### 6.1 Inspirée de Scrum (allégée)

- **Sprints d'1 semaine** alignés sur les milestones.
- **Daily stand-up** chaque jour.
- **Revue de sprint** le vendredi : démo de ce qui a été fait.
- **Rétrospective** : 15 min pour identifier ce qui doit changer.

### 6.2 Pourquoi pas Scrum strict ?

- Équipe de 4 étudiants, pas besoin de Product Owner ni Scrum Master dédiés.
- Pas de client externe → pas de backlog mouvant.

### 6.3 Pourquoi pas Kanban pur ?

- Le projet a des échéances fixes → besoin de cadencement par sprint.

---

## 7. Outillage

| Outil | Usage |
|---|---|
| GitHub | Source of truth (code, issues, projects, actions) |
| GitHub Project | Tableau Kanban + milestones |
| Discord | Communication async |
| Visual Studio Code | IDE principal (extensions partagées via `.vscode/`) |
| Postman | Tests d'API manuels |
| Figma | Maquettes (avant code) |
| Lighthouse | Audit performance frontend |
| autocannon | Benchmark backend |

---

## 8. Pratiques de qualité

### 8.1 Avant chaque commit

- [ ] Code formaté (`npm run format`)
- [ ] Lint sans erreurs (`npm run lint`)
- [ ] Tests passent localement (`npm test`)
- [ ] Pas de console.log oublié
- [ ] Pas de secret hardcodé

### 8.2 Avant chaque PR

- [ ] Titre conforme aux conventions (`feat:`, `fix:`, etc.)
- [ ] Description : quoi + pourquoi
- [ ] Captures d'écran si UI changée
- [ ] Migration DB testée localement si schéma modifié
- [ ] Doc mise à jour si l'API change

### 8.3 Avant chaque merge

- [ ] CI verte
- [ ] Au moins 1 approbation
- [ ] Conflits résolus
- [ ] Commits squashed si la PR a beaucoup d'allers-retours

---

## 9. Statistiques contributions

Depuis le début du projet :

| Membre | Commits |
|---|---|
| Sohan | 33 |
| Rayane | 20 |
| Liam | 16 |
| Fael | 15 |
| **Total** | **84** |

Vue par auteur sur 5 semaines, distribution équilibrée selon le périmètre de responsabilité.

---

## 10. Leçons apprises (continuous improvement)

### 10.1 Ce qui a bien marché

- Le double schéma Prisma (SQLite dev / Postgres prod) → onboarding fluide.
- Code reviews systématiques → 0 régression majeure mergée.
- Contrats d'API écrits AVANT le code → moins d'aller-retours.

### 10.2 Ce qu'on aurait dû faire différemment

- Documentation écrite trop tard. Sur le prochain projet : doc en parallèle du code.
- Tests E2E (Playwright) repoussés en fin de projet → on aurait dû commencer en semaine 2.
- Pas de revue de design Figma → quelques refacto UI tardives auraient pu être évitées.

### 10.3 Pour la suite

- Mettre en place un **journal d'incidents** (`docs/incidents/`).
- Définir un **standard de tests E2E** dès le sprint 1.
- Ajouter une étape de **revue de design** avant chaque sprint d'implémentation.
