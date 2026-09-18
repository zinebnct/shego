# E2E — Maestro

Socle des tests de bout en bout prévus par le Technical Blueprint V1.3 §30 (Maestro, YAML déclaratif). **Seul le socle
existe** ; les parcours complets arrivent avec les écrans fonctionnels.

## Lancer

```bash
# Maestro CLI : https://maestro.mobile.dev
npm run e2e                       # maestro test e2e/flows
maestro test e2e/flows/00-onboarding-entry.yaml
```

Prérequis : un build de développement installé (`npm run eas:dev`), un projet Supabase **dev** (données fictives, jamais
la production) et l'`appId` du profil (`com.shego.app.dev` en développement, `.staging` en préproduction).

## Flows présents

| Flow | Vérifie |
| --- | --- |
| `00-onboarding-entry.yaml` | Écrans 1 → 3 : promesse, cadre de confiance honnête, choix Apple / Google |

## Flows à écrire (Blueprint §30)

1. Parcours d'onboarding complet (11 écrans) — Sign in with Apple **et** Sign in with Google testés séparément.
2. Boucle DISCOVER → CREATE → JOIN → CHAT sur deux comptes de test distincts.
3. Refus de permission (notifications, localisation) : aucun blocage, Home en mode « ville entière ».
4. Compte `under_review` (injecté en base de test) : blocage de Create / Join / Chat et textes exacts affichés.

> Comptes de test Apple/Google : à provisionner côté environnement de staging (les tokens ne sont jamais versionnés).
