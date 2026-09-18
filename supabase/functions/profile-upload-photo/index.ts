// Edge Function `profile-upload-photo` — Technical Blueprint V1.3 §13. Entrée : fichier image. Upload vers le bucket avatars (avatars/{user_id}/profile.jpg), retourne photo_url.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('profile-upload-photo', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('profile-upload-photo');
});
