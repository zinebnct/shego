# SHEGO — HOME V1.3

Réécriture complète de la spécification Home, consolidant le contenu validé au fil des itérations visuelles (Home Wireframe V1 → V1.1 → V1.2 LOCKED) et propageant les deux corrections du SHEGO PRODUCT BLUEPRINT V1.2.1 et du SHEGO DESIGN SYSTEM V1.2.1. Propagation **ciblée** : aucune refonte, aucun changement visuel hors des deux états concernés (compte pas prêt à participer, et `under_review`).

**Rappel de la seule question que cet écran doit résoudre** : *"Qu'est-ce qu'on fait autour de moi ?"* — en moins de trois secondes, ouvrir un plan ou taper sur Créer.

---

## 0. Ce que la Home doit faire

*(Inchangé.)*

Un seul objectif mesurable : que l'utilisatrice, en moins de trois secondes, ouvre un plan ou tape sur Créer. Tout élément qui ne sert ni à lire des plans, ni à en créer un, n'a pas sa place ici.

---

## 1. Wireframe

*(Structure inchangée depuis la V1.2 validée — header compact, chips repliables au scroll, densité maximisée.)*

```
┌──────────────────────────────────────────────┐ 390
│  9:41                          ▮▮▮ ⌃ ▭       │  44   status bar
├──────────────────────────────────────────────┤
│  SHEGO                    [≡ Liste│▤ Carte]  │  46   header
├──────────────────────────────────────────────┤
│  ⌖ Maârif  ⌄                          🔍     │  28   localisation (repliable)
│  [Tout] [Café] [Brunch] [Sport] [Shopping] → │  60   chips (repliable)
├──────────────────────────────────────────────┤
│  Maintenant · Bientôt                        │  32   section + rien de plus
│  ┌────────────────────────────────────────┐  │
│  │ ┌──┐  Café à Gauthier                  │  │
│  │ │☕│  ⚡Maintenant · à 600 m           │  │  124  PLAN CARD
│  │ └──┘  Café Bianca — Gauthier           │  │
│  │  ─────────────────────────────────     │  │
│  │  ◯S Salma      2 places    ⚡Direct    │  │
│  └────────────────────────────────────────┘  │
│                                         10   │       gouttière
│  Aujourd'hui · 4 plans                       │  32   compteur de plans
│  ┌────────────────────────────────────────┐  │
│  │  Qui vient bruncher au Maârif ? …      │  │  124
│  └────────────────────────────────────────┘  │
│  ┈┈┈┈┈┈┈┈┈┈ ligne de flottaison ┈┈┈┈┈┈┈┈┈┈  │       ≈ 4-5 cartes visibles
├──────────────────────────────────────────────┤
│   ⌂        ▤       ⊕      ✉       ◯          │  98   tab bar
│ Accueil  Mes plans      Messages  Profil     │
└──────────────────────────────────────────────┘

```

**Au scroll vers le bas** : la ligne de localisation et les chips (72 px cumulés) disparaissent, les cartes remontent. **Au scroll vers le haut** : ils reviennent. Comportement inchangé depuis V1.2.

---

## 2. Header

### Barre de marque (hauteur 46)

| **ÉlémentSpéc**    |                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Logotype           | Fraunces SemiBold 23, « SHE » Encre / « GO » Grenat                                                         |
| Toggle Liste/Carte | Contrôle segmenté 36, `radius.sm`, fond Surface, segment actif Grenat. Liste par défaut à chaque ouverture. |

### Zone repliable — localisation + recherche (hauteur 28)

| **ÉlémentSpécTexte** |                                                         |                                                                                                         |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Sélecteur de zone    | Icône épingle 15 + libellé 14/600 Encre 70 + chevron 13 | `Maârif` — **le quartier seul**, validé en V1.2 pour récupérer de la hauteur ; pas « Autour de Maârif » |
| Recherche            | IconButton 32 (zone tactile 44), loupe 19               | —                                                                                                       |

### Chips catégories (hauteur 60, repliable avec la zone ci-dessus)

Rangée horizontale scrollable, `Tout` en tête puis les 12 catégories, sélection unique. Inchangé depuis la spec d'origine.

### Comportement de repli

Au défilement descendant de plus de 40 px, la zone localisation + chips se replie en 220 ms (`easing.standard`) ; au défilement ascendant, elle réapparaît. Le header de marque (logotype + toggle) reste **toujours visible**. Gain net : 72 px rendus au contenu, soit l'équivalent d'une carte de plan supplémentaire à l'écran.

---

## 3. Sections temporelles

En-tête de section : `label` 13/600 Encre 70, avec, **validé en V1.2**, le nombre de plans de la section entre parenthèses discrètes :

| **SectionTexte exact**         |                                                          |
| ------------------------------ | -------------------------------------------------------- |
| Plans ≤ 90 min                 | `Maintenant · Bientôt`                                   |
| Aujourd'hui, au-delà de 90 min | `Aujourd'hui · 4 plans`                                  |
| Demain                         | `Demain · 1 plan`                                        |
| Cette semaine                  | `Cette semaine · 2 plans`                                |
| Au-delà du palier atteint      | `Un peu plus loin` + `à plus de 5 km` en 12/500 Encre 45 |

Une section vide n'est jamais affichée. Le compteur est informatif, jamais un compteur d'action (pas de badge, pas de couleur d'accent) — texte simple dans le prolongement du libellé.

---

## 4. Plan Card

Reprend le composant signature du Design System V1.2.1 tel quel — voir DS §7. Rappel des valeurs validées en V1.2 :

| **PropriétéValeur**  |                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------ |
| Avatar (méta-barre)  | **24 px** — validé en V1.2, aucun changement                                         |
| Teintes de catégorie | Palette V1.2 (pastel plus présent) — voir tableau ci-dessous                         |
| Titre                | **Naturel et libre**, écrit comme une utilisatrice l'écrirait — pas un mot-catalogue |

### Palette de catégorie V1.2 (rappel, source unique désormais le Design System V1.2.1)

| **CatégorieTeinte** |           |
| ------------------- | --------- |
| Café                | `#EDD6BC` |
| Brunch              | `#F8CDBC` |
| Shopping            | `#F3CDD6` |
| Concert             | `#EBCCE4` |
| Soirée              | `#DCCDEE` |
| Cinéma              | `#CCD3F0` |
| Voyage              | `#C4DFF0` |
| Plage               | `#BFE3E0` |
| Sport               | `#C7E6D3` |
| Balade              | `#D9E7BC` |
| Créatif             | `#F8E3B0` |
| Autre               | `#E6DDD1` |

### Titres — exemples validés

`Café à Gauthier` · `Qui vient bruncher au Maârif ?` · `Je vais au Pilates à 18h, qui vient ?` · `Cinéma ce soir ?` · `Shopping à Anfa Place` — mélange de formes courtes et de phrases réellement adressées, jamais un générateur systématique.

**Aucun badge, aucune coche de vérification, aucune icône de bouclier sur la carte, à aucun endroit** *(rappel explicite, V1.2.1, cohérent avec Design System §7 règle 6)*.

---

## 5. Bouton Créer et navigation basse

**Décision définitive, sans ambiguïté** : le bouton central **"+ Créer"** de la barre de navigation (56 × 56, Grenat, remonté de 12 px au-dessus de la barre) est l'**unique affordance de création** de la V1. **Aucun FAB séparé n'existe dans le contenu de la Home**, à aucun état, à aucune densité. Cette règle est verrouillée dans le Design System V1.2.1 (§9, §19) et ne se rediscute pas ici.

### Barre de navigation

| **SlotIcôneLibelléÉtat** |                     |             |                                                                  |
| ------------------------ | ------------------- | ----------- | ---------------------------------------------------------------- |
| 1                        | Maison, pleine      | `Accueil`   | Actif — Grenat                                                   |
| 2                        | Calendrier, outline | `Mes plans` | Inactif · badge numérique (demandes en attente), plafonné à `9+` |
| 3                        | `+` blanc           | —           | Cercle 56 Grenat, remonté de 14, ombre `elevation.2`             |
| 4                        | Bulle, outline      | `Messages`  | Inactif · point (messages non lus)                               |
| 5                        | Personne, outline   | `Profil`    | Inactif                                                          |

### Comportement du bouton Créer selon l'état du compte

Le bouton reste **visuellement identique et accessible en permanence** dans la TabBar — il n'est jamais masqué. Seule son **action** varie :

| **État du compteTap sur "+ Créer"**                   |                                                                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Prêt à participer (voir §7)                           | Ouvre la feuille de création (Create Plan V1)                                                                           |
| Pas encore prêt (profil incomplet ou photo manquante) | Ouvre un écran court expliquant **ce qui manque précisément** (voir §7, Correction 1) plutôt que la feuille de création |
| `under_review`                                        | Ouvre une feuille d'information non actionnable : bannière + explication, sans formulaire (voir §7, Correction 2)       |

**Aucun bouton alternatif de type FAB n'est créé pour représenter ces états.** Le même bouton central gère les trois cas via son comportement au tap, jamais via une variante graphique supplémentaire.

---

## 6. États

### Correction 1 — Compte pas prêt à participer (remplace "Non vérifiée")

L'ancien système reposait sur `verification_status ≠ verified` et le texte "Vérifie ton compte pour créer ou rejoindre un plan." **Ce modèle n'existe plus.**

Un compte est **prêt à participer** si et seulement si les conditions du Blueprint V1.3 §6.4 sont réunies :

1. Session Apple ou Google valide
2. Prénom renseigné
3. Date de naissance renseignée, 18+ confirmé
4. Ville renseignée
5. Photo de profil présente
6. `account_status = active`

**Règles de formulation, strictes** :

- Ne jamais appeler cela "compte vérifié" ou une variante.
- Ne jamais utiliser "Vérifie ton compte".
- Aucun badge, aucune pastille, aucune icône associée.
- Aucun nouvel état global de "vérification" — seulement l'état factuel de ce qui manque.
- **Aucune formulation liée à un numéro de téléphone ou à un code OTP** — ce mécanisme n'existe plus.
- Le message **n'affiche que la condition réellement manquante**, jamais toutes par défaut.

**Cas réel en Home** : dans le parcours standard, les quatre premiers champs (prénom, date de naissance, ville, session Apple/Google) sont déjà remplis dès l'onboarding — la Home ne peut donc rencontrer qu'un profil incomplet dans des cas limites (interruption de l'onboarding avant la fin, par exemple). Le cas le plus courant reste la photo manquante.

| **Ce qui manqueBannière Home (sous les chips, priorité maximale)Texte exact**           |                    |                                                                                                |
| --------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| Photo de profil absente                                                                 | Info, non fermable | `Ajoute une photo pour pouvoir créer ou rejoindre un plan.` + bouton `Ajouter`                 |
| Profil incomplet (prénom, date de naissance ou ville manquants — onboarding interrompu) | Info, non fermable | `Termine ton profil pour pouvoir créer ou rejoindre un plan.` + bouton `Continuer`             |
| Les deux manquent                                                                       | Info, non fermable | `Termine ton profil et ajoute une photo pour créer ou rejoindre un plan.` + bouton `Continuer` |

Dans les trois cas : la liste des plans reste **entièrement consultable**, les cartes restent tapables jusqu'au détail. Seules les actions de création et de participation sont bloquées, avec le renvoi vers l'écran de complétion correspondant.

### Correction 2 — `under_review`

`under_review` signifie **exclusivement** : compte soumis à une revue de modération après signalement ou comportement suspect. **Jamais** une vérification en cours — cette notion n'existe plus dans le produit.

**Comportement, binaire, sans nuance de gravité en V1** :

- Le bouton "+ Créer" reste visible mais **n'ouvre pas la feuille de création** (voir §5).
- Toute action de participation (Rejoindre, Demander à rejoindre) reste **désactivée** sur les cartes et dans le détail des plans.
- **Aucun chat n'est accessible**, y compris ceux de plans déjà rejoints avant la mise en examen.

| **ÉlémentRendu** |                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Bannière         | Info, persistante, non fermable, sous les chips, priorité maximale (avant toute autre bannière)              |
| Texte exact      | `Ton compte est en cours d'examen suite à un signalement. Certaines actions sont limitées pendant ce temps.` |
| Couleur          | Info `#2C5A8C` sur `Info tint` `#E7EEF6` — **jamais de rouge, jamais un registre alarmiste**                 |
| Icône            | Information neutre (i cerclé), jamais un bouclier ni une croix                                               |

La liste des plans reste consultable normalement. Aucune mention de "vérification" n'apparaît nulle part dans cette bannière ni dans l'écran d'information ouvert depuis le bouton Créer.

### Règle de priorité des bannières — inchangée dans sa hiérarchie, reformulée dans son contenu

Une seule bannière à la fois : `under_review` > compte pas prêt à participer > erreur de chargement > localisation refusée > hors ligne.

### Autres états — inchangés

| **ÉtatRendu**        |                                                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chargement           | 3 cartes squelette, header normal                                                                                                                                                                         |
| Défaut               | Voir §1-§4                                                                                                                                                                                                |
| Vide total           | Icône, `Rien de prévu par ici`, `Tu avais envie de sortir aujourd'hui ? Lance le premier plan.`, bouton `Créer un plan`, lien discret `Voir plus loin` — **validé en V1.2**, plus de second CTA principal |
| Vide après filtre    | Idem, sans le lien                                                                                                                                                                                        |
| Élargi               | Section "Un peu plus loin"                                                                                                                                                                                |
| Localisation refusée | Bannière Info sous les chips, mode ville entière                                                                                                                                                          |
| Hors ligne           | Bannière Argile basse, liste servie depuis le cache                                                                                                                                                       |
| Erreur de chargement | Bannière Error haute + `Réessayer`                                                                                                                                                                        |

---

## 7. Responsive

*(Inchangé.)*

| **390 × 844375 × 667360 × 640** |     |     |     |
| ------------------------------- | --- | --- | --- |
| Marges latérales                | 20  | 20  | 16  |
| Cartes visibles                 | 4-5 | 3-4 | 2-3 |
| Tuile de catégorie              | 44  | 44  | 40  |
| Avatar méta-barre               | 24  | 24  | 24  |

Les bannières d'état de compte (§6) suivent la largeur pleine de l'écran moins les marges, sur toutes les tailles, sans troncature de texte — au besoin, elles passent sur deux lignes plutôt que d'ellipser.

---

## 8. Ce que la Home ne contient pas

*(Inchangé, un point ajouté.)*

Aucune photo dans les cartes · aucune grille de profils · aucun filtre portant sur les personnes · aucune story ni feed · aucun compteur à `99+` · aucune adresse complète · aucune position d'utilisatrice autre que la sienne · **aucun badge, pastille ou icône suggérant une identité ou un genre confirmé, à quelque endroit que ce soit de l'écran** *(explicité en V1.2.1, cohérent avec Design System §8 et §14 — ce composant n'existe plus, nulle part)*.

---

# CHANGELOG — HOME V1.2 → V1.2.1

| **SectionV1.2V1.2.1Raison**                |                                                                                                                |                                                                                                                                                                                                                    |                                                                                                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §6 (ex-§7) États, ligne "Non vérifiée"     | Condition `verification_status ≠ verified`, texte unique "Vérifie ton compte pour créer ou rejoindre un plan." | Renommée "Compte pas prêt à participer" ; condition en 3 points (`phone_verified_at`, photo, `account_status = active`) ; **trois messages distincts selon ce qui manque réellement**, jamais un message générique | Le champ `verification_status` n'existe plus (Blueprint §6.3) ; le nouveau modèle n'a plus de notion de "vérifié" à afficher, et la bonne pratique consiste à ne montrer que ce qui manque |
| §6 (ex-§7) États, ligne "Compte en examen" | `under_review`, texte identique mais sans précision sur le chat                                                | Texte canonique reformulé, **blocage explicite du chat ajouté**, registre "vérification en cours" définitivement exclu                                                                                             | Aligner sur la règle binaire 6.4bis du Blueprint (aucun Create/Join/Chat) et sur le Design System §14/§16 (`ModerationBanner`, état unique)                                                |
| §5 Bouton Créer                            | Comportement du tap non spécifié selon l'état du compte                                                        | Nouveau tableau : le même bouton central ouvre soit la création, soit un écran de complétion, soit une feuille d'information `under_review` — **jamais de FAB alternatif**                                         | La correction 1 introduit deux nouveaux cas de blocage qu'il fallait raccorder explicitement au seul point d'entrée de création existant                                                   |
| §4 Plan Card                               | Palette et avatar décrits dans les mockups visuels uniquement, pas actés dans un texte de spec canonique       | Palette V1.2 et avatar 24 px repris ici comme référence écrite, avec renvoi au Design System V1.2.1 comme source                                                                                                   | Cette réécriture consolide pour la première fois en texte ce qui n'existait que dans les itérations de mockup HTML                                                                         |
| §8 Ce que la Home ne contient pas          | Liste sans mention de badge                                                                                    | Point ajouté : aucun badge/pastille/icône de confiance nulle part sur l'écran                                                                                                                                      | Cohérence explicite avec la suppression totale du badge dans le Design System V1.2.1                                                                                                       |

**Ce qui n'a pas changé** : Home orientée plans, liste par défaut, toggle Liste/Carte, chips de catégories, sections temporelles et leur ordre, rayon élastique et ses paliers, structure et hiérarchie de la Plan Card, avatar 24 px, bouton central "+ Créer" comme unique affordance, absence de FAB, hiérarchie ACTIVITÉ → MOMENT → LIEU → PERSONNE, comportement de repli du header au scroll, tous les autres états (vide, chargement, hors ligne, erreur), le responsive.

---

# CHANGELOG — HOME V1.2.1 → V1.3

Propagation de la réarchitecture de l'authentification (Blueprint V1.3) : le téléphone + OTP n'existe plus, remplacé par Sign in with Apple / Google. **Aucune autre décision fonctionnelle rouverte.**

| **SectionV1.2.1V1.3**       |                                                                                                                |                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| §6, Correction 1            | Condition en 3 points incluant `phone_verified_at IS NOT NULL` ; message "Confirme ton numéro pour continuer." | Condition en 6 points (Blueprint §6.4) ; messages reformulés autour du profil complet et de la photo, **aucune mention de téléphone ou d'OTP** |
| §5, tableau du bouton Créer | "Pas encore prêt (téléphone ou photo manquants)"                                                               | "Pas encore prêt (profil incomplet ou photo manquante)"                                                                                        |

**Ce qui n'a pas changé** : tout le reste, identique à la V1.2.1 — structure de l'écran, sections temporelles, rayon élastique, Plan Card, navigation, la règle `under_review` binaire (Correction 2, inchangée sur le fond), le comportement du bouton Créer.

---

# COHÉRENCE AVEC BLUEPRINT V1.3

| **Règle du Blueprint V1.3Couverture dans Home V1.3**                                                            |                                                                                          |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| §6.2 — Authentification Apple/Google, aucun téléphone                                                           | §6, condition en 6 points, aucune référence au téléphone                                 |
| §6.3 — `account_status` à 4 valeurs, aucune donnée de téléphone                                                 | §6, condition reprise textuellement                                                      |
| §6.4 — Condition d'accès en 6 points                                                                            | §6, les trois messages de bannière correspondent chacun à ce qui manque réellement       |
| §6.4bis — `under_review` binaire, aucun Create/Join/Chat                                                        | §5 et §6, blocage explicite des trois actions, y compris le chat, sans nuance de gravité |
| §6.5 — Jamais "vérifiée", jamais de promesse d'identité/genre, Apple/Google jamais présentés comme vérification | §6, formulations strictement alignées sur le vocabulaire autorisé du Blueprint           |
| §6.6 — Badge supprimé                                                                                           | §8, absence de badge explicitement listée                                                |
| §8.2 (Blueprint) — Bouton central "+ Créer", aucun FAB séparé                                                   | §5, décision reprise mot pour mot                                                        |
| §10.3 (Blueprint) — Publier actif dès catégorie + lieu valide                                                   | Sans objet direct pour la Home (concerne Create Plan)                                    |

---

# CONTRADICTIONS RESTANTES DOWNSTREAM

**Résolues dans cette même passe** : Create Plan V1.3 et Plan Detail + Join V1.3, propagés simultanément.

### ONBOARDING

- **Aucune contradiction** — Onboarding V1.3 est déjà finalisé et cohérent avec cette révision.

### PLAN GROUP CHAT V1

- **Aucune contradiction**, confirmé une nouvelle fois.

**Aucune contradiction restante identifiée à ce stade.**

- **Aucune contradiction** — confirmé à nouveau, aucune référence à un badge, une vérification ou une biométrie dans ce document.

---

**Aucune décision produit n'a été verrouillée dans ce document au-delà des deux corrections demandées.** Les contradictions restantes ci-dessus attendent une propagation dédiée, document par document, sur validation explicite.