# SHEGO — PLAN DETAIL + JOIN V1.3

Réécriture complète, précédée d'un audit exhaustif du document V1 LOCKED. Propage les corrections du SHEGO PRODUCT BLUEPRINT V1.2.1, du SHEGO DESIGN SYSTEM V1.2.1, de HOME V1.2.1 et de CREATE PLAN V1.2.1. Propagation **ciblée** : hiérarchie QUOI → QUAND → OÙ → QUI ORGANISE → COMBIEN DE PLACES → COMMENT JE REJOINS, Plan Detail sans hero photo, avatar 44 px de la créatrice, liste de participantes, règle d'affichage progressif du lieu, notice de sécurité, signalement/blocage, navigation, palette, typographie, spacing, Modern Medina : **tous strictement inchangés**.

---

## AUDIT PRÉALABLE — méthode

Avant toute correction, lecture intégrale du document V1 LOCKED (spec texte, wireframes, mockup HTML) à la recherche de : badge "Vérifiée", coche ou bouclier de vérification, `verification_status`, `verified`/`unverified`/`needs_retry`/`in_review`, toute formulation présentant la confiance comme une preuve d'identité ou de genre. Le résultat exhaustif de cet audit est consigné en fin de document, section **AUDIT DES CONTRADICTIONS V1.2.1**, avec pour chaque occurrence : son emplacement exact et la correction appliquée. Deux occurrences ont été trouvées, une dans la spec et le wireframe, une dans le mockup HTML — répercutée sur les 5 frames. Aucune autre référence à un ancien état de compte (`verification_status`, `verified`, etc.) n'existait ailleurs dans le document : le reste de la spec ne gérait déjà aucun état de compte en propre, elle en héritait implicitement de Home/Create Plan — ce qui constitue en soi une lacune corrigée ci-dessous (§13, §14 nouveaux).

---

## 1. Structure et ordre de lecture

*(Intégralement inchangé.)*

```
1. Header (retour · actions secondaires)
2. Hero — CategoryTile + titre + moment                    QUOI / QUAND
3. Lieu — lieu identifiable + quartier + distance           OÙ
4. Description (si renseignée)
5. Créatrice — identité minimale                            QUI ORGANISE
6. Participantes — avatars + compteur                       QUI EST DÉJÀ LÀ
7. Notice de sécurité (contextuelle, légère)
8. [espace, la liste défile jusqu'ici]
── barre CTA collante ──
9. Places restantes + mode de participation
10. CTA principal (contextuel selon l'état)

```

---

## 2. Hero du plan

*(Intégralement inchangé.)* Tuile de catégorie 56×56, titre `h1`, moment en pastille ou texte simple. Aucune photo, aucune illustration — cohérent avec la Plan Card et le Design System V1.2.1, qui n'ont jamais varié sur ce point.

---

## 3. Lieu — application stricte de la règle 15.1

*(Intégralement inchangé — décision non rouverte, conforme à l'instruction.)*

Avant d'être dans le plan : nom du lieu + quartier, distance approximative, aperçu de carte statique plafonné au niveau du quartier, ligne d'explication *"L'adresse exacte est visible une fois dans le plan."* Après acceptation ou entrée : adresse exacte complète, aperçu de carte recentré, point de rendez-vous précis si renseigné, lien vers l'application cartographique du système.

---

## 4. Créatrice — corrigé en V1.2.1

```
Organisé par

◯ 44    Salma · 27 ans
        Casablanca

```

**Le badge "Vérifiée" est supprimé intégralement de ce bloc**, conformément au Design System V1.2.1 §8. Le bloc créatrice se limite désormais, sans exception, à :

> **Avatar (44 px) · Prénom · Âge · Ville.**

Aucun élément supplémentaire — ni coche, ni bouclier, ni pastille de couleur, ni icône positionnée sur ou à côté de l'avatar. La ligne de prénom et d'âge occupe seule sa ligne, sans réserver d'espace pour un badge qui n'existe plus : la mise en page n'a plus besoin de prévoir un passage à la ligne conditionnel pour un élément absent.

**Aucune ligne de confiance textuelle n'apparaît ici.** Conformément au Design System V1.3 §14, aucune ligne de ce type n'existe plus nulle part dans le produit — ni sur un aperçu de créatrice, ni même dans le profil complet. Le Plan Detail n'affiche donc **aucun signal de confiance, textuel ou visuel, attaché à la créatrice** — l'avatar, le prénom, l'âge et la ville suffisent à l'identité minimale, sans validation apparente d'aucune sorte.

Le bloc entier reste tapable et mène au profil complet de la créatrice, qui n'affiche lui non plus aucune ligne de confiance équivalente (hors périmètre de cette spec, gouverné par le Design System §14).

---

## 5. Participantes

*(Intégralement inchangé.)* Rangée d'avatars `avatar.sm` 32, plafonnée à 5 + compteur `+N`, créatrice visuellement distincte (jamais dans cette rangée). Au tap, feuille listant prénom + âge pour chaque participante — **sans badge**, cohérent avec la correction ci-dessus (cette feuille n'en affichait déjà pas, vérifié lors de l'audit).

---

## 6. Places

*(Intégralement inchangé.)* `4 places` / `2 places` (Encre 600) / `Complet`. Aucune barre de progression, aucune fausse urgence.

---

## 7. Mode Direct — cycle complet

*(Intégralement inchangé dans son déroulé, avec une précision ajoutée en tête — voir §13bis.)*

CTA `Rejoindre` → contraction, coche, bascule vers `Ouvrir le chat` après 600 ms, pastille `Tu y vas` en tête d'écran, révélation de l'adresse, message système dans le chat. Détail complet inchangé par rapport à la version précédente.

---

## 8. Mode Sur demande — cycle complet

*(Intégralement inchangé dans son déroulé, avec la même précision ajoutée en §13bis.)*

CTA `Demander à rejoindre` → `Demande envoyée` (Secondary désactivé) → `Ouvrir le chat` si acceptée, ou retour à l'état initial si refusée/expirée, silencieusement. Détail complet inchangé.

---

## 9. Plan complet

*(Intégralement inchangé.)* CTA désactivé, lien Tertiary vers d'autres plans, aucune urgence artificielle.

---

## 10. Actions secondaires

*(Intégralement inchangé.)* Signaler le plan, quitter, annuler la demande, annuler le plan (créatrice), modifier lieu/heure (créatrice), voir le profil d'une participante — regroupées derrière le bouton `⋯` du header, filtrées par rôle.

---

## 11. Sécurité — notice contextuelle

*(Intégralement inchangé.)* Notice unique, Info, avant Join uniquement : *"Pour ta première rencontre, privilégie un lieu public et préviens quelqu'une de confiance."* Aucune couleur d'alerte.

---

## 12. Accès au chat — règle exacte

*(Inchangé dans sa table, avec un ajout de ligne — voir §13bis pour le détail du nouveau cas.)* Le chat est accessible si et seulement si la personne connectée appartient à `{créatrice} ∪ {participantes acceptées}`, sous réserve, **nouveau en V1.2.1**, que son propre compte reste `active` (voir §13bis).

---

## 13. États du plan — renommé et clarifié en V1.2.1

> **Clarification terminologique, nécessaire suite à l'audit** : la version précédente utilisait le mot `under_review` pour désigner un **plan signalé en cours d'examen** — un concept réel et distinct du statut de compte du même nom introduit par le Blueprint V1.2.1. Les deux notions coexistent légitimement (un plan peut être examiné indépendamment du statut de son organisatrice, et une utilisatrice peut être `under_review` sans qu'aucun de ses plans ne le soit). Pour éliminer toute ambiguïté, cette section renomme explicitement l'état du plan **`plan_under_review`** dans ce document. Le statut de **compte** `under_review` est traité séparément en §13bis, qui est la correction centrale de cette propagation.

| **État du planDéclencheurCTALieu affichéChat** |                                                             |                              |                                 |                                      |
| ---------------------------------------------- | ----------------------------------------------------------- | ---------------------------- | ------------------------------- | ------------------------------------ |
| **default**                                    | Plan actif, non participante, Direct                        | `Rejoindre`                  | public                          | non                                  |
| **default (request)**                          | Plan actif, non participante, Sur demande                   | `Demander à rejoindre`       | public                          | non                                  |
| **pending**                                    | Demande envoyée, en attente                                 | `Demande envoyée` (off)      | public                          | non                                  |
| **accepted**                                   | Participante acceptée                                       | `Ouvrir le chat`             | exact                           | oui                                  |
| **declined**                                   | Demande refusée                                             | Réinitialisé                 | public                          | non                                  |
| **expired**                                    | Demande non traitée à l'heure du plan                       | idem `declined`              | public                          | non                                  |
| **full**                                       | Places = 0, non participante                                | `Complet` (off) + lien       | public                          | non                                  |
| **full\_pending\_lost**                        | Demande en attente, plan complété entre-temps               | `Complet` (off)              | public                          | non                                  |
| **cancelled**                                  | Plan annulé par la créatrice                                | aucun CTA de participation   | public (figé)                   | oui si acceptée, lecture seule       |
| **past**                                       | Heure du plan dépassée                                      | aucun CTA de participation   | exact si acceptée, sinon public | oui en lecture seule si acceptée     |
| **`plan_under_review`** *(renommé)*            | **Le plan** fait l'objet d'un signalement en cours d'examen | CTA désactivé, bannière Info | public                          | selon appartenance, en lecture seule |
| **error**                                      | Échec de chargement du détail                               | écran d'erreur dédié         | —                               | —                                    |

*(Cette table ne change pas de comportement par rapport à la version précédente — seul le nom de la dernière ligne est clarifié pour ne plus entrer en collision avec le statut de compte.)*

---

## 13bis. État du compte de la personne connectée

Cette section n'existait sous aucune forme dans le document V1.2.1 précédent : l'ancien modèle présupposait un état de "vérification" géré ailleurs, sans jamais préciser son effet concret sur cet écran. Elle comble ce vide, sans inventer de comportement au-delà de ce que le Blueprint V1.3 exige.

### Compte pas prêt à participer

Si la personne connectée ne remplit pas les conditions du Blueprint §6.4 (session Apple/Google valide, prénom, date de naissance/18+, ville, photo de profil présente, `account_status = active`) : le détail du plan reste **entièrement consultable**, mais un tap sur `Rejoindre` ou `Demander à rejoindre` **n'exécute pas l'action**. Il ouvre la même feuille courte que Create Plan V1.3 §12.1 — un seul message correspondant à ce qui manque précisément (`Ajoute une photo pour pouvoir créer ou rejoindre un plan.` / `Termine ton profil pour pouvoir créer ou rejoindre un plan.` / les deux). **Cette feuille n'est pas dupliquée ni réinventée ici** : c'est exactement le même composant, invoqué depuis un second point d'entrée.

### Compte `under_review`

Si le compte de la personne connectée est `account_status = under_review` : même principe, un tap sur `Rejoindre` ou `Demander à rejoindre` ouvre la feuille d'information non actionnable de Create Plan V1.3 §12.2 — *"Ton compte est en cours d'examen suite à un signalement. Certaines actions sont limitées pendant ce temps."* Registre Info, calme, aucun bouclier, aucune coche, aucun badge, aucune formulation évoquant une "vérification en cours".

**Cas particulier explicitement couvert, comme demandé** : une participante déjà acceptée dans un plan, dont le compte passe `under_review` *après* son acceptation. Dans ce cas :

- le bouton `Ouvrir le chat` devient inaccessible — un tap ouvre la même feuille d'information `under_review`, pas le chat ;
- aucune nouvelle action de participation n'est possible sur ce plan ni sur aucun autre (cohérent avec la règle binaire 6.4bis du Blueprint) ;
- **rien d'autre ne change visuellement sur cet écran** : la personne reste listée dans les participantes du point de vue des autres (son compte n'a pas été retiré du plan, seul son accès est suspendu) — aucun état visuel supplémentaire n'est inventé pour ce cas, conformément à la consigne de ne pas ajouter de représentation non nécessaire.

### Ce qui ne change pas

Un compte `active` remplissant les six conditions n'a jamais vu et ne voit toujours aucune de ces feuilles — le comportement décrit dans les sections 7, 8 et 9 (Mode Direct, Mode Sur demande, Plan complet) s'applique tel quel, sans modification, pour tout le reste des utilisatrices.

---

## 14. Micro-interactions et motion

*(Intégralement inchangé.)* Ouverture depuis la Home par carte étirée, Join Direct (contraction → coche → bascule), Request (contraction → bascule neutre), acceptation en direct, révélation de l'adresse par fondu croisé avec léger zoom de la carte statique. Aucune de ces animations n'a jamais été liée à la biométrie ou à un badge — aucune modification nécessaire.

---

## 15. Responsive

*(Intégralement inchangé.)* 390/375/360, marges, tailles de tuile et d'avatar, barre CTA collée en permanence sur toutes les tailles.

---

## 16. Accessibilité

*(Intégralement inchangé, avec une annonce ajoutée.)* Les nouvelles feuilles invoquées en §13bis suivent exactement les règles d'annonce déjà définies pour elles dans Create Plan V1.2.1 §16 — aucune règle supplémentaire à documenter ici, puisque ce sont les mêmes composants.

---

## 17. Wireframes — corrigés en V1.2.1

### Direct — avant Join (390 × 844)

```
╭──────────────────────────────────────────────╮
│  ←                                       ⋯   │  56
│                                              │
│  ┌──┐                                       │
│  │☕│  Café à Gauthier                       │  hero
│  └──┘  ⚡ Dans 40 min                        │
│                                              │
│  Où                                          │
│  Café Bianca — Gauthier          à 600 m    │
│  ┌────────────────────────────────────────┐  │
│  │        [ aperçu de carte ]              │  │  140
│  └────────────────────────────────────────┘  │
│  L'adresse exacte est visible une fois       │
│  dans le plan.                               │
│                                              │
│  Organisé par                                │
│  ◯44  Salma · 27 ans                        │  ← ligne "✓ Vérifiée" retirée
│       Casablanca                             │
│                                              │
│  Qui vient déjà · 1                          │
│  ◯Y                                          │
│  Yasmine vient aussi.                        │
│                                              │
│  🛈 Pour ta première rencontre, privilégie   │
│    un lieu public et préviens quelqu'une…    │
│                                              │
├──────────────────────────────────────────────┤
│  2 places · ⚡ Direct                         │
│  ┌────────────────────────────────────────┐  │
│  │              Rejoindre                 │  │  52
│  └────────────────────────────────────────┘  │
╰──────────────────────────────────────────────╯

```

### Nouveau — tap sur "Rejoindre" avec un compte pas prêt à participer

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

*(Composant identique à Create Plan V1.2.1 — voir cette spec pour l'ensemble des variantes de message.)*

### Autres wireframes (Sur demande, déjà rejoint, complet)

*(Intégralement inchangés dans leur structure — la seule modification transversale est le retrait de la ligne "✓ Vérifiée" du bloc créatrice, déjà montré ci-dessus et applicable identiquement partout où ce bloc apparaît.)*

---

## 18. Mockup visuel — corrigé en V1.2.1

Le mockup HTML a été corrigé directement, pas seulement décrit :

- La fonction `creator()` ne génère plus la pastille `.vbadge` (bouclier Atlas + coche blanche) à côté du nom de la créatrice.
- La ligne de nom (`Salma · 27 ans`) redevient un simple texte, sans conteneur flexible réservé à une icône adjacente.
- La règle CSS `.vbadge` et la constante `VCHECK` associée sont supprimées du fichier — plus aucune trace, pas seulement une classe inutilisée laissée en place.
- **Les 5 frames ont été vérifiées individuellement** : les 5 états (Direct avant Join, Sur demande avant Join, après Join, demande envoyée, plan complet) partagent tous la même fonction `creator()` — la correction s'applique donc uniformément aux 5 d'un seul geste, sans risque d'oubli sur l'une d'elles.
- L'alignement du bloc créatrice a été vérifié après retrait : la ligne de nom occupe désormais toute la largeur disponible sans espace réservé vide, l'avatar 44 px et la ligne "Casablanca" en dessous ne bougent pas.

---

# AUDIT DES CONTRADICTIONS V1.2.1

| **#Référence trouvéeEmplacement exactCorrection appliquée** |                                                                                                              |                                                                                                           |                                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                                                           | Badge "Vérifiée" (pastille Atlas, icône bouclier-check, libellé "Vérifiée")                                  | Spec texte, ancien §4 "Créatrice" : *"badge Vérifiée à droite sur la même ligne si la largeur le permet"* | Supprimé intégralement. Bloc créatrice réduit à Avatar · Prénom · Âge · Ville (§4 de cette version).                                                      |
| 2                                                           | Ligne "✓ Vérifiée"                                                                                           | Wireframe, ancien §17, bloc créatrice du wireframe "Direct — avant Join"                                  | Ligne retirée (§17 de cette version).                                                                                                                     |
| 3                                                           | Pastille visuelle `.vbadge` (fond Atlas, icône coche blanche `VCHECK`) + constante `VCHECK` inutilisée sinon | Mockup HTML, fonction `creator()` et bloc CSS `.vbadge`                                                   | Pastille, classe CSS et constante supprimées du fichier. Répercuté identiquement sur les 5 frames, qui partagent la même fonction (§18 de cette version). |

**Aucune autre référence trouvée.** Recherche explicite et négative sur : `verification_status`, `verified`, `unverified`, `needs_retry`, `in_review`, toute mention de selfie/liveness/biométrie, toute formulation de type "compte vérifié" appliquée à une personne. Le document ne gérait par ailleurs **aucun état de compte en propre** avant cette révision (ni "non vérifiée", ni `under_review` côté compte) : ce n'était pas une contradiction à corriger, mais une absence à combler — traitée en §13bis, qui est un ajout, pas une correction d'un texte erroné.

**Précision sur l'état "under\_review" déjà présent** : la ligne `under_review` de l'ancien tableau d'états (désormais renommée `plan_under_review`, §13) ne contredisait pas le Blueprint — elle désignait déjà un plan signalé, jamais un onboarding ou une biométrie, et son texte ne contenait aucune formulation de type "vérification en cours". Elle a été renommée par précaution terminologique, pas corrigée sur le fond.

---

# CHANGELOG — PLAN DETAIL + JOIN V1 → V1.2.1

| **SectionV1V1.2.1Raison**   |                                                                     |                                                                                                                                                                                                                  |                                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §4 Créatrice                | Bloc incluant un badge "Vérifiée" conditionnel                      | Bloc réduit à Avatar · Prénom · Âge · Ville, aucun badge, aucune ligne de confiance textuelle                                                                                                                    | Design System V1.2.1 §8 : badge supprimé intégralement ; §14 : la ligne "Compte confirmé par téléphone" n'apparaît que dans le profil complet                                                                           |
| §13 (ex-§13) États du plan  | Dernière ligne nommée `under_review`                                | Renommée `plan_under_review`                                                                                                                                                                                     | Éliminer la collision terminologique avec le nouveau statut de compte `under_review` introduit par le Blueprint V1.2.1                                                                                                  |
| §13bis *(nouvelle section)* | Absente — aucun état de compte représenté sur cet écran             | Ajoutée : comportement du bouton Join pour un compte pas prêt à participer, et pour un compte `under_review`, y compris le cas d'une participante déjà acceptée dont le compte bascule `under_review` après coup | Combler une lacune réelle : l'ancien document ne précisait jamais ce qui se passait sur cet écran spécifique pour un compte non conforme, il en héritait implicitement d'un mécanisme de vérification qui n'existe plus |
| §12 Accès au chat           | Table inchangée dans son contenu                                    | Une clause ajoutée : l'accès suppose aussi `account_status = active` du côté de la personne connectée                                                                                                            | Cohérence directe avec §13bis                                                                                                                                                                                           |
| §17 Wireframes              | Bloc créatrice avec "✓ Vérifiée"                                    | Ligne retirée ; wireframe ajouté pour la feuille "compte pas prêt"                                                                                                                                               | Cohérence avec §4 et §13bis                                                                                                                                                                                             |
| §18 Mockup visuel           | Badge présent sur les 5 frames via la fonction `creator()` partagée | Fonction corrigée, badge et CSS associés supprimés, 5 frames vérifiées individuellement                                                                                                                          | Correction réelle du fichier, pas seulement de sa description                                                                                                                                                           |

**Ce qui n'a pas changé** : hiérarchie QUOI → QUAND → OÙ → QUI ORGANISE → COMBIEN DE PLACES → COMMENT JE REJOINS, Plan Detail sans hero photo, avatar 44 px, liste des participantes plafonnée à 5 + compteur, cycles complets Direct et Sur demande, traitement du plan complet, actions secondaires, notice de sécurité, règle d'affichage progressif du lieu (15.1), toutes les micro-interactions et le motion, le responsive, l'accessibilité de base, la palette, la typographie, le spacing, Modern Medina.

---

# CHANGELOG — PLAN DETAIL + JOIN V1.2.1 → V1.3

Propagation de la réarchitecture de l'authentification (Blueprint V1.3) : le téléphone + OTP n'existe plus, remplacé par Sign in with Apple / Google. **Aucune autre décision fonctionnelle rouverte** — capacité, mode Auto-join/Request, adresse progressive, sécurité : tous inchangés.

| **SectionV1.2.1V1.3**          |                                                                                                                           |                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| §4 Créatrice                   | Référence au Design System V1.2.1 §14 et à la ligne "Compte confirmé par téléphone" comme existant dans le profil complet | Reformulé : **aucune ligne de confiance textuelle n'existe plus nulle part**, y compris dans le profil complet (Design System V1.3 §14) |
| §13bis, condition              | Condition en 3 points incluant `phone_verified_at IS NOT NULL` ; message "Confirme ton numéro pour continuer."            | Condition en 6 points (Blueprint §6.4) ; messages reformulés autour du profil complet et de la photo                                    |
| §13bis, feuille `under_review` | Référence à Create Plan V1.2.1 §12.2                                                                                      | Référence mise à jour vers Create Plan V1.3 §12.2                                                                                       |

**Ce qui n'a pas changé** : tout le reste, identique à la V1.2.1 — y compris le cas particulier d'une participante déjà acceptée dont le compte bascule `under_review` après coup.

---

# COHÉRENCE AVEC BLUEPRINT V1.3

| **Règle du Blueprint V1.3Couverture dans Plan Detail + Join V1.3**         |                                                                                                      |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| §6.2 — Authentification Apple/Google, aucun téléphone                      | §13bis, condition en 6 points, aucune référence au téléphone                                         |
| §6.4 — Condition d'accès en 6 points                                       | §13bis, comportement explicite du bouton Join pour un compte non conforme                            |
| §6.4bis — `under_review` binaire, aucun Create/Join/Chat                   | §13bis, y compris le cas d'un compte qui bascule `under_review` après avoir déjà rejoint un plan     |
| §6.5 — Jamais "vérifiée", Apple/Google jamais présentés comme vérification | §4, aucun signal de confiance attaché à la créatrice ; vocabulaire de §13bis aligné sur le Blueprint |
| §6.6 — Badge supprimé, aucune ligne de remplacement                        | §4, badge supprimé et absence de toute ligne de confiance textuelle explicitement actée              |
| §15.1 — Affichage progressif du lieu                                       | §3, non rouvert, conforme tel quel                                                                   |
| §28 — Vérification serveur systématique                                    | §13bis renvoie aux mêmes feuilles que Create Plan V1.3 §13, qui documentent la vérification serveur  |

---

# CONTRADICTIONS RESTANTES DOWNSTREAM

### ONBOARDING

- **Aucune contradiction** — Onboarding V1.3 est déjà finalisé et cohérent avec cette révision.

### Confirmations explicites

- **PLAN GROUP CHAT V1 : aucune contradiction.** Reconfirmé une nouvelle fois — ni badge, ni selfie, ni liveness, ni biométrie, ni téléphone référencés, dans le texte comme dans le mockup.
- **HOME V1.3 : propagée.** Corrections appliquées et publiées dans cette même passe.
- **CREATE PLAN V1.3 : propagée.** Corrections appliquées et publiées dans cette même passe ; les feuilles de §13bis de ce document en sont directement issues, sans duplication.
- **DESIGN SYSTEM V1.3 : propagée.** `PhoneConfirmedText` retiré, aucune ligne de confiance textuelle ne subsiste.

**Aucune contradiction restante identifiée à ce stade.**

---

**Aucune décision produit n'a été créée dans ce document au-delà des corrections demandées et de l'ajout nécessaire de §13bis.** Aucune biométrie, aucun badge n'a été réintroduit. Il ne reste plus qu'un seul document à propager : Onboarding + Verification V1, dont la réécriture complète est déjà cadrée par le nouveau flow canonique du Blueprint V1.2.1.