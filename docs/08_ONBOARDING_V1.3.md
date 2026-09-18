# SHEGO — ONBOARDING V1.3

Réécriture complète, pas un correctif. Remplace intégralement l'ancien "ONBOARDING V1.2.1", devenu obsolète depuis la réarchitecture de l'authentification (Blueprint V1.3). Applique le SHEGO PRODUCT BLUEPRINT V1.3, le SHEGO DESIGN SYSTEM V1.2.1, HOME V1.2.1, CREATE PLAN V1.2.1, PLAN DETAIL + JOIN V1.2.1, PLAN GROUP CHAT V1 et SAFETY LAYER V1.1. Aucun de ces documents n'est modifié par celui-ci.

> **Ce que ce parcours doit accomplir, en une phrase** : faire comprendre en moins d'une minute ce qu'est SHEGO et ce qu'on lui demande, sans qu'aucun écran ne présuppose une vérification qui n'existe pas. Aucun visage n'est capturé, aucune biométrie n'est traitée, aucun badge n'est promis, **aucun numéro de téléphone n'est demandé**. La confiance repose sur une authentification Apple ou Google, une photo de profil, et la possibilité de signaler et de bloquer — dite honnêtement, à chaque endroit où elle est mentionnée.

---

## 1. Objectifs

- Faire traverser à une nouvelle utilisatrice, en un minimum de temps, le chemin qui va de l'installation à une Home utilisable.
- Expliquer ce qu'est SHEGO (des plans, pas des profils) avant de demander quoi que ce soit.
- Collecter uniquement les données réellement nécessaires à l'usage du produit : identité légère, photo, préférences optionnelles.
- Poser un cadre de confiance honnête, jamais un cadre de vérification promise.
- Rendre un compte "prêt à participer" (Blueprint §6.4) dès la fin du parcours standard, sans étape intermédiaire superflue.
- Demander chaque permission système au bon moment, jamais en bloc, jamais sans explication préalable.

---

## 2. Principes UX

1. **Un CTA principal par écran, avec des actions secondaires uniquement lorsqu'elles sont nécessaires.** Gabarit commun sur tous les écrans de saisie : barre de progression fine, titre-question, champ, bouton plein largeur collé en bas.
2. **Rien n'est demandé sans justification visible à l'écran.** Chaque question porte sa propre raison d'être, en une phrase.
3. **Aucune étape ne mime une vérification.** Ni le ton, ni la structure, ni le vocabulaire d'aucun écran ne suggère un contrôle d'identité, une validation biométrique, ou un jugement sur la personne.
4. **Le refus d'une permission n'est jamais un mur.** Notifications et localisation sont optionnelles ; leur refus mène toujours à l'écran suivant.
5. **Retour toujours possible**, sauf sur le tout premier écran. **Le CTA principal est le moyen standard d'avancer. Aucun geste de navigation ne permet de contourner une étape obligatoire.**
6. **Aucune sauvegarde de brouillon détaillé.** Le compte existe dès l'auth Apple/Google réussie ; une interruption reprend à la dernière étape validée côté serveur, pas à un état local complexe.
7. **Le ton reste celui de tout SHEGO** : direct, chaleureux, tutoiement, jamais infantilisant, jamais anxiogène sur les sujets de sécurité.

---

## 3. Flow complet

```
Écran 1  — Welcome
Écran 2  — Welcome confiance
Écran 3  — Auth Apple / Google
Écran 4  — Prénom
Écran 5  — Date de naissance
Écran 6  — Ville
Écran 7  — Photo de profil
Écran 8  — Intérêts
Écran 9  — Bio
Écran 10 — Permission notifications
Écran 11 — Permission localisation
         → Home

```

**11 écrans d'onboarding avant la Home ; 12 étapes si l'arrivée sur Home est comptée comme étape de sortie.** Aucun écran intermédiaire n'est ajouté par rapport à cette liste ; aucun flow de vérification n'existe nulle part dans ce parcours ; **aucun écran de téléphone ni de code OTP n'existe**.

### Pourquoi cet ordre, inchangé sur le fond depuis la version précédente

L'authentification précède l'identité légère (prénom, âge, ville, photo), qui précède les champs optionnels (intérêts, bio), qui précèdent eux-mêmes les permissions système, chacune demandée juste avant que sa valeur soit concrète : les notifications juste avant la première Home où elles prendront sens, la localisation juste avant que la Home en ait besoin pour afficher des plans proches.

---

## 4. Spécification écran par écran

Gabarit commun à tous les écrans de saisie (écrans 3 à 9) : poignée absente (ce n'est pas une feuille mais un flow plein écran), bouton retour à gauche (sauf écran 1), barre de progression fine (Grenat sur Bordure) sous le header, titre-question centré verticalement dans le tiers supérieur, champ ou contrôle, CTA plein largeur collé en bas, clavier géré sans jamais masquer le CTA.

### Écran 1 — Welcome

|                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Poser la promesse centrale du produit avant tout formulaire, et la rendre immédiatement compréhensible par l'exemple                                                                                                                                                                                                                                                                                                                                                                            |
| **Contenu**         | Logotype `display.lg` Fraunces + signature ; headline `h1` : **"Publie une envie. Trouve des filles partantes. Aujourd'hui, près de toi."** ; sous le headline, **4 mini cartes de plan SHEGO** (pas des rectangles abstraits) illustrant ACTIVITÉ → MOMENT → LIEU → PARTICIPANTES : *Café à Gauthier · Dans 30 min · 3 places* / *Brunch ce week-end · Samedi · 2 places* / *Shopping Morocco Mall · Dans 1h · 4 places* / *Pilates à 18h · Aujourd'hui · 2 places* ; dots de pagination (1/2) |
| **CTA**             | `Commencer` (Primary, plein largeur)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Action suivante** | → Welcome confiance                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Lien secondaire** | `Tu as déjà un compte ? Se connecter` → Auth Apple/Google directement                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **État par défaut** | Premier dot actif                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Erreur**          | Sans objet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Retour arrière**  | Absent sur ce premier écran                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

**Sur les mini cartes de plan** : elles reprennent le format visuel de la Plan Card (tuile de catégorie, titre, moment, lieu — Design System V1.2.1 §7), en version miniature et non interactive, **sans photo hero, sans badge**. Les nombres de places affichés (« 3 places », « 2 places »…) sont **de purs exemples visuels**, choisis pour leur lisibilité immédiate — cet écran n'explique à aucun moment la règle de capacité d'un plan (minimum 2, maximum 20, défaut 4, modifiable après publication par la créatrice) : cette règle appartient à CREATE PLAN V1.2.1 et au Blueprint, pas à l'onboarding, et n'est ni énoncée ni sous-entendue ici.

### Écran 2 — Welcome confiance

|                     |                                                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Poser le cadre de confiance, une seule fois, avant l'auth                                                                                                                                                       |
| **Contenu**         | Headline : **"Une communauté entre femmes, modérée et protégée"** ; deux lignes à coche : *"Chaque compte est authentifié via Apple ou Google."* / *"Tu gardes le contrôle : signale ou bloque à tout moment."* |
| **CTA**             | `Commencer`                                                                                                                                                                                                     |
| **Action suivante** | → Auth Apple / Google                                                                                                                                                                                           |
| **État par défaut** | Second dot actif                                                                                                                                                                                                |
| **Retour arrière**  | → Welcome                                                                                                                                                                                                       |

> **Aucune des deux formulations de confiance de cet écran ne mentionne une vérification.** C'est la seule apparition du positionnement de confiance avant l'auth — elle n'est pas répétée plus loin dans l'onboarding pour ne pas paraître insister. **L'authentification Apple/Google n'est jamais présentée comme une preuve d'identité ou de genre** — cette ligne authentifie un compte, pas une personne.

### Écran 3 — Auth Apple / Google

|                     |                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Créer ou retrouver le compte, sans mot de passe ni numéro de téléphone                                                                                                                                |
| **Contenu**         | Logotype réduit ; titre : *"Connecte-toi pour continuer"* ; sous-texte : *"Aucun mot de passe à retenir, aucun numéro à confirmer."* ; **deux boutons d'égale importance**                            |
| **CTA**             | `Continuer avec Apple` (bouton natif Apple, noir, obligatoire sur iOS dès qu'une autre méthode tierce est proposée) et `Continuer avec Google` (bouton natif Google)                                  |
| **Action suivante** | → Prénom (nouveau compte) ou → Home directement (compte existant reconnu)                                                                                                                             |
| **Erreur**          | Échec ou annulation côté Apple/Google : retour à cet écran, aucun message alarmiste — *"La connexion n'a pas abouti. Réessaie."* Compte associé à un profil déjà banni : écran dédié factuel, voir §5 |
| **Retour arrière**  | → Welcome confiance                                                                                                                                                                                   |

**Ce que dit cette authentification, explicitement** : elle **authentifie l'accès au compte** via Apple ou Google. Aucune formulation de cet écran ni d'aucun autre ne dit "ton identité est vérifiée", "ton profil est vérifié" ou "tu es vérifiée". **Aucun numéro de téléphone n'est demandé à aucun moment de ce parcours.**

### Écran 4 — Prénom

|                     |                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objectif**        | Recueillir l'identifiant social utilisé partout dans le produit                                                                                        |
| **Contenu**         | Titre : *"Comment on t'appelle ?"* ; sous-texte : *"C'est ce prénom qui apparaîtra sur tes plans et dans les chats."* ; champ texte, 30 caractères max |
| **CTA**             | `Continuer` (actif dès 2 caractères)                                                                                                                   |
| **Validation**      | Minimum 2 caractères, filtre de mots interdits côté serveur, à la soumission                                                                           |
| **Action suivante** | → Date de naissance                                                                                                                                    |
| **Erreur**          | Champ vide ou trop court : bordure Error, *"Il faut au moins 2 caractères."*                                                                           |
| **Retour arrière**  | → Auth Apple / Google                                                                                                                                  |

### Écran 5 — Date de naissance

|                     |                                                                                                                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Vérifier la majorité, sans document officiel                                                                                                                                                                                                                   |
| **Contenu**         | Titre : *"Quelle est ta date de naissance ?"* ; sous-texte : *"Il faut avoir 18 ans pour utiliser SHEGO. Ton âge sera visible, pas ta date de naissance."* ; sélecteur natif jour/mois/année, aucune valeur pré-sélectionnée                                   |
| **CTA**             | `Continuer`                                                                                                                                                                                                                                                    |
| **Validation**      | Âge calculé ≥ 18 ans à la soumission                                                                                                                                                                                                                           |
| **Action suivante** | → Ville                                                                                                                                                                                                                                                        |
| **Erreur**          | Âge < 18 ans : message bloquant, factuel — *"SHEGO est réservé aux personnes majeures."* Le compte Apple/Google associé est bloqué côté serveur pour empêcher une nouvelle tentative. **Aucune pièce d'identité n'est jamais demandée**, y compris à ce stade. |
| **Retour arrière**  | → Prénom                                                                                                                                                                                                                                                       |

L'âge affiché ensuite dans le produit est **calculé depuis cette date**, jamais la date elle-même qui n'est jamais publique.

### Écran 6 — Ville

|                     |                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objectif**        | Confirmer la zone de découverte                                                                                                                              |
| **Contenu**         | Titre : *"Où es-tu ?"* ; sous-texte : *"Casablanca, pour l'instant — SHEGO arrive bientôt dans d'autres villes."* ; ligne unique pré-sélectionnée avec coche |
| **CTA**             | `Continuer` (actif immédiatement, une seule option existe)                                                                                                   |
| **Action suivante** | → Photo de profil                                                                                                                                            |
| **Erreur**          | Sans objet                                                                                                                                                   |
| **Retour arrière**  | → Date de naissance                                                                                                                                          |

### Écran 7 — Photo de profil

|                            |                                                                                                                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**               | Obtenir la photo obligatoire, dernière condition d'un compte prêt à participer                                                                                                                                                    |
| **Contenu**                | Titre : *"Ajoute une photo"* ; sous-texte, formulation canonique : *"Une photo claire aide les participantes à se reconnaître lorsqu'elles se retrouvent."* ; avatar placeholder = initiale du prénom déjà saisi, sur fond Argile |
| **CTA**                    | **Deux boutons d'égale importance** : `Prendre une photo` (Primary, ouvre la caméra) et `Choisir dans la galerie` (Secondary)                                                                                                     |
| **Étape suivante interne** | Recadrage : cadre circulaire fixe, image déplaçable/zoomable, `Utiliser cette photo` (Primary) / `Reprendre` (Tertiary)                                                                                                           |
| **Remplacer**              | Tap sur la photo déjà choisie rouvre les deux boutons de capture/galerie, à tout moment avant validation                                                                                                                          |
| **Action suivante**        | → Intérêts                                                                                                                                                                                                                        |
| **Erreur**                 | Échec d'upload : bannière Error, *"Ça n'a pas fonctionné. Réessaie."*, photo conservée localement pour un nouvel essai                                                                                                            |
| **Retour arrière**         | → Ville                                                                                                                                                                                                                           |

**Ce que cet écran ne contient à aucun degré** : aucune capture de type selfie/liveness, aucune détection de visage, aucune estimation de genre, aucune comparaison biométrique, aucun wording suggérant une validation quelconque de la photo au-delà d'un contrôle de qualité d'image (Safety Layer §10 — modération de contenu, jamais vérification d'identité). La photo est présentée comme un élément social de reconnaissance IRL, un point.

### Écran 8 — Intérêts

|                     |                                                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Personnaliser légèrement l'expérience future, sans créer de logique de mise en relation entre personnes                                                                                                                            |
| **Contenu**         | Titre : *"Qu'est-ce qui te tente ?"* ; sous-texte : *"Choisis les activités qui te tentent."* ; en petit texte juste en dessous : *"Tu pourras modifier tes choix plus tard."* ; grille de chips reprenant les 12 catégories SHEGO |
| **CTA**             | `Continuer` (actif dès 3 sélections, sans blocage strict)                                                                                                                                                                          |
| **Lien secondaire** | `Passer` (Tertiary, disponible à tout moment, y compris avant 3 sélections)                                                                                                                                                        |
| **Action suivante** | → Bio                                                                                                                                                                                                                              |
| **Erreur**          | Sans objet — aucun minimum n'est réellement imposé, `Passer` reste une échappatoire à tout moment                                                                                                                                  |
| **Retour arrière**  | → Photo de profil                                                                                                                                                                                                                  |

**Rôle strictement limité** : ces intérêts n'alimentent qu'un tri secondaire optionnel de la Home (LATER). **Aucun affichage du type "on va te trouver des filles compatibles"**, aucune logique de matching, aucune suggestion de personnes sur la base de ces intérêts — ils concernent des catégories d'activité, jamais des profils.

### Écran 9 — Bio

|                     |                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**        | Permettre une touche personnelle facultative                                                                                      |
| **Contenu**         | Titre : *"Un mot sur toi ? (optionnel)"* ; champ multiligne, placeholder d'exemple grisé ; compteur `0/150` visible en permanence |
| **CTA**             | `Continuer` (toujours actif, avec ou sans texte)                                                                                  |
| **Lien secondaire** | `Passer`                                                                                                                          |
| **Limite**          | 150 caractères                                                                                                                    |
| **Action suivante** | → Permission notifications                                                                                                        |
| **Erreur**          | Sans objet, ce champ ne bloque jamais                                                                                             |
| **Retour arrière**  | → Intérêts                                                                                                                        |

Aucun élément orienté dating dans le placeholder ni dans la formulation de l'écran.

### Écran 10 — Permission notifications

|                                   |                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**                      | Faire comprendre la valeur des notifications avant de déclencher le prompt système                                                                          |
| **Contenu**                       | Icône cloche ; titre : *"Ne rate rien"* ; sous-texte : *"On te préviendra quand quelqu'une rejoint ton plan, accepte ta demande, ou t'écrit dans un chat."* |
| **CTA**                           | `Activer` (déclenche le prompt système natif)                                                                                                               |
| **Lien secondaire**               | `Plus tard` (Tertiary, passe à l'écran suivant sans notification)                                                                                           |
| **Action suivante**               | → Permission localisation, quel que soit le choix                                                                                                           |
| **Comportement si refus système** | Aucun écran d'erreur, aucun blocage ; passage normal à l'écran suivant                                                                                      |
| **Retour arrière**                | → Bio                                                                                                                                                       |

### Écran 11 — Permission localisation

|                                   |                                                                                                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objectif**                      | Faire comprendre la valeur de la localisation avant de déclencher le prompt système                                                                                                                       |
| **Contenu**                       | Icône épingle ; titre : *"Trouve ce qui se passe près de toi"* ; sous-texte : *"SHEGO te montre les plans autour de toi. Sans ta position, tu peux seulement voir les plans dans Casablanca en général."* |
| **CTA**                           | `Activer`                                                                                                                                                                                                 |
| **Lien secondaire**               | `Plus tard`                                                                                                                                                                                               |
| **Action suivante**               | → Home, quel que soit le choix                                                                                                                                                                            |
| **Comportement si refus système** | La Home s'ouvre quand même, en mode "ville entière" (cohérent avec Home V1.2.1, état "Localisation refusée") ; **jamais un cul-de-sac**                                                                   |
| **Retour arrière**                | → Permission notifications                                                                                                                                                                                |

**Aucune position exacte d'une utilisatrice n'est jamais montrée à d'autres personnes** — la localisation ne sert qu'à afficher des plans proches et des distances approximatives (Blueprint §15, point 3).

---

## 5. États et erreurs — transverses

| **ÉtatOùComportement**                                             |                                                   |                                                                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**                                                        | Authentification Apple/Google, upload de la photo | Spinner dans le CTA, largeur inchangée, écran non interactif                                                                           |
| **Erreur réseau**                                                  | À tout moment                                     | Bannière Error haute ou bordure de champ, formulation actionnable                                                                      |
| **Permission refusée**                                             | Notifications, localisation                       | Jamais de blocage, jamais de message culpabilisant, passage à l'écran suivant                                                          |
| **Âge insuffisant**                                                | Écran 5                                           | Blocage définitif du compte Apple/Google associé, message factuel sans reformulation possible                                          |
| **Compte déjà existant** (Apple/Google déjà associé)               | Écran 3                                           | Bascule automatique vers la reconnexion plutôt qu'une nouvelle création — direction directe vers la Home si le profil est déjà complet |
| **Compte restreint** (Apple/Google déjà associé à un compte banni) | Écran 3                                           | Écran dédié factuel : *"Ce compte ne peut pas être utilisé pour l'instant."* + lien support, sans détail sur la raison exacte          |
| **Hors ligne**                                                     | À tout moment                                     | Bannière Argile basse persistante, *"Pas de connexion. On réessaie automatiquement."*                                                  |

**Aucun état de ce tableau ne s'appelle, ne ressemble à, ou ne se comporte comme un état de vérification.** Il n'y a rien à vérifier dans ce parcours au-delà de l'authentification Apple/Google elle-même et de l'âge déclaré. **Aucun état de ce tableau ne référence un numéro de téléphone ou un code OTP.**

---

## 6. Permissions

Deux permissions système sont demandées sur des écrans dédiés : notifications et localisation. La permission caméra est demandée uniquement au moment où l'utilisatrice choisit de prendre une photo.

| **PermissionÉcran d'explicationMomentBloque l'accès si refusée ?** |                   |                                                                              |                                                                                 |
| ------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Notifications                                                      | Écran 10          | Juste avant l'arrivée sur Home                                               | Non                                                                             |
| Localisation                                                       | Écran 11          | Juste avant l'arrivée sur Home, après notifications                          | Non                                                                             |
| Caméra                                                             | Aucun écran dédié | Déclenchée par le système au moment du tap sur "Prendre une photo" (écran 7) | Non — l'utilisatrice peut toujours choisir "Choisir dans la galerie" à la place |

**Le refus d'une permission, quelle qu'elle soit, ne bloque jamais la création du compte ni l'accès à la Home.**

---

## 7. Sécurité / Safety Layer

Cet onboarding reflète directement la SHEGO SAFETY LAYER V1.1, sans en faire une page anxiogène :

- **Écran 2 (Welcome confiance)** porte le seul message de principe : *"Une communauté entre femmes, modérée et protégée."*
- Les barrières d'entrée effectivement mises en œuvre par ce parcours sont, dans l'ordre : **authentification Apple ou Google** (écran 3), âge déclaré ≥ 18 ans (écran 5), photo de profil (écran 7) — exactement les barrières d'entrée de la Safety Layer §4 révisée, ni plus ni moins.
- La possibilité de **signaler** et de **bloquer** n'est pas ré-expliquée en détail pendant l'onboarding (elle est déjà mentionnée en Welcome confiance) : elle vit pleinement dans les Paramètres et les écrans de plan, hors périmètre de ce document.
- **Formulations strictement interdites, à aucun endroit de ce parcours** : *"Toutes les femmes sont vérifiées."* · *"Chaque membre est authentifié [comme identité/genre]."* · *"100 % de femmes réelles."* · *"Tu es vérifiée."* · *"Vérification de genre."* · toute formulation présentant Apple ou Google comme une preuve d'identité ou de genre.

À la fin de l'onboarding, un compte est **prêt à participer** (Blueprint §6.4, Safety Layer §4) si et seulement si :

1. Session Apple ou Google valide
2. Prénom renseigné
3. Date de naissance renseignée, 18+ confirmé
4. Ville renseignée
5. Photo de profil présente
6. `account_status = active`

Dans le parcours standard décrit ci-dessus, les cinq premières conditions sont remplies mécaniquement à la fin de l'écran 7 ; la sixième est vraie par défaut pour tout nouveau compte qui n'a fait l'objet d'aucun signalement. **`under_review`**** ne fait partie de l'onboarding sous aucune forme** — voir §9 de ce document pour la clarification complète.

---

## 8. Données collectées

| **DonnéeÉcranObligatoire**                               |    |                                           |
| -------------------------------------------------------- | -- | ----------------------------------------- |
| Identifiant de session Apple ou Google (`auth_provider`) | 3  | Oui                                       |
| Prénom                                                   | 4  | Oui                                       |
| Date de naissance (âge calculé, jamais affiché en clair) | 5  | Oui                                       |
| Ville                                                    | 6  | Oui (valeur unique en V1)                 |
| Photo de profil                                          | 7  | Oui                                       |
| Intérêts                                                 | 8  | Non                                       |
| Bio                                                      | 9  | Non                                       |
| Préférence de notifications (accordée ou non)            | 10 | N/A — état système, pas une donnée saisie |
| Préférence de localisation (accordée ou non)             | 11 | N/A — état système                        |

**Rien n'est collecté au-delà de cette liste. Aucun numéro de téléphone n'est collecté pour le MVP.** Aucune donnée biométrique, aucune pièce d'identité, aucune donnée de genre déclarée ou déduite.

---

## 9. Suppression / conservation

> **Principe canonique, repris de Safety Layer V1.1 §13** : *"Les données personnelles sont conservées uniquement pendant la durée nécessaire à leur finalité et supprimées ou anonymisées lorsqu'elles ne sont plus nécessaires, sous réserve des obligations légales applicables."*

Lorsqu'un compte créé via cet onboarding est supprimé :

- la **photo de profil** est supprimée ;
- les **données de profil** (prénom, date de naissance, ville, bio, intérêts) sont supprimées ;
- **la liaison au compte Apple/Google** est supprimée côté Supabase Auth.

**Aucun délai chiffré n'est fixé dans ce document** — le délai opérationnel exact relève de la politique de confidentialité du produit, à valider juridiquement. **Le mécanisme de prévention de la récidive post-suppression n'existe pas dans le MVP** (Safety Layer §9) : supprimer un compte créé via cet onboarding, y compris un compte qui aurait été suspendu ou banni, ne laisse aucune empreinte exploitable dans le but d'empêcher une recréation future.

L'onboarding lui-même ne collecte et ne crée aucune donnée qui ne soit déjà couverte par cette politique — il n'introduit aucune exception.

---

## 10. Accessibilité

*(Conforme au Design System V1.2.1, sans exception.)*

- Chaque écran de saisie annonce sa position dans le parcours via la barre de progression (`accessibilityValue`, par exemple "Étape 4 sur 11" pour l'écran Prénom), pas seulement visuellement.
- Le sélecteur de date de naissance utilise le composant natif, héritant de son accessibilité complète.
- Les boutons Apple/Google (écran 3) utilisent les composants natifs fournis par chaque plateforme, qui portent déjà leur propre accessibilité complète.
- Zones tactiles ≥ 44 × 44 sur tous les boutons et contrôles.
- Dynamic Type jusqu'à 120 % sans rupture ; au-delà, la grille d'intérêts passe de 3 à 2 colonnes.
- RTL : progression inversée, bouton retour à droite.
- Erreurs toujours annoncées et associées programmatiquement au champ concerné, jamais portées par la seule couleur.
- Contrastes : tous les textes passent par les tokens standard (Encre sur Sable, Encre 70), déjà validés à 4.5:1 minimum.

---

## 11. Responsive

| **390 × 844375 × 667360 × 640** |                                                   |            |            |
| ------------------------------- | ------------------------------------------------- | ---------- | ---------- |
| Marges latérales                | 20                                                | 20         | 16         |
| Titre d'écran (`h1`)            | 24                                                | 22         | 21         |
| Grille d'intérêts               | 3 colonnes                                        | 3 colonnes | 2 colonnes |
| Zone caméra (capture photo)     | plein écran, cadre de recadrage à 70 % de largeur | idem, 75 % | idem, 78 % |

Le CTA reste collé en bas, jamais dans le flux, sur toutes les tailles — cohérent avec le gabarit commun.

---

## 12. Wireframes

### Gabarit commun (écrans 3 à 9)

```
╭──────────────────────────────────────────────╮
│  ←                                            │
│  ▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  progression
│                                              │
│        [Titre-question]                      │
│                                              │
│        [Sous-texte de justification]         │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │           [champ ou contrôle]           │  │
│  └────────────────────────────────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │               Continuer                │  │
│  └────────────────────────────────────────┘  │
╰──────────────────────────────────────────────╯

```

### Écran 1 — Welcome (détail)

```
╭──────────────────────────────────────────────╮
│                                              │
│                 SHEGO                        │
│           Find your girls. Go.               │
│                                              │
│   Publie une envie.                          │
│   Trouve des filles partantes.               │
│   Aujourd'hui, près de toi.                  │
│                                              │
│  ┌──┐ Café à Gauthier                        │
│  │☕│ Dans 30 min · 3 places                  │
│  └──┘                                        │
│  ┌──┐ Brunch ce week-end                     │
│  │🥐│ Samedi · 2 places                       │
│  └──┘                                        │
│  ┌──┐ Shopping Morocco Mall                  │
│  │🛍│ Dans 1h · 4 places                      │
│  └──┘                                        │
│  ┌──┐ Pilates à 18h                          │
│  │🏋│ Aujourd'hui · 2 places                  │
│  └──┘                                        │
│                                              │
│                 ●  ○                          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │              Commencer                 │  │
│  └────────────────────────────────────────┘  │
│           Tu as déjà un compte ? Se connecter │
╰──────────────────────────────────────────────╯

```

*(Les quatre mini cartes remplacent les rectangles colorés abstraits d'une version antérieure. Elles ne sont ni tapables ni interactives — de purs exemples visuels, sans lien avec la règle de capacité d'un plan, qui n'appartient pas à l'onboarding.)*

### Écran 3 — Auth Apple / Google (détail)

```
╭──────────────────────────────────────────────╮
│  ←                                            │
│  ▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  3/11
│                                              │
│              SHEGO                           │
│                                              │
│        Connecte-toi pour continuer           │
│                                              │
│  Aucun mot de passe à retenir, aucun         │
│  numéro à confirmer.                         │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │        Continuer avec Apple            │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │        Continuer avec Google           │  │
│  └────────────────────────────────────────┘  │
╰──────────────────────────────────────────────╯

```

### Écran 7 — Photo de profil (détail)

```
╭──────────────────────────────────────────────╮
│  ←                                            │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░  │  7/11
│                                              │
│        Ajoute une photo                      │
│                                              │
│  Une photo claire aide les participantes     │
│  à se reconnaître lorsqu'elles se            │
│  retrouvent.                                 │
│                                              │
│              ┌──────────────┐                │
│              │              │                │
│              │   (initiale  │                │
│              │   du prénom) │                │
│              │              │                │
│              └──────────────┘                │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │           Prendre une photo            │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │          Choisir dans la galerie        │  │
│  └────────────────────────────────────────┘  │
╰──────────────────────────────────────────────╯

```

### Écran 10/11 — Permissions (gabarit partagé)

```
╭──────────────────────────────────────────────╮
│  ←                                            │
│              (icône, 64)                     │
│                                              │
│        [Titre de valeur]                     │
│                                              │
│  [Explication concrète de l'usage]           │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │                Activer                 │  │
│  └────────────────────────────────────────┘  │
│              Plus tard                        │
╰──────────────────────────────────────────────╯

```

---

## 13. Mockup HTML

Onze écrans, construits avec les vrais tokens SHEGO — fond Sable, Grenat `#6B2A4F`, Fraunces réservé au logotype et aux titres Welcome, Plus Jakarta Sans partout ailleurs, rayons 16/14, aucune photo hero, aucun badge, aucun champ téléphone, aucun clavier OTP. Voir l'artefact HTML séparé, publié avec ce document.

**Aucune capture selfie, aucun écran de vérification, aucun badge, aucun écran téléphone/OTP n'apparaît dans le mockup** — vérifié écran par écran lors de sa reconstruction.

---

## 14. Architecture de navigation liée à l'onboarding

- L'onboarding est un **flow plein écran**, hors de la barre de navigation à 4 onglets + bouton central (Design System V1.2.1 §11) : la TabBar n'existe pas encore, puisque le compte n'a pas terminé sa création.
- **Aucun bouton retour n'existe sur l'écran 1** (Welcome) : c'est la porte d'entrée unique du parcours.
- La transition finale (écran 11 → Home) est une transition de pile standard vers la Home, qui s'ouvre directement dans son état par défaut — **aucune animation de bienvenue superposée sur la Home elle-même**, cohérente avec Home V1.2.1 qui n'a jamais prévu un tel état.
- Un compte qui interrompt l'onboarding en cours de route (fermeture de l'app) et revient plus tard **reprend à la dernière étape validée côté serveur** — pas de brouillon local détaillé au-delà de ce qui est déjà écrit en base à chaque étape validée. La reconnexion Apple/Google (écran 3) reconnaît directement le compte existant et reprend au bon endroit.

---

## 15. CHANGELOG V1 → V1.2.1

*(Historique conservé tel quel — cette transition documentait la suppression du selfie/liveness, indépendante du changement d'authentification traité en §16 ci-après.)*

| **ÉlémentV1 (ONBOARDING + VERIFICATION)V1.2.1 (ONBOARDING)** |                                                                                 |                                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre du document                                            | "ONBOARDING + VERIFICATION V1"                                                  | "ONBOARDING V1.2.1" — le mot "Verification" disparaît du titre lui-même, puisqu'aucune vérification biométrique n'existe plus dans ce parcours |
| Nombre d'écrans                                              | 17 (dont 4 liés à la capture/résultat biométrique)                              | 12 — les 4 écrans de vérification disparaissent, et les deux premiers écrans Welcome sont fusionnés en un seul                                 |
| Écran "Introduction vérification"                            | Présent, bouclier + 3 puces                                                     | **Supprimé intégralement**                                                                                                                     |
| Écran "Capture / liveness"                                   | Présent, plein écran caméra avec ovale de cadrage                               | **Supprimé intégralement**                                                                                                                     |
| Écran "Résultat — Vérifiée / Failed / Under review"          | Présent, 3 états                                                                | **Supprimé intégralement** — le concept même de résultat de vérification n'existe plus                                                         |
| Vocabulaire de confiance                                     | *"Ta sécurité passe avant tout"*, *"Tu es vérifiée"*, badge affiché en résultat | *"Une communauté entre femmes, modérée et protégée"* (Welcome confiance uniquement), aucun badge, aucun résultat de vérification               |
| Welcome 1 + Welcome 2                                        | Deux écrans distincts                                                           | Fusionnés en un seul écran "Welcome" avec 4 mini cartes de plan réalistes                                                                      |

**Ce qui n'a pas changé à l'époque** : l'ordre logique identité légère → optionnel → permissions ; le gabarit commun ; le ton conversationnel ; l'auth par téléphone +212 et OTP (**abandonnée depuis, voir §16**) ; la vérification de majorité par date de naissance ; la ville unique en V1 ; le caractère obligatoire de la photo.

---

## 16. CHANGELOG V1.2.1 → V1.3

Réarchitecture de l'authentification : le numéro de téléphone marocain + OTP SMS est intégralement retiré de l'onboarding, remplacé par un écran unique Sign in with Apple / Sign in with Google. **Aucune autre décision produit rouverte.**

| **ÉlémentV1.2.1V1.3**   |                                                                                     |                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Nombre d'écrans         | 12                                                                                  | **11** — les écrans "Auth téléphone" et "Code OTP" (2 écrans) fusionnent en un seul écran "Auth Apple / Google"               |
| Écran 3                 | "Auth téléphone" — champ +212, numéro                                               | "Auth Apple / Google" — deux boutons natifs, aucun champ de saisie                                                            |
| Écran 4                 | "Code OTP" — 6 cases, renvoi de code                                                | **Supprimé intégralement**, n'a plus d'objet                                                                                  |
| Écrans 5-12 (V1.2.1)    | Prénom → Localisation                                                               | Renumérotés 4-11, contenu inchangé                                                                                            |
| §2 Welcome confiance    | *"Chaque compte est confirmé par téléphone."*                                       | *"Chaque compte est authentifié via Apple ou Google."*                                                                        |
| §5 États et erreurs     | "Compte déjà existant (numéro)", "Compte restreint (numéro)"                        | Reformulées autour du compte Apple/Google ; ligne "Code incorrect"/"Trop de tentatives" supprimée, n'a plus d'objet           |
| §7 Safety Layer         | Barrières : téléphone confirmé, âge, photo                                          | Barrières : authentification Apple/Google, âge, photo                                                                         |
| §8 Données collectées   | Numéro de téléphone, `phone_verified_at`                                            | `auth_provider` (identifiant de session Apple/Google) ; **aucune donnée de téléphone collectée**                              |
| §9 Suppression          | "le numéro de téléphone est supprimé", "`phone_verified_at` est supprimé"           | "la liaison au compte Apple/Google est supprimée côté Supabase Auth"                                                          |
| §10, §11, §12, §13, §14 | Références à l'écran 12 (Localisation), au champ téléphone, aux wireframes Auth/OTP | Toutes les références renumérotées ; wireframe Auth téléphone remplacé par wireframe Auth Apple/Google ; wireframe OTP retiré |

**Ce qui n'a pas changé** : l'ordre logique identité légère → optionnel → permissions ; le gabarit commun des écrans de saisie ; le ton conversationnel ; la vérification de majorité par date de naissance ; la ville unique en V1 ; le caractère obligatoire de la photo ; le caractère optionnel des intérêts et de la bio ; les permissions demandées séparément sans jamais bloquer l'accès ; la formulation canonique de la photo ; l'absence de toute biométrie.

---

## 17. COHÉRENCE AVEC BLUEPRINT V1.3

| **Règle du Blueprint V1.3Couverture dans Onboarding V1.3**                                                      |                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| §6.1 — Aucun traitement biométrique                                                                             | Aucun écran, aucun composant, aucun wording de ce parcours ne référence selfie, liveness, reconnaissance faciale ou comparaison biométrique |
| §6.2 — Authentification Apple/Google, aucun téléphone                                                           | Écran 3, deux boutons natifs, aucun champ de saisie de numéro                                                                               |
| §6.2 — Photo de profil, justification canonique                                                                 | Écran 7, formulation reprise mot pour mot                                                                                                   |
| §6.3 — `account_status` à 4 valeurs, aucune donnée de téléphone                                                 | §8, aucune collecte de téléphone ; §7, condition de compte prêt reprise textuellement                                                       |
| §6.4 — Condition d'accès en 6 points                                                                            | §7, les six conditions listées explicitement comme résultat naturel du parcours standard                                                    |
| §6.4bis — `under_review` binaire                                                                                | §9 de ce document (le mot "under\_review" n'apparaît que pour dire qu'il n'appartient pas à l'onboarding)                                   |
| §6.5 — Jamais "vérifiée", jamais de promesse d'identité/genre, jamais Apple/Google présentés comme vérification | §7, liste explicite des formulations interdites                                                                                             |
| §6.6 — Badge supprimé, aucune ligne "confirmé par téléphone"                                                    | Confirmé : aucun badge, aucune ligne de confiance textuelle, à aucun écran                                                                  |
| §15 point 3 — Aucune position exacte partagée                                                                   | Écran 11, rappel explicite                                                                                                                  |
| Safety Layer §4 — Barrières d'entrée révisées                                                                   | §7, les trois barrières (Apple/Google, âge, photo) correspondent exactement                                                                 |
| Safety Layer §13 — Principe de conservation                                                                     | §9, principe repris mot pour mot                                                                                                            |

---

## 18. CONTRADICTIONS RESTANTES

**Aucune contradiction interne à ce document.** Onboarding V1.3 est intégralement cohérent avec Blueprint V1.3 et Safety Layer V1.1, révisés dans la même passe.

**Contradictions résiduelles dans d'autres documents, hors périmètre de cette révision** — non traitées ici :

- Design System V1.2.1 (composant `PhoneConfirmedText`, devenu sans objet).
- Home V1.2.1, Create Plan V1.2.1, Plan Detail + Join V1.2.1 (conditions d'accès et messages "ce qui manque" encore formulés autour du téléphone).

Voir le Blueprint V1.3, section CONTRADICTIONS À PROPAGER (V1.3), pour le détail exhaustif de ces quatre documents.

---

## Confirmations finales

- **Aucune biométrie** — vérifié écran par écran, section par section.
- **Aucun badge** — vérifié, y compris dans le mockup HTML.
- **Aucun numéro de téléphone, aucun OTP, aucun SMS** — vérifié à chaque section ; les deux anciens écrans Auth téléphone et Code OTP n'existent plus sous aucune forme.
- **Aucune vérification d'identité** — le mot "vérification" n'apparaît dans ce document que pour expliquer son absence ou distinguer l'onboarding de la modération.
- **Aucune vérification de genre** — à aucun endroit, sous aucune formulation, y compris reformulée. L'authentification Apple/Google n'est jamais présentée comme une preuve d'identité ou de genre.
- **Safety Layer V1.1 intégrée** — §7 relie explicitement les barrières d'entrée révisées de ce parcours à celles définies dans SAFETY LAYER V1.1 §4, et le principe de conservation de SAFETY LAYER V1.1 §13 est repris à l'identique en §9.
- **Aucun autre document modifié** — seul ce document et le Blueprint V1.3 / Safety Layer V1.1 ont été révisés dans cette passe ; Design System V1.2.1, Home V1.2.1, Create Plan V1.2.1, Plan Detail + Join V1.2.1 et Plan Group Chat V1 restent inchangés, avec les contradictions résiduelles listées en §18.