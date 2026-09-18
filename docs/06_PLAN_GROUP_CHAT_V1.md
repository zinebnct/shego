# SHEGO — PLAN GROUP CHAT V1

Applique le PRODUCT BLUEPRINT LOCKED V1.1, le DESIGN SYSTEM V1, la HOME V1.2 LOCKED, CREATE PLAN V1 LOCKED et PLAN DETAIL + JOIN V1 LOCKED. Aucune décision verrouillée n'est modifiée, aucune fonctionnalité ajoutée.

> **Le chat n'est pas une messagerie.** C'est une pièce attachée à un plan, qui existe parce que le plan existe et qui s'éteint avec lui. Chaque écran de cette spec vérifie une seule règle : est-ce qu'on est en train de préparer une sortie, ou est-ce qu'on est en train de construire un réseau social ? Au moindre doute, on retire.

---

## 1. Structure du chat

```
1. Header — retour · identité minimale du plan · bouton participantes
2. Plan header épinglé — collant, toujours visible pendant le défilement
3. Liste des messages — bulles + messages système, groupés par autrice
4. Composer — collant en bas, au-dessus du clavier

```

Deux zones collantes encadrent un contenu qui défile : le **plan header** en haut rappelle en permanence *pourquoi* cette conversation existe, le **composer** en bas est la seule action. Entre les deux, uniquement des messages — pas de fil d'activité, pas d'onglets, pas de section annexe.

Le contexte du plan reste identifiable à tout moment : impossible de faire défiler le plan header hors de vue, impossible d'oublier de quel plan on parle même après cinquante messages.

### Accès au détail du plan

Le plan header entier est **tapable** et ouvre PLAN DETAIL. C'est la seule porte vers le détail depuis le chat — aucun lien redondant ailleurs dans l'écran.

---

## 2. Accès

Reprend exactement la table de PLAN DETAIL §12, appliquée ici comme condition d'entrée à l'écran plutôt que comme état d'un bouton.

| **QuiAccès au chatMode**                               |               |                                                                          |
| ------------------------------------------------------ | ------------- | ------------------------------------------------------------------------ |
| Créatrice                                              | Oui, toujours | Lecture/écriture                                                         |
| Participante acceptée (Direct)                         | Oui           | Lecture/écriture                                                         |
| Participante acceptée (Sur demande, après acceptation) | Oui           | Lecture/écriture                                                         |
| Demande en attente                                     | **Non**       | L'écran n'est pas atteignable ; le CTA du détail reste `Demande envoyée` |
| Demande refusée ou expirée                             | **Non**       | Idem, jamais eu accès                                                    |
| Plan passé, était participante                         | Oui           | **Lecture seule**                                                        |
| Plan passé, n'était pas participante                   | Non           | —                                                                        |
| Plan annulé, était participante                        | Oui           | Lecture seule                                                            |
| Plan annulé, n'était pas participante                  | Non           | —                                                                        |
| Compte bloqué (bloquante ou bloquée)                   | Non           | Le plan et son chat disparaissent simplement de ses listes               |

**Aucun DM privé n'existe nulle part dans SHEGO.** Ce chat est le seul espace de messagerie du produit ; il n'y a rien à exclure d'un DM puisqu'il n'y en a pas à concevoir.

---

## 3. Plan header épinglé

```
┌──────────────────────────────────────────────┐
│ ┌──┐  Café à Gauthier                    ›   │
│ │☕│  Aujourd'hui 15h30 · Café Bianca — Gauthier│
│ └──┘                                          │
└──────────────────────────────────────────────┘

```

- Hauteur **64**, fond Argile, bordure basse 1 px Bordure, position collante sous le header système.
- Tuile de catégorie **32**, même teinte et motif que partout ailleurs.
- Ligne 1 : titre du plan, `label` 14/600 Encre, une ligne, ellipse.
- Ligne 2 : heure + lieu, `caption` 12,5/500 Encre 70, une ligne, ellipse — format `Aujourd'hui 15h30 · Café Bianca — Gauthier`.
- Chevron de fin, Encre 45.

### Avant / après acceptation

La ligne 2 suit exactement la règle 15.1, déjà tranchée en PLAN DETAIL — ce chat n'a jamais à afficher lui-même l'ambiguïté puisqu'on n'y accède qu'une fois **déjà accepté**. Elle affiche donc systématiquement :

- **Participante ou créatrice** : `<lieu nommé> — <quartier>` (le niveau `lieu_public`, suffisant pour l'en-tête).
- L'**adresse exacte complète** n'apparaît pas dans l'en-tête compact — elle vit dans PLAN DETAIL, à un tap via le chevron. Répéter l'adresse complète ici alourdirait une barre qui doit rester lisible en un coup d'œil.

Si le lieu ou l'heure sont modifiés par la créatrice après publication, la ligne 2 se met à jour en fondu croisé et un message système est posté (§11).

---

## 4. Messages

### Bulles

Reprend le Design System §13 à l'identique :

- **Reçues** : Surface, bordure 1 px, `radius.lg` avec coin bas-début à 6.
- **Envoyées** : `Grenat 100` `#F2E6EC`, sans bordure, coin bas-fin à 6.
- Largeur max 78 % de l'écran, padding 12/14.

### Identité

- Avatar `avatar.xs` 20 affiché **uniquement sur la première bulle d'un groupe**, côté début.
- Prénom en `caption` Encre 70 au-dessus de la première bulle d'une autrice.
- Regroupement : messages consécutifs de la même autrice espacés de 4 ; changement d'autrice espacé de 12.
- Messages envoyés : ni avatar ni prénom, l'alignement à droite (ou début-inversé en RTL) suffit à les identifier.

### Timestamp

- Pas affiché sur chaque bulle : affiché sous la **dernière bulle d'un groupe**, `caption` 11,5 Encre 45.
- Format relatif court : `14:32`. Un séparateur de date (`Aujourd'hui`, `Hier`, `Sam. 12`) apparaît centré entre deux groupes de jours différents, `caption` Encre 45 sur fond Sable.

### Longueur et registre

- Pas de limite de caractères stricte affichée à l'utilisatrice (au-delà d'un plafond serveur raisonnable, 1000 caractères, jamais atteint en usage normal).
- Aucun rendu de lien enrichi, aucun aperçu de média : un message est du texte, point. Cohérent avec §9 (pas de photo).

---

## 5. Premier message et arrivée dans le plan

### Ce qui se passe automatiquement

À la création du plan, le chat existe déjà, vide, avec la créatrice pour seule membre. À chaque nouvelle acceptation (Direct immédiat, ou Sur demande validée), **un seul message système** est posté :

```
        Yasmine a rejoint le plan

```

Centré, sans bulle, `caption` Info `#2C5A8C`, séparé de 16 au-dessus et en dessous. Rien d'autre : pas de message de bienvenue automatique, pas de suggestion d'icebreaker, pas de bulle "Dis bonjour !". **Aucune conversation n'est générée artificiellement.** Si personne n'écrit, le chat reste silencieux — c'est un état normal, traité en §6, pas une anomalie à masquer.

### Pourquoi ne rien ajouter de plus

Un message de bienvenue automatisé ou une suggestion de conversation transformerait l'écran en produit qui *anime* la relation à la place des utilisatrices. Ce n'est pas le rôle de SHEGO : le produit met en présence, les personnes prennent le relais. C'est aussi ce qui tient la promesse du §19 — un espace de préparation, pas un réseau qui s'anime tout seul.

---

## 6. Empty state

```
┌──────────────────────────────────────────────┐
│ ┌──┐  Café à Gauthier                    ›   │
│ │☕│  Aujourd'hui 15h30 · Café Bianca…        │
│ └──┘                                          │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              ⌾ (icône légère)                │
│           C'est calme pour l'instant          │
│     Dis bonjour ou cale les derniers          │
│              détails avec Yasmine.            │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│  Écris un message…                    ⤴      │
└──────────────────────────────────────────────┘

```

- Icône 40 (bulle légère, même famille graphique que les autres états vides), `display.sm` en titre, `body` Encre 70 en corps.
- **Aucun bouton dans cet état** — le champ de saisie en bas *est* l'action, exactement comme le Blueprint le demande (« le champ de message doit être l'action principale »).
- Le corps se personnalise avec le prénom d'une participante si le plan en compte une (`avec Yasmine`), sinon reste générique (`Dis bonjour à tout le monde.`).
- Titre : `C'est calme pour l'instant` plutôt que `Aucun message` — évite le registre d'erreur pour un état qui est simplement normal.

---

## 7. Composer

| **PropriétéValeur** |                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hauteur (1 ligne)   | 52, grandit jusqu'à 3 lignes (≈ 96) puis défile en interne                                                                                                            |
| Fond / rayon        | Surface, `radius.lg` 16, bordure 1 px Bordure, focus → 2 px Grenat                                                                                                    |
| Placeholder         | `Écris un message…`                                                                                                                                                   |
| Bouton envoyer      | Icône 20, cercle 36, Grenat plein si texte présent, Argile/Encre 45 si vide et non tapable                                                                            |
| Clavier             | `default`, capitalisation de phrase, retour à la ligne autorisé (touche retour insère un saut de ligne, pas d'envoi)                                                  |
| Longueur            | 1000 caractères, compteur affiché seulement au-delà de 900                                                                                                            |
| Vide                | Bouton envoyer désactivé, pas de placeholder d'erreur                                                                                                                 |
| Loading             | Le message envoyé apparaît **immédiatement** dans le fil en état `sending` (opacité 60 %, pas de spinner bloquant) — envoi optimiste, cohérent avec un produit rapide |
| Erreur d'envoi      | La bulle passe en bordure Error fine + icône `⟳` de ré-essai à sa gauche ; tap pour renvoyer, appui long pour supprimer le brouillon                                  |

Le composer reste **collé au-dessus du clavier**, jamais masqué, exactement comme la barre CTA de CREATE PLAN — c'est la même règle de produit appliquée au même endroit de l'écran.

### Archivé / lecture seule

Le composer est **remplacé**, pas désactivé visuellement en place : une bannière prend sa position exacte (voir §10), pour que l'œil comprenne immédiatement que la conversation est close plutôt que de croire à un bug de saisie.

---

## 8. Sécurité

### Signalement d'un message

- Appui long sur une bulle → menu contextuel : `Signaler ce message` (et `Copier` pour les messages reçus).
- Ouvre la feuille de signalement standard (Design System §14), motif + commentaire optionnel.
- Confirmation neutre : `Merci, on a bien reçu ton signalement.`

### Blocage

- Accessible depuis le menu `⋯` du header du chat (même emplacement que sur PLAN DETAIL) : `Bloquer <prénom>` — proposé seulement si un tap sur un avatar ou un prénom de message a présélectionné la personne, sinon l'action générique renvoie vers la liste des participantes pour choisir qui bloquer.
- Confirmation Destructive avec conséquence explicite, reprise du Design System §14.

### Comportement après blocage

- Si l'utilisatrice bloque **une participante** : les messages de cette personne restent visibles dans l'historique existant mais **grisés** (`Message d'une personne bloquée`, texte masqué, appui pour révéler une seule fois) ; aucun nouveau message d'elle n'apparaîtra. Elle disparaît de la liste des participantes de son point de vue.
- Si l'utilisatrice bloque **la créatrice**, ou si la créatrice bloque cette utilisatrice : la personne bloquée **quitte le plan et son chat immédiatement**, comme un retrait (Blueprint §3.4). L'écran de chat se ferme pour elle si elle y était, avec un message factuel : `Tu n'as plus accès à ce plan.`

### Suppression

Un message signalé et retenu par la modération est **retiré du fil pour toutes**, remplacé par une ligne système neutre : `Message retiré par la modération.` Jamais de trace du contenu original, jamais de nom pointé publiquement.

### Registre

Aucun mot en Error dans le fil lui-même. Les seules couleurs utilisées pour la sécurité dans cet écran sont **Info** (messages système, notices) et, exclusivement dans les feuilles de confirmation de blocage, **Error** pour le bouton d'action finale — jamais dans le flux de lecture.

---

## 9. Photos — décision

**Exclues du V1 initial.** Le Blueprint les classe en V1.1 ; rien dans la boucle DISCOVER → CREATE → JOIN → CHAT → MEET n'exige qu'une photo circule dans le chat pour qu'un plan ait lieu. Ajouter l'upload photo maintenant ouvrirait, sans bénéfice pour la boucle :

- un pipeline de stockage et de compression supplémentaire ;
- une surface de **modération d'image que le MVP n'a pas** (déjà écartée pour la même raison sur la Plan Card) ;
- un risque de contenu inapproprié dans un espace que la philosophie du produit veut calme et fonctionnel.

Le texte seul suffit à « confirmer les détails, préciser le point de rendez-vous, poser une question, prévenir d'un retard » — les quatre usages listés dans l'objectif. Aucun d'eux ne requiert une image.

---

## 10. Plan passé

### Archivage

Automatique, **24 h après l'heure du plan** (Blueprint §12), sans action de personne.

### Lecture seule

```
├──────────────────────────────────────────────┤
│  🛈  Ce plan est passé. La conversation       │
│     est en lecture seule.                     │
└──────────────────────────────────────────────┘

```

- Bandeau Info, `radius.lg`, occupe exactement la position du composer.
- Toutes les bulles passent à **70 % d'opacité**, le plan header reste identique (toujours tapable vers le détail, qui affiche alors l'état `past`).
- Aucun message ne peut plus être envoyé ; l'appui long pour signaler reste actif — un contenu problématique reste signalable même après coup.

### Visibilité

- **Dans Messages** : la conversation quitte la liste des conversations actives et n'apparaît plus dans l'onglet Messages passé 24 h — cohérent avec le principe « pas de groupes morts qui polluent l'onglet » du Blueprint.
- **Depuis Mes plans** : reste accessible indéfiniment via l'onglet Passés → détail du plan → plan header → chat. C'est la seule porte d'entrée après archivage.

---

## 11. Plan annulé

### Message système

Immédiat, au moment de l'annulation par la créatrice :

```
        Salma a annulé ce plan

```

Même traitement que tout message système (§4), Info, centré, sans bulle.

### Composer

Remplacé immédiatement par le même type de bandeau qu'un plan passé, formulation dédiée :

```
├──────────────────────────────────────────────┤
│  🛈  Ce plan a été annulé. La conversation    │
│     est en lecture seule.                     │
└──────────────────────────────────────────────┘

```

### Accès au détail

Le plan header reste tapable, mène à PLAN DETAIL en état `cancelled` (déjà spécifié).

### Affichage

Le plan header épinglé garde son apparence normale — pas de barré, pas de gris appuyé sur l'en-tête lui-même, pour ne pas rendre l'écran visuellement négatif. C'est le message système et le bandeau qui portent l'information, une fois, clairement, sans la répéter en accablant le reste de l'écran.

---

## 12. Notifications

| **ÉvénementComportement**                                     |                                                                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Nouveau message, app en arrière-plan                          | Notification push : `<Prénom> — <plan>` en titre, aperçu du message en corps (tronqué à \~80 caractères)                   |
| Nouveau message, chat ouvert au premier plan                  | Aucune notification push ; le message apparaît directement dans le fil avec l'animation standard (§16)                     |
| Nouveau message, app ouverte mais sur un autre écran          | Badge sur l'onglet Messages (point, pas de nombre — Design System §11) ; pas de bannière intrusive                         |
| Plusieurs messages du même plan en peu de temps, arrière-plan | **Regroupées** en une seule notification : `3 nouveaux messages — <plan>`                                                  |
| Messages de plusieurs plans simultanément                     | Une notification par plan, jamais fusionnées entre plans différents — le contexte doit rester lisible même en notification |

**Aucune mention (****`@nom`****) en V1.** Une conversation de 2 à 20 personnes autour d'un plan concret n'a pas besoin d'un système d'adressage : tout le monde lit tout, le volume reste naturellement bas. Ajouter des mentions serait une fonctionnalité de messagerie générale, hors du périmètre assumé par ce chat.

**Aucun compteur de messages non lus par plan.** Le badge de l'onglet Messages reste un point, jamais un nombre cumulé — cohérent avec la règle « pas de badge à 99+ » du Design System.

---

## 13. États complets

| **ÉtatDéclencheurComposerPlan headerMessages** |                             |                                                 |                 |                                                                                                              |
| ---------------------------------------------- | --------------------------- | ----------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **empty**                                      | Aucun message écrit         | actif                                           | normal          | illustration + texte                                                                                         |
| **active**                                     | ≥ 1 message                 | actif                                           | normal          | fil normal                                                                                                   |
| **sending**                                    | Message tout juste envoyé   | actif                                           | normal          | bulle à 60 % d'opacité, sans spinner                                                                         |
| **sent**                                       | Accusé serveur reçu         | actif                                           | normal          | bulle pleine opacité                                                                                         |
| **failed**                                     | Échec réseau                | actif                                           | normal          | bulle bordée Error + icône ré-essai                                                                          |
| **blocked** (une participante bloquée)         | Blocage effectué            | actif                                           | normal          | messages de la personne grisés                                                                               |
| **archived**                                   | 24 h après l'heure du plan  | remplacé par bandeau Info                       | normal, tapable | bulles à 70 %                                                                                                |
| **cancelled**                                  | Créatrice a annulé          | remplacé par bandeau Info                       | normal, tapable | fil conservé + message système d'annulation                                                                  |
| **under\_review** (plan signalé)               | Signalement traité en cours | désactivé, bandeau Info                         | normal          | fil visible, lecture seule pendant l'examen                                                                  |
| **offline**                                    | Perte de connexion          | actif, les envois passent en `sending` prolongé | normal          | bannière basse discrète au-dessus du composer : `Pas de connexion. Les messages partiront à la reconnexion.` |

---

## 14. Responsive

| **390 × 844375 × 667360 × 640** |      |      |      |
| ------------------------------- | ---- | ---- | ---- |
| Marges latérales                | 20   | 20   | 16   |
| Plan header                     | 64   | 60   | 56   |
| Tuile de catégorie (header)     | 32   | 30   | 28   |
| Composer (1 ligne)              | 52   | 50   | 48   |
| Largeur max de bulle            | 78 % | 80 % | 82 % |

Le plan header et le composer restent collés sur toutes les tailles ; seule la zone de messages rétrécit. Sur 360, le prénom au-dessus d'un groupe de bulles passe de `caption` 13 à 12 pour ne pas grignoter la largeur utile de la bulle.

---

## 15. Accessibilité

- Bulle reçue : annoncée `<Prénom>, <heure>, <contenu>`. Bulle envoyée : `Toi, <heure>, <contenu>`.
- Message système : annoncé dans le flux normal, sans rôle d'alerte — c'est une information, pas une urgence.
- Le plan header est un bouton unique annoncé : `Café à Gauthier, aujourd'hui 15h30, Café Bianca, Gauthier. Voir le détail du plan.`
- Le composer et son bouton d'envoi suivent les règles standard de champ de texte (Design System §15) ; le bouton d'envoi annonce son état : `Envoyer, désactivé, le message est vide.`
- Zones tactiles : bouton d'envoi 36 visuel dans une cible 44, avatar de groupe non tapable donc sans rôle bouton, plan header cible pleine largeur ≥ 44 de haut.
- Dynamic Type : au-delà de 120 %, la largeur max de bulle passe à 90 % et le prénom au-dessus du groupe peut passer sur sa propre ligne complète.
- RTL : bulles envoyées à gauche, reçues à droite (miroir complet), avatar de groupe à droite, coin arrondi resserré du côté `end` qui s'inverse en conséquence, plan header inversé (tuile à droite, chevron à gauche).

---

## 16. Motion

| **TransitionComportement**                    |                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apparition d'un message reçu**              | Translation Y de 8 px + fondu, 160 ms, `easing.enter`. Le fil défile automatiquement vers le bas seulement si l'utilisatrice était déjà en bas ; sinon, un badge discret `Nouveaux messages` apparaît en bas de l'écran, tapable pour sauter au dernier message. |
| **Envoi (optimiste)**                         | La bulle apparaît instantanément (0 ms de délai perçu) à 60 % d'opacité, puis passe à 100 % en 120 ms dès l'accusé serveur — jamais d'attente visible avant que le message existe à l'écran.                                                                     |
| **Échec**                                     | La bulle en `sending` se fige, puis en 200 ms sa bordure passe en Error et l'icône de ré-essai apparaît en fondu — pas de secousse, pas d'animation alarmante.                                                                                                   |
| **Arrivée d'une participante**                | Le message système apparaît par fondu simple 160 ms, sans effet de célébration : ce n'est pas un moment à mettre en scène, c'est une information.                                                                                                                |
| **Ouverture du détail depuis le plan header** | Transition de pile standard, glissement horizontal 240 ms (cohérent avec Design System §11 et PLAN DETAIL §16).                                                                                                                                                  |
| **Passage à l'archivage**                     | Si l'utilisatrice a le chat ouvert au moment exact du basculement (cas rare) : le composer se transforme en bandeau par un fondu croisé de 240 ms, jamais un remplacement brutal.                                                                                |

Aucune animation décorative : pas d'effet de particules à l'envoi, pas de rebond, pas d'icône animée pour l'état vide au-delà d'un rendu statique. Tout tombe à un fondu de 100 ms sous `prefers-reduced-motion`.

---

## 17. Wireframes

### 1. Chat vide

```
╭──────────────────────────────────────────────╮
│  ←   Café à Gauthier              ⋯          │  52
├──────────────────────────────────────────────┤
│ ┌──┐ Café à Gauthier                     ›   │  64  plan header
│ │☕│ Aujourd'hui 15h30 · Café Bianca…         │
│ └──┘                                         │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│                    ⌾                         │
│           C'est calme pour l'instant          │
│      Dis bonjour ou cale les derniers         │
│           détails avec Yasmine.               │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│  Écris un message…                      ⤴   │  52
╰──────────────────────────────────────────────╯

```

### 2. Chat actif

```
│  Aujourd'hui                                  │  séparateur centré
│  ◯S  Salma                                    │
│      Coucou ! On dit 15h30 devant             │
│      l'entrée, ça marche pour tout le monde ? │
│      14:02                                    │
│                                              │
│                    On est bonnes, à toute ! ● │  ← envoyé, aligné fin
│                                        14:05  │
│                                              │
│  ◯Y  Yasmine                                  │
│      Parfaite, j'arrive un peu avant :)       │
│      14:07                                    │
├──────────────────────────────────────────────┤
│  Écris un message…                      ⤴   │
╰──────────────────────────────────────────────╯

```

### 3. Arrivée d'une participante

```
│      Parfaite, j'arrive un peu avant :)       │
│      14:07                                    │
│                                              │
│           Nada a rejoint le plan              │  message système, centré, Info
│                                              │
├──────────────────────────────────────────────┤

```

### 4. Chat après acceptation (Sur demande)

```
├──────────────────────────────────────────────┤
│ ┌──┐ Pilates au CFC                       ›   │  64
│ │🏋│ Aujourd'hui 18h00 · Studio Sereno — CFC   │
│ └──┘                                         │
├──────────────────────────────────────────────┤
│           Yasmine a rejoint le plan           │  seul contenu si c'est
│                                              │  la toute première acceptation
├──────────────────────────────────────────────┤
│  Écris un message…                      ⤴   │
╰──────────────────────────────────────────────╯

```

### 5. Chat archivé

```
├──────────────────────────────────────────────┤
│ ┌──┐ Café à Gauthier                     ›   │  64  identique, toujours tapable
│ │☕│ Aujourd'hui 15h30 · Café Bianca…         │
│ └──┘                                         │
├──────────────────────────────────────────────┤
│  … fil de messages à 70 % d'opacité …         │
├──────────────────────────────────────────────┤
│  🛈  Ce plan est passé. La conversation       │  remplace le composer
│     est en lecture seule.                     │
╰──────────────────────────────────────────────╯

```

### 6. Chat annulé

```
│      Parfaite, j'arrive un peu avant :)       │
│      14:07                                    │
│                                              │
│           Salma a annulé ce plan              │  message système
│                                              │
├──────────────────────────────────────────────┤
│  🛈  Ce plan a été annulé. La conversation    │
│     est en lecture seule.                     │
╰──────────────────────────────────────────────╯

```

---

## 18. Mockup visuel

Six états construits avec les vrais tokens SHEGO — voir l'artefact HTML séparé.

1. Chat vide
2. Chat actif (conversation réelle)
3. Arrivée d'une participante
4. Chat après acceptation (état minimal, juste le message système)
5. Chat archivé
6. Chat annulé

---

## 19. Philosophie — vérification

*"On prépare notre sortie"* et jamais *"nouveau réseau social"* :

- Pas de flux, pas de fil global, pas de découverte de contenu — le chat **n'existe qu'attaché à un plan** et disparaît avec lui.
- Pas de réactions emoji, pas de likes de message, pas de statuts (« en train d'écrire » exclu en V1 — un indicateur de frappe est une fonctionnalité d'engagement de messagerie générale, pas un besoin de coordination).
- Pas de personnalisation du fil (pas de fonds, pas de thèmes de conversation).
- Pas de conversation générée artificiellement pour paraître vivante (§5).
- Le seul contenu multimédia possible reste le texte (§9).
- La seule notification est celle d'un message réel, jamais un rappel d'engagement (« Il y a du nouveau dans tes conversations ! »).

---

## 20. Décisions à valider

**1. Envoi optimiste sans indicateur de chargement visible.** Le message apparaît à l'écran avant même la confirmation serveur (opacité 60 % puis 100 %), pour que l'écriture ne se sente jamais bridée. Le risque : en cas d'échec réel, la bulle a déjà été "vue" comme envoyée avant de basculer en erreur, ce qui peut surprendre. Alternative plus prudente : un spinner discret avant tout affichage. Je recommande l'optimiste — c'est ce qui donne la sensation de rapidité que tout le reste du produit vise.

**2. Aucun indicateur de frappe (« Salma est en train d'écrire »).** Cohérent avec la philosophie §19, mais c'est une omission que beaucoup de personnes remarqueront par comparaison avec WhatsApp. À confirmer que l'absence est un choix assumé et pas un oubli — je le recommande, un plan à 2-5 personnes n'a pas besoin de ce signal pour bien fonctionner.

**3. Le blocage retire la personne du plan plutôt que de simplement couper le chat entre les deux.** Choix cohérent avec le LOCKED §3.4 du Blueprint (blocage total), mais dans le contexte d'un groupe, bloquer une participante la fait disparaître pour tout le monde d'un plan auquel elle avait droit d'accès — pas seulement pour la personne qui bloque. C'est la seule option qui protège réellement, mais elle mérite d'être vue une fois en clair avant verrouillage.

**4. La conversation quitte l'onglet Messages 24 h après le plan, mais reste accessible via Mes plans indéfiniment.** Reprend le Blueprint tel quel. À confirmer qu'aucune limite de rétention plus longue n'est souhaitée (suppression définitive après X mois, par exemple) — cette spec ne fixe aucune fin, le chat archivé reste consultable sans date d'expiration.

**5. Aucune mention, aucun compteur de non-lus par plan, aucun indicateur de frappe.** Trois renoncements groupés parce qu'ils procèdent du même principe : ce chat reste volontairement en retrait des standards de messagerie moderne pour ne pas devenir un produit d'engagement. C'est un pari sur la sobriété plutôt que sur la rétention — cohérent avec toute la V1, mais c'est le point où l'écart avec les attentes ordinaires d'une utilisatrice sera le plus sensible. À valider en connaissance de cause.