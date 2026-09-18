// Edge Function `onboarding-complete-profile` — Technical Blueprint V1.3 §13. Entrée : prenom, date_naissance, ville_id, bio?, interests[]?. Applique 18+ et bloque le compte associé si mineure ; collecte le signal device_id (§39).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction(
  'onboarding-complete-profile',
  { auth: 'user', requireAccountReady: false },
  async () => {
    return notImplemented('onboarding-complete-profile');
  },
);
