# SHEGO PRODUCT BLUEPRINT — V1.3

**SHEGO — Find your girls. Go.** Application mobile sociale, communauté vérifiée entre femmes, centrée sur les PLANS. Marché de lancement : Casablanca.

> **Règle d'or de cette version** : tout ce qui n'aide pas directement le parcours **DISCOVER → CREATE → JOIN → CHAT → MEET** est hors MVP. Chisme est un benchmark fonctionnel, pas un modèle à copier. Aucune fonctionnalité n'entre ici parce qu'elle existe ailleurs.

> **Ce que cette version change, en une phrase** : le MVP SHEGO n'utilise plus aucun traitement biométrique, et l'authentification ne repose plus sur un numéro de téléphone. La confiance repose désormais sur l'authentification Apple/Google, la photo de profil, le signalement, le blocage et la modération humaine. Voir le CHANGELOG en fin de document pour le détail exhaustif (V1.1→V1.2 : suppression du liveness ; V1.2→V1.3 : suppression du téléphone/OTP).

Légende : **LOCKED** = décidé, ne change plus en V1 · **KEEP** = dans le MVP · **ADAPT** = dans le MVP mais modifié · **LATER** = V2 · **REMOVE** = hors scope

---

## 0. Décisions verrouillées (résumé exécutif)

| **#SujetDécision LOCKED** |                              |                                                                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                         | Participation                | Deux modes : **Auto-join** et **Request to join**, choisis par la créatrice. Défaut **contextuel par catégorie**, modifiable en 1 tap.                                                                                                                                     |
| 2                         | Visibilité                   | **Rayon élastique** côté utilisatrice, pas de rayon fixe. Le feed s'élargit seulement si le contenu proche est insuffisant — la pertinence prime sur le remplissage.                                                                                                       |
| 3                         | Langue                       | **Français uniquement** en V1. Architecture i18n + RTL prête dès le jour 1, aucune autre langue développée.                                                                                                                                                                |
| 4                         | Confiance et accès au compte | **Aucun traitement biométrique, aucun numéro de téléphone.** Authentification via Sign in with Apple ou Google + photo de profil obligatoire. Modération, signalement et blocage portent la sécurité réelle. **Jamais présentée comme une preuve d'identité ou de genre.** |
| 5                         | Profil                       | Minimal et rassurant. Pas de followers, likes, matching, ni recherche de profils. Pas de badge de vérification.                                                                                                                                                            |
| 6                         | Home                         | Orientée **"qu'est-ce qu'on fait autour de moi ?"** — les plans sont les objets principaux.                                                                                                                                                                                |
| 7                         | Carte                        | Vue secondaire de la même donnée, jamais l'écran d'entrée.                                                                                                                                                                                                                 |
| 8                         | Création                     | Cible **\~15 secondes**, préremplissage intelligent.                                                                                                                                                                                                                       |
| 9                         | Chat                         | Un groupe par plan, réservé aux participantes acceptées.                                                                                                                                                                                                                   |
| 10                        | Objectif MVP                 | Optimiser une seule boucle : DISCOVER → CREATE → JOIN → CHAT → MEET.                                                                                                                                                                                                       |

---

## 1. Vision produit — LOCKED

*(Inchangé par rapport à V1.1.)*

SHEGO résout une frustration précise : avoir envie de faire quelque chose et n'avoir personne de disponible **à ce moment-là**.

Le produit n'est pas un réseau social de profils. C'est un **marché local de plans en temps réel entre femmes**. La valeur ne vient pas du nombre d'inscrites, mais de la **densité de plans actifs dans un périmètre proche**. Toutes les décisions d'architecture et d'UX de cette version sont subordonnées à cet objectif de densité.

**Ce que SHEGO n'est pas** : une app de dating, un feed de contenu, un annuaire de profils, un réseau de followers.

---

## 2. Proposition de valeur — LOCKED

*(Inchangé.)*

- **Côté création** : "Publie ce que tu veux faire, en 15 secondes, et trouve quelqu'un pour le faire aujourd'hui."
- **Côté découverte** : "Vois ce que les filles font autour de toi, et rejoins-les."
- **Cadre de confiance** : communauté féminine modérée, plans et non profils, blocage et signalement immédiats, modération humaine.

L'activité est le cadre de la rencontre. C'est ce qui rend l'intention non ambiguë et différencie structurellement SHEGO d'une app de rencontre.

---

## 3. Décision 1 — Participation : Auto-join vs Request to join — LOCKED

*(Inchangé par rapport à V1.1 — sans rapport avec le liveness.)*

### 3.1 Les deux modes

**Auto-join** — la place est prise immédiatement. La participante entre dans le plan et accède au chat sans validation. **Request to join** — la participante envoie une demande ; la créatrice accepte ou refuse ; l'accès au chat et à l'adresse exacte suit l'acceptation.

Le mode est choisi **au moment de la création**, sur une ligne unique de l'écran de création (deux pastilles, pas un menu).

### 3.2 Comportement par défaut : défaut contextuel par catégorie

Le défaut n'est **pas** uniforme. Il est présélectionné selon la catégorie du plan, et toujours modifiable en un tap :

| **CatégorieDéfautRaison** |               |                                                         |
| ------------------------- | ------------- | ------------------------------------------------------- |
| Café                      | **Auto-join** | Lieu public, engagement faible, courte durée            |
| Brunch / Restaurant       | **Auto-join** | Lieu public, groupe naturel                             |
| Shopping                  | **Auto-join** | Lieu public, très faible engagement                     |
| Cinéma / Culture          | **Auto-join** | Lieu public, activité cadrée                            |
| Sport / Fitness           | **Auto-join** | Lieu public, activité cadrée                            |
| Balade / Extérieur        | **Request**   | Lieu parfois isolé, durée longue, marche en tête-à-tête |
| Plage / Piscine           | **Request**   | Exposition personnelle plus forte                       |
| Concert / Événement       | **Auto-join** | Lieu public dense                                       |
| Activité créative         | **Auto-join** | Lieu public, atelier cadré                              |
| Soirée / Sortie nocturne  | **Request**   | Horaire tardif, exposition plus forte                   |
| Voyage / Weekend          | **Request**   | Engagement long, coût, proximité prolongée              |
| Autre                     | **Request**   | En cas de doute, on protège par défaut                  |

**Règle générale** : *lieu public + durée courte + horaire de journée → Auto-join. Sinon → Request.* **Règle de repli** : en cas d'ambiguïté, c'est toujours Request.

### 3.3 Pourquoi ce choix pour le MVP

Un défaut uniforme "Request partout" tue la fluidité : avec un réseau encore peu dense, chaque demande non traitée est un plan qui n'a pas lieu, et une répétition de ce cas décourage l'usage. Un défaut uniforme "Auto-join partout" fait porter le risque sur les situations les plus exposées (soirée, voyage, lieu isolé), là où une erreur coûte cher.

Le défaut contextuel donne la fluidité sur les catégories les plus courantes et les moins exposées (café, brunch, sport, cinéma, shopping), tout en gardant un filtre humain là où il compte. Et il applique le principe de préremplissage intelligent : la créatrice n'a rien à décider dans le cas standard, mais garde le contrôle total en un tap.

La répartition réelle des plans par catégorie n'est pas connue à ce stade : elle sera mesurée pendant la beta et pourra conduire à réajuster les défauts par catégorie. Ces défauts sont paramétrables côté serveur, pas codés en dur dans l'app.

### 3.4 Filets de sécurité qui rendent l'Auto-join acceptable — KEEP

Ces mécanismes sont **obligatoires** pour que l'Auto-join reste sûr :

1. Seules les utilisatrices dont le **compte est actif** (profil complet — prénom, date de naissance, ville, photo — et non suspendu — voir section 6) peuvent rejoindre un plan, quel que soit le mode.
2. La créatrice peut **retirer une participante** d'un plan à tout moment, sans justification.
3. La créatrice voit le profil de chaque participante dès son arrivée dans le plan.
4. **Blocage** : une utilisatrice bloquée ne voit plus les plans de l'autre et ne peut jamais les rejoindre.
5. Le lieu suit la **règle d'affichage progressif du lieu** (section 15.1) : lieu identifiable + quartier avant, adresse exacte une fois dans le plan.
6. Signalement accessible depuis le plan, le chat et le profil.
7. Une créatrice peut basculer son plan de Auto-join à Request **après** publication (pas l'inverse, pour ne pas surprendre les participantes en attente).

### 3.5 Gestion des places — KEEP

*(Inchangé.)*

- Places max définies à la création (**2 à 20**).
- Auto-join : premier arrivé, premier servi. Plan complet → bouton désactivé + "Complet".
- Request : la créatrice voit les demandes en attente, accepte jusqu'à remplir les places. Les demandes restantes passent automatiquement en refus doux quand le plan est complet.
- **Liste d'attente** : REMOVE du MVP. Complexité de gestion d'état disproportionnée au volume de départ. LATER.
- Annulation de participation possible jusqu'à l'heure du plan, libère la place.

### 3.6 Traitement des demandes (Request) — KEEP

*(Inchangé.)*

La friction doit être minimale côté créatrice :

- Notification push actionnable avec **Accepter / Refuser** directement.
- Dans "Mes plans", un badge de demandes en attente, avec accept/refus en 1 tap sur la carte du profil.
- Refus toujours silencieux côté motif (jamais de raison demandée ni affichée).
- Demande sans réponse **expirée automatiquement** à l'heure du plan, avec notification à la demandeuse.

---

## 4. Décision 2 — Visibilité : rayon élastique — LOCKED

*(Inchangé par rapport à V1.1.)*

### 4.1 Principe

**La créatrice ne choisit aucun rayon.** Elle place un lieu, point final. C'est la **découverte côté utilisatrice** qui est élastique. Cela supprime une décision inutile à la création (gain de secondes) et évite qu'un plan soit invisible à cause d'un réglage mal compris.

### 4.2 Algorithme de découverte élastique

À l'ouverture de la Home, le système part du palier le plus proche et ne s'élargit que si le contenu disponible n'est pas suffisant pour rendre l'écran utile :

```
Palier 1 : 3 km    → si le volume reste insuffisant, élargir
Palier 2 : 8 km    → si le volume reste insuffisant, élargir
Palier 3 : 20 km   → si le volume reste insuffisant, élargir
Palier 4 : ville entière (Casablanca)

```

**La proximité et la pertinence priment sur le remplissage.** Le volume visé (paramètre serveur, valeur de départ indicative : une dizaine de plans à venir) est un **objectif de contenu utile, pas une garantie ni une quantité à atteindre coûte que coûte**. Trois plans réellement proches et pertinents valent mieux qu'une Home remplie de plans lointains : le système ne descend jamais en pertinence uniquement pour approcher ce volume, et s'arrête au palier le plus proche qui offre déjà un choix crédible.

La fenêtre temporelle s'élargit selon la même logique : **aujourd'hui → 7 jours → tous les plans à venir**. L'élargissement géographique passe avant l'élargissement temporel (un café à 2 km demain est plus utile qu'un café à 20 km ce soir).

Paliers, volume cible et règles d'arrêt sont des paramètres serveur (`app_config`), ajustables sans redéploiement de l'app, et calibrés avec les données réelles de la beta.

### 4.3 Affichage honnête de la distance — KEEP

L'élargissement doit être **visible et compréhensible**, jamais silencieux :

- Section 1 : "Autour de toi" (palier atteint le plus proche)
- Section 2 : "Un peu plus loin" (paliers suivants), avec la distance sur chaque carte
- Distance affichée en valeur approximative ("à 2 km", "à 6 km"), jamais une position exacte d'utilisatrice.

### 4.4 Curseur manuel — KEEP

Un filtre distance reste disponible dans les filtres (3 / 8 / 20 km / toute la ville). L'élastique est le **défaut intelligent**, pas une contrainte. Dès qu'une utilisatrice touche le curseur, son choix est mémorisé pour la session.

### 4.5 État vide : jamais un cul-de-sac — KEEP

Si même la ville entière ne donne aucun plan, la Home affiche un état vide **actionnable** :

- Message : "Personne n'a encore posé de plan aujourd'hui. Lance le premier."
- CTA unique et large : **Créer un plan**
- Sous le CTA : les prochains plans à venir cette semaine, s'il y en a.

C'est la règle : **l'app ne montre jamais un écran vide sans proposer de créer**. Au démarrage du réseau, chaque ouverture sans plan doit se convertir en tentative de création.

### 4.6 Stratégie de densité au lancement — KEEP (opérationnel, hors produit)

Ne pas lancer "à Casablanca" mais sur un **cœur géographique restreint** : Maârif, Gauthier, Racine, Bourgogne, CFC, Ain Diab. Objectif : qu'une utilisatrice de ce périmètre trouve quelque chose de pertinent au palier 1 ou 2. L'ouverture au reste de la ville se fait quand ce niveau d'activité est tenu de façon stable, mesuré sur les données réelles de la beta.

### 4.7 LATER

Rayon fixe et réglages fins quand la densité le permet · découverte inter-villes · notifications de proximité en temps réel · heatmap de zones actives.

---

## 5. Décision 3 — Langue et internationalisation — LOCKED

*(Inchangé.)*

**V1 livrée en français uniquement. Aucune autre langue développée.**

Mais l'architecture est posée dès le premier écran pour que l'ajout de l'**arabe** et de l'**anglais** ne demande aucune refonte :

- **Zéro chaîne de texte en dur dans les composants.** Tous les textes passent par des clés de traduction (`i18n.t('plan.create.cta')`).
- Un seul fichier de ressources `fr.json` en V1, structuré par domaine (onboarding, plans, chat, profil, erreurs).
- **RTL anticipé dès le design system** : utiliser `start`/`end` plutôt que `left`/`right` dans les styles, tester tôt avec le flag RTL forcé même si l'arabe n'existe pas encore. C'est le point qui coûte cher si on l'oublie.
- **Formats délégués à la locale** : dates, heures, distances, pluriels passent par la couche i18n, jamais concaténés à la main.
- La langue est une **préférence utilisatrice** stockée en base (champ `locale`), pas seulement une détection système — prêt pour le sélecteur de langue en V2.
- Contenus non traduisibles côté app (noms de catégories) : stockés en base par **clé**, libellés résolus côté client.

**REMOVE V1** : sélecteur de langue visible, traduction arabe/anglaise, contenu darija en UI système.

---

## 6. Décision 4 — Confiance et accès au compte — LOCKED, RÉÉCRITE EN V1.2

> Cette section remplace intégralement l'ancienne "Décision 4 — Vérification" de la V1.1. Le principe qui la gouverne : **la confiance de SHEGO repose sur des mécanismes qu'on peut honnêtement décrire, jamais sur une promesse technique qu'on ne peut tenir.**

### 6.1 Ce que le MVP n'utilise plus — REMOVE, définitif

- Selfie de vérification.
- Liveness (détection de personne réelle par geste facial).
- Reconnaissance faciale, sous quelque forme que ce soit.
- Comparaison biométrique entre une capture et une photo de profil.
- CIN / CNIE ou toute pièce d'identité officielle.
- Toute vérification d'identité au sens légal du terme.

Aucun de ces éléments n'existe dans le MVP. Ce n'est pas un report en LATER : c'est un choix délibéré de ne pas introduire de traitement de données biométriques au lancement, pour limiter la complexité juridique et opérationnelle d'un produit qui n'a pas encore fait ses preuves.

### 6.2 Ce que le MVP garde — KEEP, révisé en V1.3

- **Authentification via Sign in with Apple ou Sign in with Google, gérée par Supabase Auth.** C'est la seule barrière technique à la création d'un compte, et elle sert uniquement à authentifier l'accès — jamais présentée comme une preuve d'identité ou de genre. **Aucun numéro de téléphone, aucun SMS, aucun OTP n'entre dans ce mécanisme.**
- **Photo de profil obligatoire.** Justification canonique, à utiliser mot pour mot dans l'UI : *"Une photo claire aide les participantes à se reconnaître lorsqu'elles se retrouvent."* La photo n'est ni une preuve d'identité, ni une preuve de genre ; elle n'est soumise à aucune reconnaissance faciale ni comparaison biométrique — c'est une photo, point.
- **Modération humaine**, **signalement** et **blocage**, inchangés dans leur mécanique (sections 15-17).
- **Détection des comptes suspects et des abus**, et **revue manuelle** en cas de signalement ou de comportement suspect.

### 6.3 Statut du compte — LOCKED, révisé en V1.3

**Une seule donnée de statut existe désormais** — la notion de `phone_verified_at` disparaît intégralement, elle n'a plus d'objet puisqu'il n'y a plus de numéro à confirmer :

- **`account_status`** — la seule colonne de statut du compte, avec **exactement quatre valeurs possibles**, rien de plus :

| **`account_status`****SignificationEffet** |                                                                                                                                                                                                                                     |                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `active`                                   | Le compte ne fait l'objet d'aucune restriction de modération.                                                                                                                                                                       | Accès complet aux fonctions du produit, sous réserve de remplir la condition d'accès de 6.4 (profil complet + photo). |
| `under_review`                             | Le compte fait l'objet d'un examen de modération, **à la suite d'un signalement ou d'un comportement suspect** — jamais d'un onboarding, jamais d'une étape de vérification biométrique ou téléphonique (aucune des deux n'existe). | Voir 6.4bis ci-dessous : règle unique et binaire, aucune restriction variable en V1.                                  |
| `suspended`                                | Décision de modération, suite à examen : accès bloqué, réversible.                                                                                                                                                                  | Accès bloqué.                                                                                                         |
| `banned`                                   | Décision de modération définitive.                                                                                                                                                                                                  | Accès bloqué, non réversible en usage normal.                                                                         |

**Aucune donnée de confirmation téléphonique n'existe plus dans le produit, sous aucune forme.**

### 6.4 Condition d'accès à Create / Join — LOCKED, révisée en V1.3

Un compte est **prêt à participer** (créer ou rejoindre un plan) si et seulement si les conditions suivantes sont réunies :

1. **Session Apple ou Google valide** (authentification réussie via Supabase Auth).
2. **Prénom renseigné.**
3. **Date de naissance renseignée, majorité (18+) confirmée par le calcul.**
4. **Ville renseignée.**
5. **Photo de profil présente.**
6. `account_status = active`.

**Aucune preuve d'identité ni de genre n'est demandée, à aucune étape. Aucune condition liée à un numéro de téléphone n'existe.** Cette condition remplace l'ancienne barrière biométrique puis téléphonique — le principe de bloquer l'accès tant que le compte n'est pas prêt reste identique, seule la définition de "prêt" a évolué deux fois depuis la V1.1.

### 6.4bis Règle `under_review` — LOCKED

*(Inchangé — cette règle ne dépendait déjà d'aucun mécanisme de téléphone.)*

Comportement **unique et binaire** en MVP, sans exception ni nuance :

**Tant qu'un compte est ****`under_review`****, il ne peut pas :**

- créer un plan ;
- rejoindre un plan (Direct ou Sur demande) ;
- accéder à un chat, y compris ceux de plans déjà rejoints avant la mise en examen.

**Il conserve uniquement les accès non sensibles** nécessaires à la gestion de son compte et à la réception d'une éventuelle notification de modération : ouvrir l'app, consulter et modifier son profil, lire ses paramètres, recevoir et lire une notification de modération, faire appel de la décision si ce mécanisme existe.

**Aucune notion de restriction variable selon la gravité du signalement n'existe en V1.** Un compte `under_review` est `under_review` : la règle ci-dessus s'applique intégralement, quel que soit le motif du signalement. Toute granularité future (restriction partielle, accès en lecture seule à certains chats, paliers de gravité) est explicitement **LATER**, hors MVP.

### 6.5 Positionnement de communication — LOCKED, révisé en V1.3

SHEGO ne se présente pas comme une communauté "vérifiée" au sens biométrique ou téléphonique. Le positionnement :

> **"Une communauté entre femmes, modérée et protégée."**

Formulation complémentaire, utilisable en complément :

> **"Chaque compte est authentifié via Apple ou Google. SHEGO s'appuie aussi sur la photo de profil, le signalement, le blocage et la modération."**

**Formulations à ne plus jamais utiliser, sous aucune forme** :

- ❌ "Verified women-only community"
- ❌ "Communauté vérifiée"
- ❌ "Chaque personne est vérifiée"
- ❌ "Tu es vérifiée"
- ❌ "Badge vérifiée"
- ❌ "Vérification de genre"
- ❌ "Compte confirmé par téléphone" (n'existe plus, remplacé par la formulation ci-dessus)
- ❌ Toute reformulation qui réintroduirait implicitement l'idée d'une vérification biométrique ou d'identité, même sans utiliser le mot "vérifié" (par exemple "toutes les femmes ici sont confirmées comme réelles" reste interdit).
- ❌ Toute formulation présentant l'authentification Apple/Google elle-même comme une preuve d'identité ou de genre — Apple et Google authentifient un compte, pas une personne ni son genre.

**Ne jamais prétendre** :

- que toutes les personnes présentes sont réellement des femmes ;
- que toutes les personnes sont identifiées ;
- que SHEGO garantit zéro faux compte ou zéro risque.

Le mot "vérifié" ne s'applique plus à aucun mécanisme du produit. Il n'est employé nulle part comme qualificatif d'une personne ni d'un compte.

### 6.6 Badge — LOCKED, supprimé

**Le concept de badge "Vérifiée" (****`VerifiedBadge`****) est intégralement supprimé du MVP.** Aucun badge visuel n'apparaît sur aucun avatar, à aucune taille, dans aucun contexte.

**Aucune ligne textuelle de type "Compte confirmé par téléphone" n'existe plus** — cette formulation appartenait à l'architecture par OTP téléphone, abandonnée en V1.3. Le profil complet n'affiche aucune ligne de confiance textuelle équivalente ; la confiance du produit repose sur les mécanismes décrits en 6.2, expliqués dans les Paramètres (section 18), jamais résumés par une mention sur le profil individuel.

### 6.7 LATER

*(Inchangé — cette porte reste ouverte pour une version future, si le produit en a besoin une fois éprouvé.)*

Badge de niveaux de confiance, re-vérification périodique, détection anti-deepfake avancée, vérification d'identité forte optionnelle (avec CIN, le cas échéant, sous condition d'un cadre juridique validé). **Ajout d'un numéro de téléphone optionnel** (non lié à l'authentification, pour une fonctionnalité future non spécifiée) reste également une porte LATER, à cadrer le moment venu — aucune donnée de ce type n'est collectée en V1.3.

---

## 7. Décision 5 — Profil — LOCKED, ajustée en V1.2

### 7.1 Contenu du profil (exhaustif, rien de plus)

- Photo (1 seule en V1)
- Prénom
- Âge (calculé depuis la date de naissance, jamais la date elle-même)
- Ville
- Bio courte (≤ 150 caractères, optionnelle)
- Intérêts (tags, issus de la liste fermée des catégories + quelques tags complémentaires)
- ~~Badge "Vérifiée"~~ **REMOVE — supprimé en V1.2.** Aucune ligne de remplacement dans le profil (la mention "Compte confirmé par téléphone" envisagée en V1.2 n'existe plus depuis la suppression du téléphone en V1.3, voir 6.6).

### 7.2 Où le profil est consultable — LOCKED

*(Inchangé.)*

Le profil d'une autre utilisatrice est accessible **uniquement depuis un contexte de plan** :

- depuis la liste des participantes d'un plan,
- depuis une demande de participation (côté créatrice),
- depuis le chat d'un plan.

Il n'existe **aucun point d'entrée** vers un profil en dehors d'un plan. C'est ce qui matérialise "les plans au centre, pas les profils".

### 7.3 Explicitement absent — REMOVE

*(Inchangé, avec le badge de vérification qui y rejoint désormais la liste.)*

Followers · abonnements · likes · matching / swipe · recherche de profils · messagerie privée 1-à-1 hors plan · statistiques publiques · classements · gamification · galerie multi-photos (LATER) · badge "Vérifiée" (V1.2).

### 7.4 Vue privée (soi-même) — KEEP

*(Inchangé.)*

Historique de ses propres plans (créés / rejoints, à venir / passés), visible seulement par soi. Sert de repère personnel, jamais de score public.

---

## 8. Décision 6 — Home repensée — LOCKED

*(Inchangé par rapport à V1.1 — la suppression du badge ne modifie pas la Home, qui n'en affichait déjà aucun.)*

### 8.1 Principe

La question à laquelle la Home répond, littéralement, est : **"Qu'est-ce qu'on fait autour de moi ?"** Pas : "qui est autour de moi ?"

Conséquence directe : **aucun visage n'est l'élément dominant d'une carte de plan.** L'activité, l'heure et le lieu occupent la hiérarchie visuelle ; la créatrice apparaît en petit, comme information secondaire de confiance.

### 8.2 Structure de l'écran (haut en bas)

1. **En-tête léger** : localisation courante + toggle Liste/Carte (Liste actif par défaut)
2. **Chips catégories** horizontales scrollables (Tout, Café, Brunch, Sport…)
3. **Sections temporelles** : "Maintenant / Bientôt" → "Aujourd'hui" → "Cette semaine"
4. À l'intérieur de chaque section : plans triés par distance
5. Si élargissement élastique : section "Un peu plus loin"
6. **Bouton central "+ Créer"** de la barre de navigation, toujours accessible — aucun FAB séparé dans le contenu de la Home (voir section 19 : le bouton central de la tab bar est l'unique affordance de création)

### 8.3 Anatomie d'une carte de plan — LOCKED

*(Inchangé.)*

Ligne 1 : **icône catégorie + titre du plan** (élément le plus gros de la carte) Ligne 2 : **heure** (relative : "dans 40 min", "ce soir 20h") + **distance** ("à 2 km") Ligne 3 : quartier / nom du lieu approximatif Ligne 4 : petite photo ronde de la créatrice + prénom + nb de places restantes + pastille du mode (Auto-join / Sur demande)

Le mode de participation doit être lisible **avant** le tap : c'est ce qui permet à une utilisatrice de savoir si elle peut partir sur un coup de tête.

### 8.4 REMOVE

Stories · feed de contenu · suggestions algorithmiques · carrousel de profils · "filles près de toi" sous quelque forme que ce soit.

---

## 9. Décision 7 — Carte — LOCKED

*(Inchangé.)*

- Vue **secondaire**, atteinte par le toggle depuis la Home. Jamais l'écran d'entrée.
- Exactement la **même donnée et les mêmes filtres** que la liste — la carte est une projection, pas un autre produit.
- **Pins = lieux de plans**, jamais des utilisatrices. Aucune position de personne n'est affichée sur une carte, à aucun moment.
- Position du plan affichée en **zone approximative** tant que l'utilisatrice n'a pas rejoint ; adresse exacte après.
- Clustering au-delà d'une dizaine de pins dans la zone visible.
- Tap sur un pin → carte de preview en bas → tap → détail du plan.
- **LATER** : heatmap, itinéraire, recherche par déplacement de la carte ("chercher dans cette zone").

---

## 10. Décision 8 — Création de plan en \~15 secondes — LOCKED

*(Inchangé.)*

### 10.1 Écran unique, pas de wizard

Toute la création tient sur **un seul écran scrollable**, pas une suite d'étapes. Chaque champ a une valeur préremplie ; publier sans rien modifier doit produire un plan valide.

### 10.2 Séquence et préremplissage intelligent

| **ChampPréremplissageInteraction minimale** |                                                                                                    |                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| Catégorie                                   | aucune (seul choix obligatoire)                                                                    | 1 tap dans une grille d'icônes |
| Titre                                       | **auto-généré depuis la catégorie** ("Café ☕", "Brunch 🥐")                                        | 0 tap, éditable                |
| Heure                                       | **"Dans 1h"** par défaut + raccourcis : Maintenant · Dans 1h · Ce soir · Demain                    | 0 ou 1 tap                     |
| Lieu                                        | **quartier courant détecté par GPS** + 3 suggestions de lieux proches correspondant à la catégorie | 0 ou 1 tap                     |
| Places                                      | **4** par défaut                                                                                   | 0 tap                          |
| Mode                                        | **défaut contextuel par catégorie** (section 3.2)                                                  | 0 tap                          |
| Description                                 | vide, optionnelle                                                                                  | 0 tap                          |

**Chemin le plus court : catégorie → Publier. Deux taps.** Cible réaliste d'un plan standard renseigné : 12 à 18 secondes.

### 10.3 Règles

- **Publier devient actif dès qu'une catégorie est choisie et qu'un lieu valide est présent.** En pratique, le lieu est prérempli automatiquement dans le parcours standard (quartier détecté ou lieu suggéré selon la catégorie), ce qui conserve l'objectif de création en \~15 secondes et le chemin le plus court à deux taps.
- **Si aucun lieu valide n'a pu être prérempli** (GPS refusé, aucune suggestion pertinente à proximité), l'utilisatrice doit renseigner un lieu avant de pouvoir publier — via le même champ Lieu déjà présent à l'écran, sans étape ni écran supplémentaire : ce n'est jamais un wizard, seulement un champ qui reste à remplir dans le formulaire à écran unique.
- Un plan ne peut pas être créé dans le passé ; "Maintenant" = heure actuelle arrondie.
- Publication → création automatique du groupe de discussion → redirection vers le **détail du plan** (pas vers la Home) : la créatrice voit immédiatement le résultat de son action.
- Limite anti-spam : maximum 3 plans actifs simultanés par utilisatrice en V1.

### 10.4 REMOVE

Choix du rayon de visibilité · co-organisatrices · plans récurrents · plans privés sur invitation · upload de photo de couverture · billetterie.

---

## 11. Détail d'un plan — KEEP

*(Inchangé.)*

Contenu : titre + icône catégorie · heure · lieu (nom du lieu + quartier, puis adresse exacte une fois dans le plan — cf. 15.1) · description · créatrice (photo, prénom, âge — **sans badge, voir 6.6**) · participantes acceptées · places restantes · mode de participation.

Action principale unique, contextuelle selon l'état : `Rejoindre` (auto-join) · `Demander à rejoindre` (request) · `Demande envoyée` (inactif) · `Ouvrir le chat` (déjà dedans) · `Complet` (inactif) · gestion du plan (si créatrice).

Actions secondaires : signaler le plan · voir le profil d'une participante · quitter le plan · annuler le plan (créatrice, avec notification à toutes les participantes).

**LATER** : partage externe du plan par lien.

---

## 12. Décision 9 — Chat de plan — LOCKED

*(Inchangé.)*

- **Un groupe par plan**, créé automatiquement à la publication.
- **Accès strictement réservé** à la créatrice et aux participantes acceptées. Une demande en attente n'ouvre aucun accès.
- Quitter le plan ou être retirée → perte immédiate de l'accès au chat.
- Contenu : **texte uniquement en V1**. Photos en V1.1 / LATER.
- Bandeau épinglé permanent en haut : titre, heure, lieu du plan, accès au détail.
- Messages système dans le fil : "X a rejoint le plan", "Le lieu a été modifié", "Le plan a été annulé".
- Notification push par nouveau message, désactivable par plan.
- **Archivage automatique 24 h après l'heure du plan** : chat en lecture seule, puis sorti de la liste active. Évite l'accumulation de groupes morts, qui est le principal facteur de pollution de l'onglet Messages.
- Signalement d'un message accessible par appui long.
- **REMOVE** : messagerie privée 1-à-1, appels, vocaux, réactions emoji (LATER).

---

## 13. Recherche et filtres — ADAPT

*(Inchangé.)*

**Filtres (KEEP)** : catégorie · distance (3/8/20 km/ville) · quand (maintenant, aujourd'hui, cette semaine) · places disponibles uniquement. **Tri (KEEP)** : proximité (défaut) · heure la plus proche. **Recherche texte (ADAPT)** : recherche simple sur les titres de plans uniquement, accessible depuis la Home. **REMOVE** : recherche de profils/personnes · filtre par âge des participantes · filtres avancés.

---

## 14. Notifications — KEEP

*(Inchangé.)*

Transactionnelles uniquement en V1 :

1. Nouvelle demande de participation (actionnable : Accepter / Refuser)
2. Demande acceptée / refusée
3. Nouvelle participante sur mon plan (auto-join)
4. Nouveau message dans un chat de plan
5. Rappel 1 h avant le plan
6. Plan annulé ou modifié (lieu/heure)
7. Notification de modération (signalement traité, compte restreint)

**LATER** : "nouveaux plans près de toi", digest hebdomadaire, réengagement. **REMOVE V1** : toute notification marketing ou de réengagement — elles nuisent à la confiance avant que le produit ait prouvé sa valeur.

---

## 15. Sécurité — KEEP, ajustée en V1.2

1. ~~Vérification obligatoire avant toute action~~ → **Compte prêt obligatoire avant toute action** (créer/rejoindre/chatter) — au sens de la condition d'accès définie en 6.4 (session Apple/Google valide + profil complet + photo de profil + `account_status = active`). Un compte `under_review` ne peut ni créer, ni rejoindre, ni accéder à un chat — règle unique et binaire, voir 6.4bis.
2. **Affichage progressif du lieu** selon la règle 15.1 ci-dessous.
3. **Aucune position d'utilisatrice n'est jamais partagée**, ni sur carte, ni en distance précise — uniquement des distances approximatives par rapport à des lieux de plans.
4. Blocage bilatéral et total (plans, chat, profil, demandes).
5. Signalement accessible depuis profil, plan et message.
6. Retrait d'une participante par la créatrice, sans justification.
7. ~~Photos de vérification isolées, chiffrées~~ → **REMOVE, n'existe plus.** Seule la photo de profil est stockée, dans le bucket `avatars` standard (voir 26).
8. Row Level Security sur toutes les tables dès le jour 1.
9. Page "Sécurité" dans les paramètres : conseils de première rencontre, ressources locales marocaines, **explication honnête du dispositif réel** (authentification Apple/Google, photo, modération, signalement, blocage — sans jamais suggérer une vérification d'identité).

**LATER** : bouton d'alerte pendant un plan · partage de plan à un proche de confiance · check-in d'arrivée.

### 15.1 Règle d'affichage progressif du lieu — LOCKED

*(Inchangé — sans rapport avec le liveness.)*

Le lieu doit être **compréhensible avant de rejoindre** et **précis une fois dans le plan**. Un lieu illisible dans le feed empêche de décider de venir ; une adresse complète publique expose inutilement. La règle canonique, appliquée partout (Home, carte, détail, partage) :

**Avant de rejoindre — visible par toutes**

- **Nom du lieu ou point de repère identifiable** (établissement, centre commercial, parc, plage, salle, place connue) — ex. "Café Y", "Morocco Mall", "Corniche Ain Diab"
- **+ quartier** (Maârif, Gauthier, Racine, CFC…)
- **+ distance approximative** ("à 2 km")
- Le pin de la carte pointe ce lieu identifiable.
- **Jamais l'adresse postale complète** (numéro, rue, étage, résidence, code), jamais une adresse de domicile.

**Après acceptation / entrée dans le plan — visible par les participantes**

- **Adresse exacte et complète** nécessaire au rendez-vous : numéro et rue, étage, point de rendez-vous précis, indications données par la créatrice.
- Affichée dans le détail du plan et rappelée dans le bandeau épinglé du chat.
- Toute modification du lieu génère un message système dans le chat + une notification.

**Cas particulier — lieu sans établissement nommé (balade, plage, rendez-vous de rue)**

- Avant : point de repère le plus proche + quartier ("Parc de la Ligue Arabe — Bourgogne").
- Après : point de rendez-vous précis donné par la créatrice (entrée, angle de rue, repère visuel).

**Cas particulier — lieu privé (domicile)**

- Les plans à domicile sont **hors MVP** : la création impose un lieu public ou semi-public. Cette restriction est levée, si elle l'est un jour, avec un dispositif de confiance dédié (LATER).

**Implémentation** : deux champs distincts en base — `lieu_public` (nom + quartier, lisible par toutes) et `adresse_exacte` (complète, lisible uniquement par les participantes acceptées). La restriction est appliquée **côté serveur par RLS**, jamais par masquage côté client.

**LATER** : bouton d'alerte pendant un plan · partage de plan à un proche de confiance · check-in d'arrivée.

---

## 16. Signalement et blocage — KEEP, ajustée en V1.2

- Motifs en liste fermée : contenu inapproprié · harcèlement · **compte suspect** · problème de sécurité · autre (champ libre). *("Compte suspect" reste un motif valable — un profil sans photo cohérente, un comportement automatisé, etc. — mais ne fait plus référence à un échec de vérification biométrique, qui n'existe plus.)*
- Blocage effectif immédiatement, sans notification à la personne bloquée.
- Contenus mutuellement invisibles après blocage (plans, chats, participantes).
- Historique des signalements conservé par compte pour la modération.
- Seuil de signalements distincts → passage automatique en `account_status = under_review` (règle unique et binaire définie en 6.4bis : plus de création, plus de participation, plus d'accès au chat) en attendant la revue humaine (seuil paramétrable serveur, calibré au lancement).

---

## 17. Modération — KEEP, ajustée en V1.2

- **Backoffice web minimal** (séparé de l'app) : file de signalements · revue des **comptes suspects ou signalés** (remplace l'ancienne "revue des vérifications douteuses") · consultation d'un compte · actions sur `account_status` (avertir sans changer le statut, passer en `under_review`, `suspended`, `banned`, réhabiliter vers `active`).
- **Modération humaine** en V1. Pas de modération IA.
- Filtre lexical basique sur titres de plans et bios (liste de mots interdits).
- Objectif de traitement : 24 h pour les signalements de sécurité, 48 h pour le reste.
- Journal d'audit des actions de modération (qui, quoi, quand).

### 17.1 Ce que chaque mécanisme de sécurité garantit, et ce qu'il ne garantit pas — nouveau en V1.2

Pour que l'équipe et, en filigrane, la communication produit restent honnêtes sur les limites réelles de chaque brique :

| **MécanismeCe qu'il garantitCe qu'il ne garantit pas** |                                                                                                                                                                                                          |                                                                                                                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentification Apple/Google**                      | Un compte réel sur une plateforme tierce (Apple ou Google) a confirmé la création du compte ; limite la création de comptes jetables en masse (friction et limites anti-abus propres à ces plateformes). | N'identifie pas la personne, ne confirme pas son genre, n'empêche pas la création de plusieurs comptes Apple/Google distincts par la même personne. |
| **Photo de profil**                                    | Donne un visage humain associé au compte, utile pour se reconnaître IRL.                                                                                                                                 | Ne prouve rien sur l'identité, le genre ou l'authenticité de la personne sur la photo ; aucune vérification technique n'est appliquée à l'image.    |
| **Signalement**                                        | Permet à la communauté de faire remonter un problème rapidement.                                                                                                                                         | Ne détecte rien automatiquement ; dépend entièrement de la vigilance des utilisatrices.                                                             |
| **Blocage**                                            | Coupe tout contact futur entre deux comptes, immédiatement.                                                                                                                                              | N'empêche pas la création d'un nouveau compte par la même personne (numéro différent).                                                              |
| **Modération humaine**                                 | Traite les signalements et les cas suspects avec jugement humain, peut suspendre ou bannir.                                                                                                              | A un délai de traitement (24-48h visé), n'est pas un système de détection en temps réel.                                                            |
| **Détection des abus**                                 | Peut repérer des patterns automatisés (créations massives, comportements de bot).                                                                                                                        | Reste un filet, pas une garantie contre un individu déterminé et isolé.                                                                             |

Ce tableau n'est pas destiné à l'utilisatrice finale — il sert de référence interne pour calibrer toute communication produit et s'assurer qu'aucune formulation marketing ne dépasse ce que ces mécanismes accomplissent réellement.

---

## 18. Paramètres — KEEP, ajustée en V1.2

Modifier mon profil · Notifications (par type) · Confidentialité · Comptes bloqués · ~~Vérification (statut + explication du dispositif)~~ → **Sécurité et confiance (explication du dispositif réel : authentification Apple/Google, photo, modération, signalement, blocage)** · Sécurité et conseils · Aide / contact · Conditions et confidentialité · Se déconnecter · **Supprimer mon compte** (avec suppression effective des données, y compris la photo de profil).

**LATER** : langue, mode sombre, préférences de notification fines.

---

## 19. Architecture de navigation — LOCKED

*(Inchangé.)*

Bottom tab bar, 4 onglets + bouton central :

1. **Home** — plans (liste/carte)
2. **Mes plans** — créés et rejoints, à venir / passés, badge demandes en attente
3. **➕ Créer** — bouton central, accès direct à l'écran de création
4. **Messages** — chats des plans actifs
5. **Profil** — mon profil + accès paramètres

Écrans secondaires (stack) : détail plan · profil d'une utilisatrice (depuis un plan uniquement) · chat de plan · filtres (modal) · ~~vérification (flow bloquant plein écran)~~ → **complétion du profil (flow allégé, non bloquant plein écran — profil et photo, sans étape de capture biométrique ni de confirmation téléphonique)** · paramètres.

---

## 20. Périmètre MVP — LOCKED, ajusté en V1.2

Tout ce qui sert la boucle **DISCOVER → CREATE → JOIN → CHAT → MEET** :

| **ÉtapeCe qui est dans le MVP** |                                                                                                                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DISCOVER**                    | Home liste + carte, rayon élastique, chips catégories, filtres de base, sections temporelles                                                                                                                    |
| **CREATE**                      | Écran unique, préremplissage intelligent, \~15 s, 2 taps minimum                                                                                                                                                |
| **JOIN**                        | Auto-join / Request, défaut contextuel, gestion des places, retrait/annulation                                                                                                                                  |
| **CHAT**                        | Groupe par plan, texte, bandeau infos épinglé, archivage auto                                                                                                                                                   |
| **MEET**                        | Rappel 1 h avant, adresse exacte révélée aux participantes, blocage/signalement disponibles                                                                                                                     |
| **Socle**                       | Onboarding + authentification Apple/Google, **photo de profil (sans capture biométrique)**, profil minimal, notifications transactionnelles, sécurité, modération backoffice, paramètres, suppression de compte |

Une seule ville (Casablanca), français uniquement, 12 catégories fermées.

---

## 21. V2 — LATER

*(Inchangé.)*

Multi-villes (Rabat, Marrakech, Tanger) · arabe et anglais · photos dans le chat · liste d'attente · check-in et fiabilité post-plan · recommandations personnalisées · notifications de proximité · partage de plan par lien · plans récurrents · co-organisatrices · galerie multi-photos · badges de confiance (potentiellement incluant une vérification renforcée, à cadrer juridiquement le moment venu) · partenariats lieux.

---

## 22. Explicitement hors MVP — REMOVE, mis à jour en V1.2

Swipe / matching · recherche de profils · followers / likes · messagerie privée hors plan · **selfie de vérification, liveness, reconnaissance faciale, comparaison biométrique, CIN/CNIE, vérification d'identité officielle** (nouveau en V1.2, remplace l'ancien retrait "vérification CIN" qui sous-entendait que le reste de la biométrie était conservé) · stories · appels audio/vidéo · paiement et billetterie · import de contacts et connexion réseaux sociaux · modération IA · choix de rayon à la création · notifications marketing · gamification · **badge "Vérifiée"** (nouveau en V1.2) · plus de 5 onglets de navigation.

Et la règle qui prime sur toutes : **aucune fonctionnalité n'entre au MVP au motif qu'elle existe dans Chisme.**

---

## 23. Localisation marocaine — KEEP

*(Inchangé.)*

- Identifiant principal : **authentification via Sign in with Apple ou Sign in with Google.** Aucun numéro de téléphone requis, aucun email en entrée.
- Ville : Casablanca en V1 (liste fermée, extensible en base sans redéploiement).
- Granularité par **quartier** dans l'affichage des lieux (Maârif, Gauthier, Racine, Bourgogne, CFC, Ain Diab…) — c'est la maille mentale réelle des utilisatrices, plus parlante qu'une distance en km.
- Fuseau et formats : Africa/Casablanca, 24 h, système métrique.
- Cadrage culturel explicite dès l'onboarding : communauté féminine, activités amicales, **ce n'est pas une app de rencontre**. Ce message doit être dit clairement et tôt — il conditionne l'adoption et la légitimité sociale du produit.
- Aucun paiement in-app en V1.

---

## 24. Catégories d'activités — LOCKED

*(Inchangé.)*

Liste fermée de 12, avec icône, titre auto-généré et mode de participation par défaut (cf. 3.2) :

Café · Brunch / Restaurant · Shopping · Cinéma / Culture · Sport / Fitness · Balade / Extérieur · Plage / Piscine · Concert / Événement · Activité créative · Voyage / Weekend · Soirée / Sortie nocturne · Autre

Stockées en base par **clé** (`cafe`, `brunch`…), libellés résolus côté client via i18n. **LATER** : sous-catégories, tags libres communautaires.

---

## 25. Business model — LATER (aucune monétisation en V1)

*(Inchangé.)*

Pistes à explorer **après** validation de la densité d'usage : freemium (visibilité de plan, filtres avancés) · partenariats lieux à Casablanca · événements sponsorisés clairement identifiés.

**Décision V1 : aucune monétisation, aucune publicité.** L'objectif unique est la densité et la rétention. Introduire de la monétisation avant la liquidité du réseau détruirait les deux.

---

## 26. Architecture technique — LOCKED, ajustée en V1.2

- **Mobile** : React Native + Expo (iOS + Android), EAS Build
- **Backend** : Supabase — Postgres, Auth, Storage, Realtime, Edge Functions
- **Auth** : Supabase Auth, Sign in with Apple + Sign in with Google — **seul mécanisme d'authentification, aucun numéro de téléphone, aucun provider SMS, aucun OTP dans l'architecture.**
- **Géo** : PostGIS sur Postgres, requêtes de proximité via fonctions RPC
- **Realtime** : Supabase Realtime, un canal par plan pour le chat
- **Storage** : ~~deux buckets distincts — `avatars` (lecture publique contrôlée) et `verification` (privé, chiffré, accès service-role uniquement)~~ → **un seul bucket ****`avatars`** (lecture contrôlée par RLS selon le contexte de plan, section 7.2). **Le bucket ****`verification`**** est supprimé — il n'existe plus de données biométriques à stocker.**
- ~~**Liveness** : service tiers appelé depuis une Edge Function ; aucune clé ni logique de comparaison côté client~~ → **REMOVE intégralement. Aucun fournisseur de liveness, aucune dépendance biométrique tierce dans l'architecture.**
- **Push** : Expo Push Notifications, déclenchées par Edge Functions sur triggers DB
- **Backoffice modération** : petite app web séparée sur la même base, rôle `admin` via RLS (prototypable avec Lovable)
- **Code** : GitHub · prototypage Lovable · ingénierie et mise en production avec Claude Code
- **i18n** : couche de traduction dès le premier écran (cf. section 5)
- **RLS activée sur toutes les tables dès la première migration** — jamais ajoutée après coup.

---

## 27. Base de données — schéma cible V1.2

> Table `verifications` (selfie\_path, liveness\_score) **supprimée intégralement**. Remplacée par un champ simple sur `users`.

- **users** — id, auth\_provider (`apple`/`google`), prenom, date\_naissance, ville\_id, bio, photo\_url, locale, account\_status (`active` / `under_review` / `suspended` / `banned`), created\_at
- **interests** / **user\_interests** — référentiel de tags + liaison
- **cities** — id, cle, nom, actif, centre (point)
- **plans** — id, creator\_id, categorie\_cle, titre, description, lieu (geography point), lieu\_public (nom du lieu), quartier, adresse\_exacte (accès restreint par RLS aux participantes acceptées), date\_heure, places\_max, participation\_mode (`auto` / `request`), status (`actif`/`complet`/`annule`/`passe`), city\_id, created\_at
- **plan\_participants** — id, plan\_id, user\_id, status (`pending`/`accepted`/`declined`/`cancelled`/`removed`), created\_at
- **messages** — id, plan\_id, sender\_id, contenu, type (`user`/`system`), created\_at
- **reports** — id, reporter\_id, target\_type (`user`/`plan`/`message`), target\_id, motif, commentaire, status, reviewed\_by, created\_at
- **blocks** — id, blocker\_id, blocked\_id, created\_at
- **notifications** — id, user\_id, type, payload, lu, created\_at
- **app\_config** — clés/valeurs serveur (seuil d'élasticité, paliers de rayon, seuil de signalements) pour ajuster sans redéployer

Index géospatial obligatoire sur `plans.lieu`. Index sur `plans.date_heure` et `plan_participants.plan_id`.

**Aucun champ de téléphone dans le schéma V1.3.** Aucune donnée de ce type n'est collectée ni stockée pour le MVP — si un numéro devient pertinent un jour pour une fonctionnalité future, il sera ajouté par une migration dédiée, pas anticipé ici.

---

## 28. API / services — LOCKED, ajustée en V1.2

- `auth` — Sign in with Apple / Sign in with Google (Supabase Auth)
- `profile` — CRUD profil (client + RLS)
- ~~`verification.submit` — Edge Function : upload sécurisé → appel liveness → mise à jour du statut~~ → **REMOVE intégralement.** La photo de profil est envoyée directement via `profile.update` (upload standard vers le bucket `avatars`, sans étape de traitement biométrique intermédiaire).
- `plans.discover` — **RPC PostGIS avec logique de rayon élastique côté serveur** (paliers + seuil lus dans `app_config`)
- `plans.create / update / cancel` — client + RLS, avec contrôle du nombre de plans actifs **et de la condition d'accès définie en 6.4** (session Apple/Google valide + profil complet + photo présente + `account_status = active`)
- `participation.join` — Edge Function : vérifie **la condition d'accès (6.4)**, blocage, places, mode → insère `accepted` ou `pending`
- `participation.respond` — accept/refuse par la créatrice, contrôle des places
- `participation.leave / remove`
- `chat` — Realtime + table `messages`, accès filtré par RLS sur l'appartenance au plan
- `reports.create` · `blocks.create` — client + RLS
- `notifications.dispatch` — Edge Function sur triggers DB → Expo Push
- `admin.*` — endpoints réservés au rôle `admin` pour le backoffice, incluant désormais la revue des comptes `under_review` (signalement/abus, jamais biométrie)

Règle transverse : **toute logique de sécurité (accès chat, révélation d'adresse, blocage, places, condition d'accès à Create/Join) est appliquée côté serveur via RLS ou Edge Function.** Jamais côté client.

---

## 29. Plan de développement — ajusté en V1.2

| **PhaseContenuDurée indicative**                      |                                                                                                                                                                                                                                                                                                                                                  |                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| **0 — Fondations**                                    | Repo, projet Expo, projet Supabase, schéma DB + RLS, design system SHEGO, couche i18n                                                                                                                                                                                                                                                            | S1–S2                              |
| **1 — Auth & Onboarding**                             | Sign in with Apple/Google, écrans onboarding, profil minimal (prénom, date, ville, **photo**), permissions                                                                                                                                                                                                                                       | S2–S3                              |
| **2 — **~~**Vérification**~~** Complétion du profil** | ~~Flow selfie/liveness, Edge Function, statuts de compte, blocage d'accès~~ → **Flow photo de profil (upload + recadrage), modèle de statut ****`account_status`**** (6.3), condition d'accès et règle ****`under_review`**** binaire (6.4, 6.4bis).** Phase allégée par rapport à V1.1 — plus de dépendance à un fournisseur tiers de liveness. | S3–S4 (potentiellement raccourcie) |
| **3 — CREATE + DISCOVER**                             | Création en écran unique avec préremplissage, RPC de découverte élastique, Home liste, détail plan                                                                                                                                                                                                                                               | S4–S6                              |
| **4 — JOIN + CHAT**                                   | Auto-join / Request, gestion des places, groupe Realtime, notifications transactionnelles                                                                                                                                                                                                                                                        | S6–S8                              |
| **5 — Carte**                                         | Vue carte, clustering, filtres partagés                                                                                                                                                                                                                                                                                                          | S8–S9                              |
| **6 — Sécurité & Modération**                         | Signalement, blocage, backoffice, suppression de compte                                                                                                                                                                                                                                                                                          | S9–S10                             |
| **7 — Polish & QA**                                   | États vides, rappels, accessibilité, performance, tests device                                                                                                                                                                                                                                                                                   | S10–S11                            |
| **8 — Beta fermée Casablanca**                        | 50–150 utilisatrices réelles sur le cœur géographique, itération                                                                                                                                                                                                                                                                                 | S11–S14                            |

**Critère de sortie de beta** : une utilisatrice du cœur géographique trouve, de façon régulière et sans élargissement au-delà du palier 2, un choix de plans à venir suffisant pour qu'une ouverture d'app soit utile — et une part significative des plans publiés trouve au moins une participante. Les valeurs cibles précises sont fixées à partir des données observées pendant la beta, pas avant. Tant que ce n'est pas le cas, on corrige la densité avant d'ouvrir de nouvelles zones — jamais l'inverse.

---

## 30. Indicateurs de succès de la V1 — LOCKED

*(Inchangé.)*

Une seule boucle à mesurer :

1. **DISCOVER** — part des ouvertures où la Home propose un choix de plans réellement proches (paliers 1–2), sans élargissement
2. **CREATE** — temps médian de création d'un plan, et part des ouvertures sans plan disponible converties en création
3. **JOIN** — part des plans publiés qui reçoivent au moins une participante
4. **CHAT** — part des plans rejoints où au moins un message est échangé
5. **MEET** — part des plans arrivés à terme sans annulation

Les seuils cibles de chacun de ces indicateurs sont définis après les premières mesures réelles de la beta, pas fixés à l'avance. Tout le reste est du bruit tant que ces cinq indicateurs ne sont pas au vert.

---

## Statut

**Ce document est verrouillé pour la V1.3.** Les décisions marquées LOCKED ne sont pas rouvertes pendant le développement du MVP. Toute demande de fonctionnalité pendant la construction est tranchée par une seule question : *est-ce que ça sert DISCOVER → CREATE → JOIN → CHAT → MEET ?* Si non, c'est LATER.

**Les autres documents de spécification (Design System V1.2.1, Home V1.2.1, Create Plan V1.2.1, Plan Detail + Join V1.2.1, Plan Group Chat V1) ne sont pas mis à jour par cette révision V1.3** — ils restent formellement LOCKED sur leur contenu actuel jusqu'à réécriture explicite, mais certains contiennent désormais des passages contredits par ce Blueprint V1.3 (références à `phone_verified_at`, à un téléphone confirmé comme condition d'accès). **ONBOARDING et SAFETY LAYER sont révisés dans la même passe que ce Blueprint** et ne figurent donc plus dans cette liste de contradictions. Voir la section CONTRADICTIONS À PROPAGER (V1.3) en fin de document pour la liste exhaustive de ce qui reste réellement à propager.

---

## CHANGELOG V1.1 → V1.2

Tous les changements listés ci-dessous découlent directement de la suppression du liveness. Aucune autre décision produit n'a été rouverte.

| **SectionV1.1V1.2**                   |                                                                                                                                                |                                                                                                                                                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §0, ligne 4                           | "Selfie + liveness obligatoires avant de créer ou rejoindre. Pas de CIN. Revue manuelle possible. Jamais présentée comme une preuve de genre." | "Aucun traitement biométrique. Téléphone marocain confirmé par OTP + photo de profil obligatoire. Modération, signalement et blocage portent la sécurité réelle. Jamais présentée comme une preuve d'identité ou de genre." |
| §3.4, point 1                         | "Seules les utilisatrices vérifiées peuvent rejoindre un plan"                                                                                 | "Seules les utilisatrices dont le compte est actif (téléphone confirmé, photo présente, non suspendu) peuvent rejoindre un plan"                                                                                            |
| §6 (titre)                            | "Décision 4 — Vérification"                                                                                                                    | "Décision 4 — Confiance et accès au compte" — réécriture intégrale                                                                                                                                                          |
| §6.1                                  | Selfie + liveness gardés, CIN exclu, revue manuelle, photos de vérification stockées                                                           | Selfie + liveness + reconnaissance faciale + comparaison biométrique + CIN tous exclus ; téléphone + photo de profil + modération/signalement/blocage gardés                                                                |
| §6.2                                  | Positionnement "verified women-only community", formulations autorisées incluant "vérification par selfie"                                     | Positionnement "Une communauté entre femmes, modérée et protégée", aucune formulation ne mentionne plus le selfie ni la vérification biométrique                                                                            |
| §6.3                                  | Statuts `pending → verified → under_review → suspended/banned`                                                                                 | Statuts `phone_confirmed → active → under_review → suspended/banned`, `under_review` redéfini comme exclusivement lié à la modération                                                                                       |
| §6.4 (nouveau)                        | —                                                                                                                                              | Condition d'accès explicite à Create/Join : téléphone confirmé + photo + compte non restreint                                                                                                                               |
| §6.6 (nouveau, ex-badge en 6.4 LATER) | Badge "Vérifiée" en KEEP profil                                                                                                                | Badge supprimé intégralement, remplacé par une ligne textuelle "Compte confirmé par téléphone" dans le profil complet uniquement                                                                                            |
| §7.1                                  | Badge "Vérifiée" listé dans le contenu du profil                                                                                               | Badge retiré de la liste                                                                                                                                                                                                    |
| §7.3                                  | —                                                                                                                                              | Badge "Vérifiée" ajouté à la liste des éléments explicitement absents                                                                                                                                                       |
| §15, point 1                          | "Vérification obligatoire avant toute action"                                                                                                  | "Compte actif obligatoire avant toute action", au sens de la nouvelle condition d'accès                                                                                                                                     |
| §15, point 7                          | "Photos de vérification isolées, chiffrées, non publiques"                                                                                     | Supprimé — n'existe plus, seule la photo de profil standard est stockée                                                                                                                                                     |
| §16                                   | Motif de signalement "compte suspect" sans autre précision                                                                                     | Précision ajoutée : ne fait plus référence à un échec de vérification biométrique                                                                                                                                           |
| §17                                   | "Revue des vérifications douteuses" dans le rôle du backoffice                                                                                 | "Revue des comptes suspects ou signalés" ; nouvelle sous-section 17.1 : tableau des limites réelles de chaque mécanisme de sécurité                                                                                         |
| §18                                   | Entrée Paramètres "Vérification (statut + explication du dispositif)"                                                                          | Entrée renommée "Sécurité et confiance (explication du dispositif réel)"                                                                                                                                                    |
| §19                                   | "Vérification (flow bloquant plein écran)" dans les écrans secondaires                                                                         | "Complétion du profil (flow allégé, non bloquant plein écran)"                                                                                                                                                              |
| §20                                   | Socle MVP incluant "vérification selfie/liveness"                                                                                              | Socle MVP incluant "photo de profil (sans capture biométrique)"                                                                                                                                                             |
| §22                                   | "Vérification CIN" seule exclusion explicite listée                                                                                            | Liste élargie : selfie, liveness, reconnaissance faciale, comparaison biométrique, CIN/CNIE, vérification d'identité officielle, badge "Vérifiée"                                                                           |
| §26                                   | Bucket `verification` séparé, chiffré ; service tiers de liveness appelé depuis une Edge Function                                              | Bucket `verification` supprimé ; aucun fournisseur de liveness dans l'architecture                                                                                                                                          |
| §27                                   | Table `verifications` (selfie\_path, liveness\_score, status, reviewed\_by)                                                                    | Table supprimée ; champ `phone_verified_at` ajouté sur `users`, `account_status` renommé et resimplifié                                                                                                                     |
| §28                                   | Endpoint `verification.submit` (upload → appel liveness → statut)                                                                              | Endpoint supprimé ; upload de la photo via `profile.update` standard ; condition d'accès 6.4 vérifiée dans `plans.create` et `participation.join`                                                                           |
| §29                                   | Phase 2 "Vérification" : flow selfie/liveness, dépendance à un fournisseur tiers                                                               | Phase 2 "Complétion du profil" : flow photo uniquement, phase potentiellement raccourcie faute de dépendance externe                                                                                                        |

**Rien d'autre n'a changé.** Toutes les décisions numérotées 1, 2, 3 (participation, visibilité, langue), 6 à 9 dans la nouvelle numérotation (Home, carte, création, chat), la localisation marocaine, les catégories, le business model, les indicateurs de succès : identiques à la V1.1, non rouvertes.

---

## CONTRADICTIONS À PROPAGER

Liste exhaustive des sections des autres documents LOCKED qui contredisent désormais ce Blueprint V1.2 et devront être mises à jour. **Aucun de ces documents n'a été modifié — cette liste sert de feuille de route pour leur réécriture ultérieure, document par document, sur validation.**

### DESIGN SYSTEM V1

- **§8 Avatar/Profile Elements** — le bloc "Badge vérifiée" (pastille Atlas, icône bouclier-check, tailles 12/16/20, libellé "Vérifiée") contredit 6.6 : à supprimer intégralement du composant `Avatar`.
- **§14 Safety/Trust UI** — tableau "États de vérification" (`unverified`, `in_review`, `needs_retry`, `verified`, `under_review`) contredit 6.3 : à remplacer par les nouveaux statuts (`phone_confirmed`, `active`, `under_review` redéfini). Les lignes `in_review` et `needs_retry` n'ont plus d'objet sans capture biométrique à traiter.
- **§14 Vocabulaire ("On dit / On ne dit pas")** — les formulations de la colonne "On dit" présupposent un processus de vérification qui n'existe plus sous cette forme : à réaligner sur 6.5.
- **§22 Brand Rules, DON'T** — "Ne jamais promettre que la vérification prouve le genre de quelqu'un" reste juste en principe mais doit être généralisé ("ne jamais laisser entendre que SHEGO confirme le genre ou l'identité de qui que ce soit"), cohérent avec 6.5.
- **§19 Component Inventory** — `VerifiedBadge` et `VerificationBanner` (dans leurs états actuels) à réviser ou retirer de l'inventaire MVP.
- **§3 Color System** — rôle d'Atlas ("Confiance — badge vérifiée, mode Direct, success") à ajuster : Atlas garde son rôle pour le mode Direct et success, perd son usage pour le badge.

### HOME V1.2 LOCKED

- **§7 États, ligne "Non vérifiée"** — condition `verification_status ≠ verified` et texte "Vérifie ton compte pour créer ou rejoindre un plan." contredisent 6.3/6.4 : à reformuler sur la base de la nouvelle condition d'accès (téléphone confirmé + photo).
- **§7 États, ligne "Compte en examen"** — `under_review` à recadrer explicitement comme lié à un signalement, jamais à un onboarding, cohérent avec 6.3.

*(Aucun impact sur les mockups visuels Home — aucun badge n'y a jamais été représenté.)*

### CREATE PLAN V1 LOCKED

- **§12 États, ligne "Non vérifiée"** — même contradiction que Home : la feuille de création reste bloquée avant "compte prêt", mais la définition de "prêt" change (6.4).
- **§12 États, ligne "Compte en examen"** — même recadrage que Home.

### PLAN DETAIL + JOIN V1 LOCKED

- **§4 Créatrice** — "badge Vérifiée à droite si la largeur le permet" contredit 6.6 : à retirer de la composition du bloc créatrice.
- **§17 Wireframe** — ligne "✓ Vérifiée" dans le bloc créatrice, à corriger en cohérence.
- **Mockup HTML** — le badge visuel (pastille Atlas + coche) affiché sur l'avatar 44 de la créatrice dans les 5 frames est à retirer ou remplacer.

### PLAN GROUP CHAT V1 LOCKED

- **Aucune contradiction identifiée.** Le document ne référence ni badge, ni selfie, ni liveness, ni biométrie, dans le texte comme dans le mockup. Aucune mise à jour requise.

### ONBOARDING + VERIFICATION V1 LOCKED

- **Contradiction totale et structurelle** — ce document entier est bâti autour du selfie/liveness (titre, flow en 17 étapes, §6 en intégralité, §10 en intégralité, §11 textes de confiance, §12 une partie des états, §16-17 wireframes de capture et de résultat, 5 des 17 écrans du mockup). Ne peut pas être corrigé par amendements ponctuels : nécessite une **réécriture complète**, suivant le nouveau flow canonique déjà donné dans cette demande (Welcome 1 → Welcome 2 → Welcome 3 → Auth → OTP → Prénom → Date de naissance → Ville → Photo → Intérêts → Bio → Notifications → Localisation → Home), soit **13 écrans d'onboarding avant l'arrivée sur Home, 14 au total Home comprise — contre 17 actuellement** (dont 4 écrans de capture/résultat liés au liveness qui disparaissent, et un écran Localisation qui devient explicite).
- Le titre du document lui-même ("ONBOARDING + VERIFICATION") devra probablement être reconsidéré une fois la réécriture engagée, puisque le mot "Verification" au sens biométrique n'a plus d'objet — décision à prendre au moment de la réécriture, pas ici.

---

**Prochaine étape, sur ta validation uniquement** : réécrire, document par document et dans cet ordre de dépendance, le Design System (source des composants), puis Home et Create Plan (impact texte limité), puis Plan Detail (impact visuel direct), puis enfin Onboarding + Verification (réécriture complète). Aucune de ces réécritures n'a commencé.

---

## MINI CHANGELOG V1.2 → V1.2.1

Six corrections de cohérence, aucune décision produit rouverte. Vision, positionnement, Home, système de participation, rayon élastique, chat, catégories, localisation marocaine, business model et indicateurs : tous inchangés.

| **#CorrectionSections touchées** |                                                                                                                                                                                                                                                                                                                                  |                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1                                | `under_review` devient une règle **unique et binaire** : ni création, ni participation, ni accès au chat, quel que soit le motif. Seuls les accès non sensibles (profil, paramètres, notifications de modération) restent ouverts. Toute granularité future est explicitement LATER.                                             | §6.4bis (nouveau), §15 point 1, §16, §17                    |
| 2                                | `phone_verified_at` n'est plus présenté comme une valeur d'`account_status`. `account_status` ne contient que quatre valeurs : `active \| under_review \| suspended \| banned`. `phone_confirmed` reste utilisable comme état dérivé (`phone_verified_at IS NOT NULL`), jamais comme valeur stockée.                             | §6.3 (réécrite), §6.4, §28                                  |
| 3                                | Toute mention de places "ou illimité" supprimée. La règle reste 2 à 20 places, sans exception, partout où la capacité d'un plan est décrite.                                                                                                                                                                                     | §3.5                                                        |
| 4                                | Le bouton flottant "+" de la Home est retiré du texte : seul le bouton central "+ Créer" de la barre de navigation existe, aucun FAB séparé dans le contenu de la Home.                                                                                                                                                          | §8.2, point 6                                               |
| 5                                | La règle de publication est reformulée : Publier est actif dès qu'une catégorie **et un lieu valide** sont présents ; le lieu est prérempli automatiquement dans le cas standard, donc le chemin à deux taps est préservé. Le cas où aucun lieu n'a pu être prérempli est géré explicitement, sans ajouter d'étape ni de wizard. | §10.3                                                       |
| 6                                | Le comptage du flow onboarding, mathématiquement incohérent ("12 écrans"), est corrigé à **13 écrans d'onboarding avant Home, 14 au total** — cohérent avec la liste canonique à 14 éléments (Welcome ×3, Auth, OTP, Prénom, Date, Ville, Photo, Intérêts, Bio, Notifications, Localisation, Home).                              | CONTRADICTIONS À PROPAGER, entrée Onboarding + Verification |

**Confirmation** : toutes les autres décisions du Blueprint — vision produit, proposition de valeur, système de participation (Auto-join / Sur demande), rayon élastique, langue, Home, carte, création de plan (hors la reformulation ponctuelle du point 5 ci-dessus), chat de plan, recherche et filtres, notifications, localisation marocaine, catégories d'activités, business model, plan de développement et indicateurs de succès — restent strictement identiques à la V1.2 et à la V1.1 avant elle. Aucune n'a été rouverte.

---

## CHANGELOG V1.2.1 → V1.3

Réarchitecture de l'authentification : le numéro de téléphone marocain + OTP SMS est intégralement retiré, remplacé par Sign in with Apple et Sign in with Google via Supabase Auth. Motif : éliminer le coût récurrent de SMS. **Aucune autre décision produit rouverte** — plans, capacité 2-20, limite de 3 plans actifs, participation, chat, règle 15.1 de l'adresse exacte, reports, blocks, modération, `under_review`, absence de biométrie : tous inchangés.

| **SectionV1.2.1V1.3**       |                                                                            |                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| §0, ligne 4                 | "Téléphone marocain confirmé par OTP + photo de profil obligatoire."       | "Authentification via Sign in with Apple ou Google + photo de profil obligatoire."                                              |
| §3.4, point 1               | "téléphone confirmé, photo présente, non suspendu"                         | "profil complet (prénom, date de naissance, ville, photo), non suspendu"                                                        |
| §6.2                        | Numéro de téléphone confirmé par OTP SMS listé en KEEP                     | Authentification Apple/Google listée en KEEP ; téléphone entièrement retiré                                                     |
| §6.3                        | Deux données (`phone_verified_at` + `account_status`)                      | Une seule donnée de statut (`account_status`), `phone_verified_at` supprimé sans remplaçant                                     |
| §6.4                        | Condition en 3 points incluant `phone_verified_at IS NOT NULL`             | Condition en 6 points : session Apple/Google + prénom + date de naissance/18+ + ville + photo + `account_status = active`       |
| §6.5                        | Formule complémentaire "Chaque compte est confirmé par téléphone"          | Formule complémentaire "Chaque compte est authentifié via Apple ou Google" ; formulation téléphone ajoutée à la liste interdite |
| §6.6                        | Ligne "Compte confirmé par téléphone" autorisée dans le profil complet     | Aucune ligne de remplacement — supprimée sans équivalent                                                                        |
| §6.7 LATER                  | —                                                                          | Ajout : numéro de téléphone optionnel, non lié à l'authentification, comme piste LATER explicite                                |
| §7.1, §15, §18, §19, §20    | Références diverses à "téléphone confirmé"                                 | Reformulées autour de l'authentification Apple/Google ou du profil complet, selon le contexte                                   |
| §17.1 (tableau des limites) | Ligne "OTP téléphone"                                                      | Ligne "Authentification Apple/Google"                                                                                           |
| §23                         | "Identifiant principal : numéro de téléphone marocain (+212) avec OTP SMS" | "Identifiant principal : authentification via Sign in with Apple ou Google"                                                     |
| §26                         | "Auth : Supabase Auth, OTP téléphone via provider SMS tiers"               | "Auth : Supabase Auth, Sign in with Apple + Google — aucun provider SMS"                                                        |
| §27 (schéma)                | `users` incluait `phone`, `phone_verified_at`                              | `users` inclut `auth_provider` (`apple`/`google`) ; **aucun champ de téléphone dans le schéma V1.3**                            |
| §28 (API)                   | `auth` = envoi/vérification OTP ; condition citant `phone_verified_at`     | `auth` = Sign in with Apple/Google ; condition citant la session Apple/Google + profil complet                                  |
| §29 (plan de dev)           | Phase 1 "OTP téléphone"                                                    | Phase 1 "Sign in with Apple/Google"                                                                                             |

**Ce qui n'a pas changé** : toutes les décisions numérotées 1 à 3 (participation, visibilité, langue), 6 à 9 (Home, carte, création, chat), la localisation marocaine (hors identifiant d'auth), les catégories, le business model, les indicateurs de succès, la règle `under_review` binaire (6.4bis, inchangée sur le fond), le badge (toujours supprimé, sans lien avec ce changement), l'absence de biométrie (toujours absente, raison distincte).

---

## CONTRADICTIONS À PROPAGER (V1.3)

Cette révision met à jour **Blueprint, Onboarding et Safety Layer** dans la même passe — ces trois documents sont désormais cohérents entre eux sur l'authentification. **Les documents suivants n'ont pas été touchés** et contiennent encore des références au téléphone héritées de la propagation V1.2.1 (suppression du liveness) ; elles devront être corrigées lors d'une prochaine propagation dédiée, hors périmètre de cette révision :

### DESIGN SYSTEM V1.2.1

- **§8, §14, §19, §22** — le composant `PhoneConfirmedText` et ses règles de placement ("Compte confirmé par téléphone" dans le profil complet) n'ont plus d'objet : la ligne de confiance textuelle qu'il portait n'existe plus (Blueprint §6.6, V1.3). À retirer de l'inventaire de composants.

### HOME V1.2.1

- Condition d'accès et bannières "Non vérifiée" / "Compte pas prêt à participer" référencent `phone_verified_at` : à reformuler sur la base de la nouvelle condition en 6 points (§6.4, V1.3).

### CREATE PLAN V1.2.1

- Même contradiction que Home, dans les feuilles "ce qui manque" (§12) : les messages `"Confirme ton numéro pour continuer."` n'ont plus de sens et doivent être retirés du répertoire de messages possibles, remplacés par les seuls messages relatifs au profil (prénom, date, ville, photo).

### PLAN DETAIL + JOIN V1.2.1

- Section 13bis (état de compte de la personne connectée) référence la même condition à trois points héritée de la V1.2.1 : à aligner sur la nouvelle condition en 6 points.

### PLAN GROUP CHAT V1

- **Aucune contradiction** — confirmé une nouvelle fois, ce document ne référence ni téléphone, ni OTP, ni badge, ni biométrie.

**Aucune de ces quatre propagations n'a été effectuée dans cette révision**, conformément au périmètre fixé : seuls Blueprint, Onboarding et Safety Layer devaient être rouverts.

**La propagation vers Design System, Home, Create Plan, Plan Detail + Join et Onboarding + Verification n'a pas commencé.** Elle reste conditionnée à une validation explicite, document par document.