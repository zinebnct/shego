# Backoffice de modération — hors périmètre de la Phase 1

Application web **séparée** (Next.js ou équivalent — Technical Blueprint V1.3 §2) pour la modération humaine :
file de signalements, revue des comptes signalés ou suspects, actions sur `account_status`
(avertir, `under_review`, réactiver, suspendre, bannir), journal d'audit.

Elle n'est **pas initialisée** dans cette phase. Contrat déjà posé côté serveur :

- rôle admin = claim JWT `app_metadata.role = 'admin'` (`fn_is_admin`, migration 3) ;
- RLS admin sur `reports` et `moderation_actions` (migration 4) ;
- actions via l'Edge Function `moderation-action` (squelette) — chaque action est journalisée dans `moderation_actions` ;
- client typé partagé : `src/services/moderation.service.ts` (jamais importé par l'app mobile — règle ESLint).

Ce dossier est exclu de `tsconfig.json` et d'ESLint.
