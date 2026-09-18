# SHEGO SAFETY LAYER — V1.1

Spécification transverse, autonome. Source de vérité sur tout ce qui concerne la détection et le traitement des comptes malveillants, en complément — jamais en remplacement — du SHEGO PRODUCT BLUEPRINT V1.3 et du SHEGO DESIGN SYSTEM V1.3, qu'elle ne modifie pas. Devient la référence transverse pour l'Onboarding, le Profil, les Reports, la Modération et l'architecture backend, à propager dans ces documents lors de leurs prochaines révisions respectives — non traité ici.

> **Le principe qui gouverne tout ce document** : SHEGO ne peut pas garantir que chaque compte appartient réellement à une femme, et ne le prétend jamais. La Safety Layer ne cherche pas à combler cette impossibilité par un artifice technique — elle organise à la place un système de barrières, de signaux, de signalement et de jugement humain, honnête sur ses limites à chaque étape.

---

## 1. Objectifs

- Réduire, sans l'éliminer, le risque qu'une personne malveillante crée un compte pour accéder à la communauté SHEGO — notamment en usurpant la photo d'une autre personne.
- Réduire le risque de comptes automatisés, de spam, et de comportements d'abus répétés.
- Permettre une réaction rapide une fois un problème détecté ou signalé, sans attendre qu'il cause un préjudice.
- Faire reposer la confiance sur des mécanismes que SHEGO peut honnêtement décrire, jamais sur une promesse d'identité ou de genre.
- Rester compatible avec le refus assumé de toute biométrie (Blueprint V1.3 §6.1) : chaque mécanisme de cette couche doit fonctionner **sans** selfie, liveness, reconnaissance faciale, comparaison biométrique, CIN/CNIE, ou estimation automatique du genre à partir d'une image.

---

## 2. Menaces couvertes

- Création d'un faux compte utilisant la photo d'une autre personne (usurpation de photo).
- Création de comptes multiples par une même personne ou un même dispositif (spam, contournement de suspension).
- Comportement automatisé ou de type bot (scripts de création de compte, actions à vitesse anormale).
- Harcèlement ou comportement inapproprié une fois dans la communauté.
- Tentative de déplacer rapidement le contact hors de SHEGO à des fins d'abus (partage massif de coordonnées, liens suspects).
- Récidive après une première sanction (suspension ou bannissement contourné par la recréation d'un compte).
- Profils manifestement non exploitables ou inappropriés (photo illisible, contenu choquant).

---

## 3. Menaces non couvertes — limites assumées

À dire clairement, en interne et dans toute communication produit, sans exception :

- **SHEGO ne peut pas confirmer qu'une personne inscrite est réellement une femme.** Aucun mécanisme de cette couche ne le permet, et aucun n'est censé le permettre.
- **SHEGO ne peut pas empêcher un individu déterminé et isolé** de contourner temporairement les barrières d'entrée (compte Apple/Google, photo) s'il agit seul, avec patience, et sans déclencher de signal comportemental détectable.
- **SHEGO ne peut pas vérifier qu'une photo de profil représente réellement la personne qui l'a téléversée**, en l'absence de toute biométrie — seule la communauté (signalement) et la modération humaine peuvent repérer une incohérence a posteriori.
- **SHEGO ne peut pas garantir l'absence totale de faux comptes à un instant donné** — seulement réduire leur nombre et accélérer leur traitement une fois détectés.
- Cette Safety Layer est un ensemble de **barrières et de réactions**, pas un système de détection préventive infaillible.

---

## 4. Barrières d'entrée

Conditions requises pour qu'un compte existe et soit utilisable, reprises du Blueprint V1.3 §6.2 et §6.4, consolidées ici du point de vue de la sécurité :

| **BarrièreRôleCe qu'elle n'est pas**                                                                                                                                   |                                                                                                                                                                                                                                     |                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Authentification via Sign in with Apple ou Google                                                                                                                      | Authentifie l'accès au compte ; limite la création de comptes jetables en masse (créer un compte Apple ou Google en masse a son propre coût et sa propre friction, ces plateformes appliquant déjà leurs propres limites anti-abus) | **Jamais** une preuve d'identité ou de genre                                                      |
| **Signal ****`device_id`** (identifiant technique non biométrique)                                                                                                     | Détecte les créations multiples de compte depuis un même appareil, indépendamment du fournisseur d'authentification                                                                                                                 | Ne bloque pas quelqu'un qui dispose de plusieurs appareils ou réinstalle l'app                    |
| Photo de profil obligatoire                                                                                                                                            | Élément de reconnaissance visuelle entre participantes lors d'un rendez-vous                                                                                                                                                        | **Jamais** une preuve d'identité, de genre, ni le résultat d'une vérification quelconque          |
| Prénom                                                                                                                                                                 | Identifiant social minimal dans les plans et les chats                                                                                                                                                                              | Non vérifié en tant que tel                                                                       |
| Âge 18+ (déclaratif, calculé depuis la date de naissance)                                                                                                              | Condition d'accès légale minimale                                                                                                                                                                                                   | Non vérifié par un document officiel (pas de CIN en V1, Blueprint §6.1)                           |
| Ville (Casablanca en V1, liste fermée)                                                                                                                                 | Cohérence de la découverte géographique                                                                                                                                                                                             | Sans lien avec la sécurité de l'identité                                                          |
| **Profil suffisamment complété avant Create/Join** — session Apple/Google valide + prénom + date de naissance/18+ + ville + photo présente + `account_status = active` | Condition d'accès aux actions sensibles (Blueprint §6.4), déjà propagée dans Home, Create Plan et Plan Detail V1.3                                                                                                                  | Ne garantit rien sur la personne elle-même, seulement que le compte a rempli les étapes attendues |

Aucune de ces barrières, seule ou combinée, ne constitue une preuve d'identité. Leur rôle est de rendre la création d'un faux compte **moins facile et moins gratuite**, pas de l'empêcher.

---

## 5. Signaux comportementaux — première version MVP

Signaux non biométriques, tous **paramétrables côté serveur** (seuils ajustables sans redéploiement, cohérent avec le principe déjà établi pour `app_config` dans le Blueprint) :

- Multiples créations de comptes depuis un même dispositif ou via un signal technique non biométrique disponible dans l'architecture MVP, sur une période courte. Les techniques de fingerprinting avancé restent LATER (voir §16).
- Vitesse anormale d'actions après création (ex. plusieurs plans créés ou plusieurs demandes de participation en quelques minutes).
- Création excessive de plans sur une fenêtre de temps donnée, au-delà de la limite déjà fixée par le Blueprint (3 plans actifs simultanés).
- Tentatives répétées et rapprochées de rejoindre des plans, en particulier si suivies d'annulations tout aussi rapides.
- Motifs de comportement automatisé : cadence d'actions trop régulière pour un usage humain typique, absence de pauses, séquences d'actions identiques répétées.
- Volume inhabituel de messages envoyés dans les chats de plan sur une courte période.
- Accumulation rapide de signalements distincts et cohérents (voir §7 pour le seuil de passage en `under_review`).
- Récidive : nouvelle tentative de création de compte après une suspension ou un bannissement (voir §9).

**Ce que ces signaux ne deviennent jamais** :

- Un score de fiabilité visible par l'utilisatrice, sous quelque forme que ce soit (voir §8).
- Une analyse du contenu de la photo de profil (aucune détection de visage, aucune estimation de genre).
- Un système de décision automatique définitive — les signaux forts déclenchent au maximum un passage en `under_review` (accès restreint, réversible), jamais une suspension ou un bannissement automatiques (§7).

---

## 6. Signalement

### Motifs de signalement d'un profil

Liste fermée, cohérente avec le Design System V1.3 :

- Contenu inapproprié
- Harcèlement
- **Profil suspect / usurpation**
- Problème de sécurité
- Autre (champ libre)

### Motif "Profil suspect / usurpation" — champ dédié

Un champ facultatif accompagne ce motif :

> **"Explique-nous ce qui te semble suspect"** *Par exemple : photo qui semble appartenir à quelqu'un d'autre, informations incohérentes, comportement inhabituel.*

### Vocabulaire — interdits stricts

Ne jamais employer, dans l'interface, l'aide contextuelle, ou toute communication liée au signalement :

- ❌ "Confirme que c'est un homme"
- ❌ "Signaler cet homme"
- ❌ "Vérifier son genre"
- ❌ Toute formulation qui présuppose ou demande à la signalante de trancher elle-même le genre de la personne signalée.

Le signalement porte sur un **comportement ou une incohérence observable** (photo, informations, attitude), jamais sur une affirmation de genre que ni la signalante ni SHEGO ne peuvent établir.

---

## 7. Règles de passage en `under_review`

Trois voies, aucune automatisation vers une sanction définitive :

### A. Un signalement isolé

→ Enregistré dans l'historique du compte signalé. → **Aucune suspension automatique immédiate.** Un signalement seul, sans corroboration, n'est qu'un signal parmi d'autres, en attente d'éventuels autres signaux avant toute action.

### B. Plusieurs signalements distincts et cohérents

→ **Passage automatique en ****`account_status = under_review`****.** Le seuil exact (nombre de signalements distincts, fenêtre de temps, exigence de cohérence entre les motifs) est un paramètre serveur, calibré au lancement et ajustable sans redéploiement — non fixé dans ce document.

### C. Signaux techniques forts d'abus

→ **Possibilité de passage automatique en ****`under_review`**, indépendamment de tout signalement humain, pour les cas les plus nets de comportement automatisé ou de récidive détectée (§5, §9). Le mot "possibilité" est délibéré : contrairement au cas B, ce déclenchement reste configurable et peut, selon le signal, être routé vers une revue humaine préalable plutôt qu'un passage automatique, à la discrétion de la configuration serveur.

### Pendant `under_review` — règle binaire, reprise du Blueprint V1.3 §6.4bis

Aucun Create, aucun Join, aucun Chat. Rien d'autre n'est modulé selon la gravité en V1 — cette couche de sécurité respecte la même règle binaire déjà propagée dans Home, Create Plan et Plan Detail, elle ne la redéfinit pas.

### Décision humaine, toujours en aval

La modération humaine, jamais un système automatique, décide ensuite parmi quatre issues :

- **Avertir** sans changer le statut (le compte redevient `active` sans avoir jamais quitté cet état, ou reste `active` s'il ne l'a jamais perdu — un avertissement peut aussi survenir sans passage préalable par `under_review`, pour un cas mineur).
- **Réhabiliter** vers `active`.
- **Suspendre**.
- **Bannir**.

**Aucun autre état de confiance n'est créé.** Le modèle reste strictement celui du Blueprint V1.3 §6.3 : `active | under_review | suspended | banned`.

---

## 8. Aucun "trust score"

Explicitement exclus du MVP, sans exception et sans variante édulcorée :

- Score de confiance, quelle que soit sa forme (numérique, en étoiles, en niveaux).
- Score de fiabilité affiché publiquement.
- Pourcentage de confiance.
- Badge de sécurité, quel qu'il soit — cohérent avec la suppression totale du badge actée dans le Design System V1.3.
- Mention "profil fiable" ou toute formulation équivalente.

Tous les signaux comportementaux et historiques de signalement décrits dans ce document restent **strictement internes à la modération**, visibles uniquement dans le backoffice (§11), jamais exposés à l'utilisatrice elle-même ni aux autres utilisatrices.

---

## 9. Récidive de compte — révisé en V1.1 (authentification Apple/Google)

### Principe

**Un compte Apple ou Google ne peut correspondre qu'à un compte SHEGO actif à un moment donné.** Cette règle s'applique tant que le compte existe. Elle ne s'étend pas automatiquement au-delà de la suppression du compte — voir ci-dessous. *(Cette section remplace intégralement l'ancienne "Récidive et numéro de téléphone" — le mécanisme d'authentification par téléphone n'existe plus, Blueprint V1.3.)*

### Décision MVP — aucune conservation post-suppression à des fins de récidive

**Dans le MVP, aucune empreinte de l'identifiant Apple/Google n'est conservée après la suppression d'un compte, et aucune liste noire de comptes post-suppression n'existe.** Un compte suspendu ou banni, s'il est ensuite supprimé (à sa demande ou selon la politique de suppression), ne laisse derrière lui aucune trace exploitable dans le but d'empêcher une recréation future.

**Conséquence assumée** : le MVP accepte le risque résiduel qu'un compte banni recrée un compte avec un autre identifiant Apple/Google. Ce risque existe de toute façon, quel que soit le mécanisme technique retenu à terme — aucune barrière de ce type n'est infaillible (§3).

Tant qu'un compte est **actif** (y compris `under_review` ou `suspended`, qui n'ont pas encore été supprimés), la règle "un identifiant Apple/Google = un compte actif" continue de s'appliquer normalement et empêche la création d'un second compte avec le même identifiant.

### LATER — mécanisme anti-récidive post-suppression

Un mécanisme de prévention de la récidive après suppression reste une piste **LATER**, explicitement hors MVP. **Toute conservation de données à cette fin, si elle est un jour envisagée, devra faire l'objet d'une validation juridique préalable** (conseil juridique marocain compétent, et le cas échéant la Commission Nationale de contrôle de la protection des Données à caractère Personnel), avant toute implémentation. Ce document ne préjuge pas de l'issue de cette validation ni de l'option qui serait retenue.

---

## 10. Photo de profil

Reprend et complète le Blueprint V1.3 §6.2 du point de vue de la sécurité :

- **Aucune reconnaissance faciale.**
- **Aucune estimation automatique du genre** à partir de l'image.
- **Aucune comparaison avec une autre photo**, qu'elle appartienne au même compte ou à un autre.
- **Aucune prétention d'authentification** — la photo ne prouve rien, elle sert uniquement la reconnaissance visuelle IRL (Design System V1.3 §8).

### Modération basique de contenu — nécessaire, distincte de toute vérification

Une modération légère est nécessaire pour écarter :

- l'absence de photo exploitable (fichier corrompu, image totalement noire ou floue) ;
- une photo manifestement inappropriée (nudité, violence, contenu choquant) ;
- une image qui n'est manifestement pas une photo de profil exploitable (capture d'écran sans rapport, publicité, texte seul).

**Cette modération doit être présentée, dans toute communication interne comme externe, comme une modération de contenu et de qualité du profil — jamais comme une vérification d'identité ou de genre.** Elle répond à la question "cette image est-elle une photo de profil acceptable ?", jamais à la question "cette personne est-elle bien qui elle prétend être ?". La première est un contrôle de forme, réalisable ; la seconde ne l'est pas sans biométrie, et SHEGO ne prétend pas la résoudre.

En V1, cette modération est **humaine et a posteriori** (revue lors de signalements ou d'un contrôle par échantillonnage), pas un filtre automatique bloquant à l'upload — un filtre automatique de détection de contenu explicite est une piste LATER (§16), pas un prérequis du MVP.

---

## 11. Visibilité du profil

**Principe conservé, non rouvert** (Blueprint V1.3 §7.2) : les profils ne sont **jamais recherchables librement**. Un profil n'est accessible qu'à partir d'un contexte de plan — participante, demande de participation, chat, créatrice ou participante d'un plan commun.

Ce principe fait partie intégrante de la Safety Layer : il limite structurellement l'exploitation d'un faux profil à grande échelle. Un faux compte ne peut pas être parcouru comme un catalogue ; il ne devient visible qu'aux personnes avec qui il a un contexte de plan réel, ce qui réduit à la fois sa portée et augmente la probabilité qu'un signalement provienne de quelqu'un ayant eu une interaction concrète et significative.

---

## 12. Backoffice — vue modération

Le backoffice permet à un modérateur de voir, pour un compte donné :

- Identifiant, date de création.
- Fournisseur d'authentification (Apple ou Google).
- Photo de profil (visible par le modérateur pour évaluer la modération de contenu, §10).
- Nombre de plans créés.
- Nombre de plans rejoints.
- Nombre de signalements reçus, avec leurs motifs.
- Historique complet des décisions de modération déjà prises sur ce compte (avertissements, passages `under_review`, réhabilitations, suspensions, bannissements — avec date et modérateur responsable).
- Signaux comportementaux ayant déclenché, le cas échéant, un passage automatique en `under_review` (§7, voie C).

### Actions disponibles pour le modérateur

- Avertir (sans changer le statut).
- Remettre `active`.
- Passer `under_review`.
- Suspendre.
- Bannir.

Chaque action est journalisée (qui, quoi, quand) — cohérent avec le journal d'audit déjà prévu dans le Blueprint §17.

---

## 13. Données conservées

> **Principe canonique de conservation.** Aucune donnée personnelle n'est conservée sans finalité définie. Chaque catégorie de données possède une durée de conservation documentée. Les données sont supprimées ou anonymisées dès qu'elles ne sont plus nécessaires à la finalité pour laquelle elles ont été collectées, sous réserve des obligations légales applicables et des éventuelles obligations de conservation dûment justifiées.

### Suppression du compte

Lorsqu'une utilisatrice demande la suppression de son compte :

- les données personnelles du compte sont supprimées conformément au délai opérationnel défini par la politique de suppression *(délai exact non fixé ici — à définir dans la politique de confidentialité et à valider juridiquement, voir note ci-dessous)* ;
- la **photo de profil** est supprimée ;
- **la liaison au compte Apple/Google est supprimée côté Supabase Auth** — aucune donnée de téléphone n'existe dans le MVP à supprimer (§9) ;
- les **données de profil** (prénom, date de naissance, ville, bio, intérêts) sont supprimées ;
- **les données inutiles à une obligation légale ou à une finalité de sécurité justifiée ne sont pas conservées.**

**Aucun délai précis n'est fixé dans ce document.** Le délai opérationnel exact de suppression effective doit être défini dans la politique de confidentialité du produit et validé juridiquement avant implémentation — ce document ne l'invente pas.

### Compte signalé ou banni ≠ conservation illimitée

Un compte `under_review`, `suspended` ou `banned` peut voir certaines données conservées **pendant la durée strictement nécessaire** à la gestion de la modération, à un éventuel recours de l'utilisatrice, ou à une obligation légale applicable. **Un bannissement ne justifie pas, à lui seul, une conservation indéfinie de l'ensemble des données personnelles après la suppression du compte.** Si l'utilisatrice bannie demande ensuite la suppression de son compte, les mêmes règles que ci-dessus s'appliquent : seules les données réellement nécessaires à une finalité légale ou de sécurité déjà justifiée peuvent survivre, jamais l'intégralité du profil par défaut.

### Matrice des données

| **DonnéeFinalitéDurée de conservation**               |                                                          |                                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Identifiant de session Apple/Google (`auth_provider`) | Authentification                                         | Durée de vie du compte ; supprimé avec le compte                                                                           |
| Photo de profil                                       | Reconnaissance visuelle IRL, modération de contenu       | Durée de vie du compte ; supprimée à la suppression du compte                                                              |
| Historique de signalements (émis et reçus)            | Détection de patterns, décision de modération            | **Durée à définir selon la finalité et à valider juridiquement** — conservation post-suppression non actée par ce document |
| Signaux comportementaux bruts (logs d'actions)        | Détection d'abus automatisé                              | Fenêtre glissante courte (paramètre serveur) ; pas de conservation indéfinie par défaut                                    |
| Journal des décisions de modération                   | Traçabilité, audit interne                               | **Durée à définir selon la finalité et à valider juridiquement**                                                           |
| Empreinte de récidive de compte                       | Prévention de la recréation de compte après bannissement | **N'existe pas dans le MVP** (§9) — sans objet tant que le mécanisme LATER n'a pas été validé juridiquement                |

---

## 14. Règles de confidentialité

- Aucune donnée listée en §12-13 n'est jamais visible par une autre utilisatrice que la personne concernée elle-même (pour ses propres données) ou un modérateur habilité.
- Les signaux comportementaux et l'historique de signalements ne sont **jamais** exposés, même sous forme agrégée ou anonymisée, dans l'interface utilisatrice (cohérent avec §8, aucun trust score).
- Toute donnée liée à une finalité de sécurité (signaux, signalements, décisions de modération) est traitée selon le principe de **minimisation** : collectée et conservée seulement dans la mesure nécessaire à cette finalité, jamais réutilisée à d'autres fins (pas de profilage marketing, pas de personnalisation basée sur ces signaux).
- Toute question de conservation de données **au-delà de la suppression du compte** (§9, §13) — en particulier tout mécanisme futur de prévention de la récidive — reste **exclue du MVP** et suspendue à une validation juridique explicite avant toute implémentation ultérieure.

---

## 15. Limites du système — tableau de synthèse

| **MécanismeProtection apportéeLimiteRéaction si contourné** |                                                                                                                                                     |                                                                                                                                 |                                                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Authentification Apple/Google**                           | Limite la création massive de comptes jetables ; authentifie l'accès ; empêche la multiplication de comptes depuis le même identifiant Apple/Google | N'identifie pas la personne, ne confirme pas son genre, contournable en créant plusieurs comptes Apple/Google distincts         | Signal comportemental (créations multiples), voie B/C de passage en `under_review`                            |
| **Photo de profil obligatoire**                             | Reconnaissance visuelle IRL ; dissuade une partie des créations impulsives de faux comptes                                                          | Ne prouve rien sur l'identité réelle ; une photo usurpée passe la barrière technique sans difficulté                            | Signalement "Profil suspect / usurpation" (§6) → modération humaine                                           |
| **Modération de contenu de la photo**                       | Écarte les profils manifestement non exploitables ou inappropriés                                                                                   | Ne détecte pas une usurpation d'identité (photo réelle mais volée à quelqu'un d'autre)                                          | Signalement communautaire, seul mécanisme capable de repérer ce cas                                           |
| **Signalement communautaire**                               | Permet à la communauté de faire remonter un problème rapidement                                                                                     | Dépend entièrement de la vigilance des utilisatrices ; un compte peut nuire avant d'être signalé                                | Passage en `under_review` dès seuil de signalements cohérents atteint (§7)                                    |
| **Signaux comportementaux automatisés**                     | Détecte des patterns d'abus sans intervention humaine ni biométrie                                                                                  | Reste un filet probabiliste, pas une garantie ; un individu déterminé et isolé peut passer au travers                           | Passage possible en `under_review` (voie C), sinon rattrapé par signalement ultérieur                         |
| **`under_review`**** binaire**                              | Coupe immédiatement Create/Join/Chat pendant l'examen                                                                                               | Pas de nuance de gravité en V1 ; un cas mineur est traité aussi strictement qu'un cas grave le temps de l'examen                | Décision humaine sous 24-48h (objectif Blueprint §17)                                                         |
| **Modération humaine**                                      | Jugement contextuel, décision réversible ou définitive                                                                                              | Délai de traitement, pas un système temps réel                                                                                  | — (dernier niveau du système)                                                                                 |
| **Blocage bilatéral**                                       | Coupe tout contact futur entre deux comptes, immédiatement                                                                                          | N'empêche pas la création d'un nouveau compte par la même personne ; aucun mécanisme anti-récidive post-suppression en MVP (§9) | Signalement si le pattern se répète sous un nouveau compte ; mécanisme dédié LATER, sous validation juridique |
| **Profil non recherchable**                                 | Empêche l'exploitation d'un faux profil à grande échelle                                                                                            | N'empêche pas le préjudice dans le contexte d'un plan précis, une fois rejoint                                                  | Signalement + retrait immédiat par la créatrice (Blueprint §3.4)                                              |

---

## 16. Éléments LATER

Explicitement hors MVP, à ne pas anticiper dans l'implémentation actuelle :

- Filtre automatique de détection de contenu inapproprié sur la photo de profil (modération a priori plutôt qu'a posteriori).
- Détection d'empreinte de dispositif plus sophistiquée (fingerprinting avancé), au-delà d'un signal simple de création multiple.
- Score de risque interne agrégé pour prioriser la file de modération (tant qu'il reste strictement interne et non un "trust score" exposé — cohérent avec §8).
- Mécanisme de vérification d'identité renforcée optionnelle (déjà noté comme LATER dans le Blueprint §6.7), qui pourrait un jour inclure une biométrie ou une pièce d'identité, sous un cadre juridique dédié et validé — **absolument aucune anticipation technique de ce mécanisme dans le MVP actuel**.
- Politique de récidive par empreinte de compte (§9), une fois validée juridiquement.
- Détection automatisée de tentative de déplacement de conversation hors de la plateforme (partage de coordonnées, liens) au-delà d'un signal comportemental simple de volume — une analyse plus fine du contenu des messages est explicitement hors MVP, pour ne pas engager une surveillance invasive du contenu privé des chats au-delà du strict nécessaire (voir note ci-dessous).

### Note sur la surveillance des messages — MVP minimal

Le MVP ne prévoit **aucune surveillance automatisée invasive du contenu des chats**. La seule protection en V1 repose sur :

- le signalement d'un message par une participante (déjà spécifié dans Plan Group Chat V1) ;
- un signal comportemental de volume anormal de messages (§5), sans lecture ni analyse du contenu lui-même.

Toute détection de contenu plus fine (mots-clés, liens, coordonnées) au-delà du filtre lexical déjà prévu pour les titres de plans et bios (Blueprint §17) reste LATER, et devra elle aussi être conçue pour rester proportionnée — la Safety Layer protège, elle ne surveille pas.

---

## Architecture technique minimale — non codée, décrite pour référence

- Table `users` (Blueprint V1.3 §27) : porte `auth_provider` (`apple`/`google`) et `account_status`. **Aucun champ de téléphone dans le schéma V1.3.**
- Table `reports` (Blueprint §27) : suffit à couvrir le signalement, y compris le motif "Profil suspect / usurpation" et son champ libre associé (`commentaire`).
- **Nouvelle table minimale suggérée, non actée** : `behavior_signals` — id, user\_id, type\_signal (clé), valeur, fenêtre\_temporelle, créé\_le — pour journaliser les signaux comportementaux de §5 sans les mélanger aux signalements humains de `reports`. Sa création précise reste à trancher au moment de l'implémentation, pas dans ce document produit.
- Seuils de déclenchement (§5, §7) : stockés dans `app_config`, déjà prévu par le Blueprint pour d'autres paramètres serveur (rayon élastique, etc.) — le même mécanisme est réutilisé, pas un nouveau système de configuration.
- Aucune dépendance technique nouvelle : pas de service tiers de biométrie, pas de fournisseur de détection de genre. Un éventuel filtre de modération de contenu automatique (LATER, §16) impliquerait un service tiers dédié à évaluer le moment venu, hors périmètre de ce document.

---

**Ce document ne modifie aucun autre document existant, à l'exception du Blueprint et de l'Onboarding, révisés dans la même passe (V1.3) pour la réarchitecture de l'authentification.** Il constitue une référence transverse à propager, lors de prochaines révisions dédiées, dans : le Profil (visibilité, §11), les Reports (motifs et vocabulaire, §6), la Modération (§7, §12) et l'architecture backend (§ finale). Aucune biométrie, aucun badge, aucun trust score public n'a été introduit. La récidive de compte (§9) est tranchée pour le MVP : **aucune conservation post-suppression** ; tout mécanisme futur reste LATER et suspendu à une validation juridique préalable.

---

## CHANGELOG V1 → V1.1

Réarchitecture de l'authentification : le numéro de téléphone + OTP est retiré comme barrière d'entrée, remplacé par l'authentification Sign in with Apple / Sign in with Google. **Aucune autre décision de sécurité rouverte.**

| **SectionV1V1.1**         |                                                                                     |                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| §4 Barrières d'entrée     | "Numéro de téléphone marocain, confirmé par OTP SMS" + "Un compte actif par numéro" | "Authentification via Sign in with Apple ou Google" + "Signal `device_id`"                                                |
| §4 Condition d'accès      | "téléphone confirmé + photo présente + `account_status = active`"                   | Condition en 6 points : session Apple/Google + prénom + date de naissance/18+ + ville + photo + `account_status = active` |
| §9 (titre et contenu)     | "Récidive et numéro de téléphone"                                                   | "Récidive de compte" — reformulée autour de l'identifiant Apple/Google                                                    |
| §12 Backoffice            | Champ "Téléphone confirmé ou non"                                                   | Champ "Fournisseur d'authentification (Apple ou Google)"                                                                  |
| §13 Suppression de compte | "numéro de téléphone", "`phone_verified_at`" supprimés                              | "liaison au compte Apple/Google" supprimée côté Supabase Auth                                                             |
| §13 Matrice des données   | Lignes "Numéro de téléphone", "`phone_verified_at`"                                 | Ligne unique "Identifiant de session Apple/Google"                                                                        |
| §15 Tableau des limites   | Ligne "OTP téléphone"                                                               | Ligne "Authentification Apple/Google"                                                                                     |
| Architecture finale       | Table `users` avec `phone_verified_at`                                              | Table `users` avec `auth_provider`, aucun champ de téléphone                                                              |

**Ce qui n'a pas changé** : photo de profil obligatoire, motif de signalement "Profil suspect / usurpation" et son champ dédié, signaux comportementaux, règle binaire `under_review`, modération humaine comme seule instance de décision, absence de tout trust score, absence de tout traitement biométrique, absence de toute détection automatique du genre, principe de minimisation des données (§13).