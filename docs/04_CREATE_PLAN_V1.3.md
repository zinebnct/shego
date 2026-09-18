# SHEGO — CREATE PLAN V1.3

Réécriture complète de la spécification Create Plan, propageant les corrections du SHEGO PRODUCT BLUEPRINT V1.2.1, du SHEGO DESIGN SYSTEM V1.2.1 et de HOME V1.2.1. Propagation **ciblée** : les états de compte sont corrigés, la règle de publication liée au lieu est explicitée, la sécurité serveur est documentée. Rien d'autre n'est rouvert.

> **Le principe qui gouverne toujours cet écran, inchangé** : un seul choix est obligatoire à la main, la **catégorie**. Le lieu est obligatoire pour publier, mais préremplit automatiquement dans le cas standard — publier sans rien modifier d'autre doit produire un plan correct.

---

## 1. UX générale

*(Intégralement inchangé.)*

### Ouverture

Déclenchée par le **bouton Créer central** de la barre de navigation, unique affordance de création (Design System V1.3 §9, §11 ; Home V1.3 §5). Feuille haute (92 % de la hauteur d'écran), `radius.2xl` 28 en haut, fond Sable, poignée centrée. Voile Overlay derrière, `spring.sheet`.

**Précision V1.2.1** : le tap sur le bouton central n'ouvre **cette** feuille de création que si le compte est prêt à participer (voir §12). Dans les deux autres cas, le même bouton ouvre un écran différent, plus court — voir §12, qui fait désormais partie intégrante de cette spécification et non plus seulement de Home.

### Structure

Un seul écran, jamais de wizard. Deux phases dans le même écran : grille des 12 catégories (phase 1), puis formulaire pré-rempli une fois la catégorie choisie (phase 2, grille repliée en barre compacte).

### Fermeture, clavier, défilement, bouton Publier, abandon

*(Intégralement inchangé — voir détail en annexe si besoin, aucune contradiction identifiée avec le Blueprint V1.2.1 sur ces points.)* Croix, glissement, geste retour, tap sur le voile. Clavier : feuille à 100 % à l'ouverture, barre CTA toujours visible au-dessus. Défilement : le formulaire tient sans défilement sur 390 × 844. Abandon : modale de confirmation uniquement si un champ a été modifié à la main, aucun brouillon sauvegardé.

---

## 2. Ordre exact des champs

*(Inchangé.)*

| **#ChampObligatoireValeur par défautTaps pour le cas standard** |                 |                                                                              |                                           |       |
| --------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------- | ----------------------------------------- | ----- |
| 1                                                               | **Catégorie**   | Oui                                                                          | aucune                                    | **1** |
| 2                                                               | **Titre**       | Oui                                                                          | généré depuis la catégorie                | 0     |
| 3                                                               | **Heure**       | Oui                                                                          | `Dans 1h`                                 | 0     |
| 4                                                               | **Lieu**        | Oui (établissement/repère + quartier en priorité, quartier seul en fallback) | résolu automatiquement selon la catégorie | 0     |
| 5                                                               | **Places**      | Oui                                                                          | `4`                                       | 0     |
| 6                                                               | **Mode**        | Oui                                                                          | selon la catégorie                        | 0     |
| 7                                                               | **Description** | Non                                                                          | vide, repliée                             | 0     |

**Total du chemin le plus court, cas standard : 2 taps.** Catégorie, puis Publier — inchangé.

---

## 3. Catégorie

*(Intégralement inchangé.)* Grille 3×4, 12 catégories, tuile 108×92 (phase 1), sélection unique, repli en barre de catégorie 64 (phase 2) avec bouton `Changer`. Choisir une catégorie met à jour titre, mode, suggestions de lieu — jamais l'heure ni les places. Règle de non-écrasement des champs déjà modifiés à la main : inchangée.

---

## 4. Titre

*(Intégralement inchangé.)* Pré-rempli avec une formulation réelle et naturelle (tirée au hasard parmi 2-3 variantes par catégorie), sélection intégrale au focus, 60 caractères max, retour à la forme courte si vidé.

---

## 5. Heure

*(Intégralement inchangé.)* Raccourcis `Maintenant` / `Dans 1h` (défaut) / `Ce soir` / `Demain` / `Autre`. Résolution, sélecteur natif pour `Autre` avec bornes (présent → +90 jours), affichage de confirmation en clair sous la rangée de chips, le chip `Autre` affiche lui-même la valeur choisie une fois sélectionnée.

---

## 6. Lieu

*(Intégralement inchangé — la règle du lieu nommé en priorité, avec fallback quartier explicite et discret, reste celle validée précédemment. Reproduite ici pour mémoire, aucune modification de fond.)*

### Règle du lieu

Le lieu public affiché avant de rejoindre est, par ordre de préférence : **établissement nommé + quartier**, sinon **point de repère identifiable + quartier**. Le quartier seul reste possible mais uniquement en **fallback explicite**, jamais la valeur par défaut.

### Pré-remplissage automatique

Dès la sélection de catégorie, le champ Lieu se pré-remplit avec le lieu ou point de repère le plus proche et pertinent (résolution GPS + type de catégorie), sans ouverture de la feuille de recherche. Si rien de pertinent n'est trouvé, le champ retombe directement sur le quartier en fallback, avec une ligne d'aide en invitation douce, jamais un blocage.

### Feuille de lieu

Recherche, suggestions "À proximité" filtrées par catégorie avec distance, section "Points de repère" pour Balade/Plage, section "Quartiers" toujours accessible en dernier recours et visuellement en retrait (lien discret, pas une liste mise en avant). Aucun résultat : proposition d'utiliser le texte saisi comme point de repère, puis, plus discrète, l'option quartier seul.

---

## 7. Places

*(Inchangé — déjà aligné avec le Blueprint V1.2.1.)*

- Stepper `−`/valeur/`+`, fond Argile, hauteur 44.
- **Défaut : 4. Bornes strictement 2 à 20.**
- **Aucune option "illimité" en V1** — cette décision était déjà verrouillée avant la présente propagation (Décision 4 du document d'origine) ; elle est simplement reconfirmée ici comme cohérente avec le Blueprint V1.2.1 §3.5, qui ne mentionne plus jamais l'illimité.
- Haptique à chaque incrément, `rigid` aux bornes, boutons désactivés sans message aux extrêmes.

---

## 8. Mode de participation

*(Intégralement inchangé.)* Contrôle segmenté Direct/Sur demande, défaut contextuel par catégorie (Blueprint §3.2), ligne d'explication qui change selon la sélection, mention explicite du droit de retrait pour le mode Direct. Changement libre à tout moment, plus recalculé automatiquement une fois touché à la main.

---

## 9. Description

*(Intégralement inchangé.)* Repliée par défaut, champ multiligne 200 caractères au tap, placeholder d'exemple, se replie si vidée.

---

## 10. CTA Publier — reformulé en V1.2.1

| **PropriétéValeur** |                                     |
| ------------------- | ----------------------------------- |
| Texte               | `Publier le plan`                   |
| Couleur             | Grenat, texte blanc                 |
| Position            | Barre collante en bas de la feuille |

### Condition d'activation — explicitée, cohérente avec Blueprint V1.2.1 §10.3

**Publier devient actif dès qu'une catégorie est choisie ET qu'un lieu valide est présent.** En pratique, le lieu est prérempli automatiquement dans le parcours standard (§6), ce qui conserve l'objectif de création en \~15 secondes et le chemin à deux taps : la seconde condition est remplie sans action de l'utilisatrice dans l'immense majorité des cas.

**Si aucun lieu valide n'a pu être prérempli** (GPS refusé, aucune suggestion pertinente), le bouton reste inactif jusqu'à ce que l'utilisatrice renseigne un lieu via le champ déjà présent à l'écran (§6) — **aucun écran supplémentaire, aucun wizard**, seulement un champ qui reste à remplir dans le formulaire à écran unique. C'est la même feuille, la même position, la même interaction que dans le cas standard ; seule la valeur initiale du champ diffère.

*(Avant cette révision, le texte indiquait "Publier est actif dès qu'une catégorie est choisie", ce qui omettait la condition de lieu déjà appliquée en pratique depuis la décision sur le fallback quartier. Le comportement réel n'a pas changé — cette section rend seulement explicite une règle qui l'était déjà implicitement par construction du champ Lieu toujours renseigné.)*

### Loading, erreur, succès

*(Intégralement inchangé.)* Spinner dans le bouton sans changement de largeur, formulaire désactivé pendant l'envoi. Erreur réseau : bannière, formulaire conservé. Succès : haptique, feuille descendante, redirection vers le détail du plan, toast, surlignement de la carte en Home au retour.

---

## 11. Quick path

*(Inchangé.)* Deux taps, 9 à 12 secondes, dont les deux tiers en lecture. Un seul choix obligatoire, repli de la grille, valeurs par défaut lisibles en clair, aucune étape séquentielle imposée, CTA visible en permanence.

---

## 12. États — réécrit en V1.2.1

### 12.1 Compte pas prêt à participer — remplace "Non vérifiée"

L'ancien modèle (`verification_status ≠ verified`, texte "Vérifie ton compte pour créer un plan.") **disparaît intégralement**. Cette condition n'est **jamais** appelée "vérification", "compte vérifié" ou "utilisateur vérifié" dans ce document, à aucun endroit. **Aucun badge n'est créé, aucun nouveau statut global de vérification n'est introduit.**

Un compte est prêt à participer si et seulement si :

1. Session Apple ou Google valide
2. Prénom renseigné
3. Date de naissance renseignée, 18+ confirmé
4. Ville renseignée
5. Photo de profil présente
6. `account_status = active`

**Comportement au tap sur "+ Créer" lorsqu'une de ces conditions manque** : le formulaire de création **ne s'ouvre pas**. Une feuille courte s'ouvre à la place, reprenant exactement le modèle de formulation de Home V1.3 §6 — **un seul message, correspondant précisément à ce qui manque**, jamais une explication générique :

| **Ce qui manqueTexte exactAction**                                                      |                                                                           |                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------ |
| Photo de profil absente                                                                 | `Ajoute une photo pour pouvoir créer ou rejoindre un plan.`               | Bouton `Ajouter`   |
| Profil incomplet (prénom, date de naissance ou ville manquants — onboarding interrompu) | `Termine ton profil pour pouvoir créer ou rejoindre un plan.`             | Bouton `Continuer` |
| Les deux manquent                                                                       | `Termine ton profil et ajoute une photo pour créer ou rejoindre un plan.` | Bouton `Continuer` |

Cette feuille est courte, sans grille de catégories, sans aucun champ du formulaire de création — uniquement l'icône, le texte, et le bouton d'action qui renvoie vers l'écran de complétion concerné. Fermeture par croix, retour direct à l'écran d'où venait le tap.

### 12.2 `under_review`

`under_review` signifie **exclusivement** : compte soumis à une revue de modération après signalement ou comportement suspect. **Jamais** une vérification en cours, un onboarding en attente, un selfie en attente, ou une quelconque étape biométrique — ces notions n'existent pas dans le produit.

**Règle binaire, sans nuance de gravité en V1** : tant que `account_status = under_review`, aucun Create, aucun Join, aucun Chat.

**Comportement au tap sur "+ Créer"** : le formulaire **ne s'ouvre pas**. Une feuille d'information **non actionnable** s'ouvre à la place :

| **ÉlémentRendu** |                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Texte exact      | `Ton compte est en cours d'examen suite à un signalement. Certaines actions sont limitées pendant ce temps.`                             |
| Registre visuel  | Info, calme — **aucun rouge alarmiste, aucun bouclier, aucune coche, aucun badge**                                                       |
| Action           | Aucune — un seul bouton de fermeture (croix ou "Fermer"), pas de CTA vers une action corrective puisqu'il n'y a rien à corriger soi-même |

### 12.3 Autres états — inchangés

Lieu ouvert, recherche en cours, aucun résultat, erreur de champ (quartier manquant à la soumission), loading, erreur réseau, publié, abandon, limite de 3 plans atteinte (vérifiée à l'ouverture, pas à la publication) : tous **intégralement inchangés** par rapport à la version précédente.

---

## 13. Sécurité

**Le formulaire n'est jamais la barrière de sécurité principale.** Les contrôles visuels décrits en §12 (feuille de complétion, feuille `under_review`) sont un confort d'expérience — ils évitent à une utilisatrice de remplir un formulaire pour rien — mais **ne constituent pas la protection réelle**.

**Toute tentative d'appel à l'API ****`plans.create`****, y compris un appel direct contournant l'interface, doit être vérifiée côté serveur** sur les conditions suivantes, cumulatives :

1. Session Apple ou Google valide
2. Profil complet (prénom, date de naissance, ville)
3. Photo de profil présente
4. `account_status = active` (donc explicitement refusé si `under_review`, `suspended` ou `banned`)
5. Moins de 3 plans actifs simultanés pour ce compte

Un appel qui ne remplit pas ces quatre conditions est rejeté par le serveur, indépendamment de ce que l'interface a pu laisser passer côté client. Cette règle s'applique de façon identique à `participation.join` (déjà couvert par le Blueprint §6.4 et §28) — elle est répétée ici pour `plans.create` spécifiquement parce que cet écran est le point d'entrée le plus direct vers cette action.

---

## 14. Design System — conformité confirmée

Cet écran respecte strictement le Design System V1.3, sans exception identifiée :

- Aucun badge de vérification, aucun bouclier, aucune coche de confiance — le formulaire n'en a jamais affiché, et les nouvelles feuilles de §12 n'en introduisent pas davantage.
- Aucun composant FAB — le bouton "+ Créer" appartient exclusivement à la TabBar (Design System §9, §11) ; cet écran ne fait qu'être **ouvert par** ce bouton, il n'en contient ni n'en duplique aucune représentation.
- Aucun élément visuel de cet écran ne suggère une identité ou un genre confirmé.

---

## 15. Micro-interactions

*(Intégralement inchangé.)* Sélection de catégorie, changement d'heure, sélection de lieu, changement de mode, stepper, ouverture de description, publication, retour arrière : toutes les animations et durées restent celles déjà spécifiées.

---

## 16. Accessibilité

*(Intégralement inchangé, avec une annonce ajoutée pour les nouvelles feuilles de §12.)* Zones tactiles ≥ 44×44, focus, Dynamic Type, RTL : inchangés. Les feuilles de complétion (12.1) et `under_review` (12.2) suivent les mêmes règles d'annonce que toute feuille modale : focus sur le titre à l'ouverture, texte lu intégralement, jamais de rôle `alert` alarmiste pour la feuille `under_review` — c'est une information, pas une urgence.

---

## 17. Wireframe et dimensions

*(Intégralement inchangé — phases 1 et 2, dimensions 390/375/360, voir version précédente.)* Deux wireframes supplémentaires, nouveaux en V1.2.1 :

### Feuille "Ce qui manque" (12.1) — exemple photo absente

```
╭──────────────────────────────────────────────╮
│                    ▬▬▬                       │  20
│                                          ✕   │  40
│                                              │
│              (icône photo, 40)               │
│                                              │
│   Ajoute une photo pour pouvoir créer        │
│   ou rejoindre un plan.                      │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │                Ajouter                 │  │  52
│  └────────────────────────────────────────┘  │
╰──────────────────────────────────────────────╯

```

### Feuille `under_review`

```
╭──────────────────────────────────────────────╮
│                    ▬▬▬                       │  20
│                                          ✕   │  40
│                                              │
│         (icône information neutre, 40)       │
│                                              │
│   Ton compte est en cours d'examen suite     │
│   à un signalement. Certaines actions sont   │
│   limitées pendant ce temps.                 │
│                                              │
│              (aucun bouton d'action)         │
╰──────────────────────────────────────────────╯

```

---

**Ce qui n'a pas changé** : structure à écran unique sans wizard, objectif \~15 secondes, catégorie comme premier choix obligatoire, titre prérempli et éditable, "Dans 1h" par défaut, raccourcis d'heure, lieu prérempli intelligemment avec fallback quartier discret, places 2-20 sans illimité, mode Direct/Sur demande à défaut contextuel, description optionnelle, chemin rapide catégorie → Publier dans le cas standard, toutes les micro-interactions, le responsive, le motion, le style Modern Medina, la typographie, la palette, le spacing, la navigation.

---

# CHANGELOG — CREATE PLAN V1.2.1 → V1.3

Propagation de la réarchitecture de l'authentification (Blueprint V1.3) : le téléphone + OTP n'existe plus, remplacé par Sign in with Apple / Google. **Aucune autre décision fonctionnelle rouverte** — capacité, préremplissage, mode de participation, limite de 3 plans actifs : tous inchangés.

| **SectionV1.2.1V1.3** |                                                                                                                |                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| §12.1                 | Condition en 3 points incluant `phone_verified_at IS NOT NULL` ; message "Confirme ton numéro pour continuer." | Condition en 6 points (Blueprint §6.4) ; messages reformulés autour du profil complet et de la photo, **aucune mention de téléphone ou d'OTP** |
| §13 Sécurité          | 4 conditions serveur, dont `phone_verified_at IS NOT NULL`                                                     | 5 conditions serveur : session Apple/Google, profil complet, photo, `account_status = active`, limite de 3 plans                               |
| §14, §15              | Références au Design System V1.2.1                                                                             | Références mises à jour vers V1.3                                                                                                              |

**Ce qui n'a pas changé** : tout le reste, identique à la V1.2.1.

---

# COHÉRENCE AVEC BLUEPRINT V1.3

| **Règle du Blueprint V1.3Couverture dans Create Plan V1.3**                |                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| §6.2 — Authentification Apple/Google, aucun téléphone                      | §12.1, condition en 6 points, aucune référence au téléphone                                                                     |
| §6.3 — `account_status` à 4 valeurs, aucune donnée de téléphone            | §12.1, condition reprise textuellement, jamais présentée comme "vérification"                                                   |
| §6.4 — Condition d'accès en 6 points                                       | §12.1, les messages de feuille correspondent chacun à ce qui manque réellement ; §13, la même condition revérifiée côté serveur |
| §6.4bis — `under_review` binaire, aucun Create/Join/Chat                   | §12.2, feuille non actionnable dédiée ; §13, refus serveur explicite pour `under_review`                                        |
| §6.5 — Jamais "vérifiée", Apple/Google jamais présentés comme vérification | §12, vocabulaire strictement aligné ; §14, confirmation de conformité                                                           |
| §6.6 — Badge supprimé                                                      | §14, absence confirmée                                                                                                          |
| §3.5 — Places 2 à 20, aucune option illimitée                              | §7, reconfirmé                                                                                                                  |
| §10.3 — Publier actif dès catégorie + lieu valide, fallback sans wizard    | §10, condition explicitée, comportement de repli décrit                                                                         |
| §28 — Vérification serveur systématique, jamais côté client seul           | §13, cinq conditions listées explicitement pour `plans.create`                                                                  |

---

# CONTRADICTIONS RESTANTES DOWNSTREAM

**Résolue dans cette même passe** : Plan Detail + Join V1.3, propagé simultanément.

### ONBOARDING

- **Aucune contradiction** — Onboarding V1.3 est déjà finalisé et cohérent avec cette révision.

### PLAN GROUP CHAT V1

- **Confirmé une nouvelle fois : aucune contradiction.** Ni badge, ni selfie, ni liveness, ni biométrie, ni téléphone référencés dans ce document.

**Aucune contradiction restante identifiée à ce stade.**

---

**Aucune décision produit n'a été créée dans ce document au-delà des corrections demandées.** Aucune biométrie, aucun badge n'a été réintroduit. Les contradictions restantes ci-dessus attendent une propagation dédiée, document par document, sur validation explicite.