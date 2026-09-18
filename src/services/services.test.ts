import { FunctionsHttpError } from '@supabase/supabase-js';
import { toAppError } from './_internal';
import { getRouteForNotification } from './notifications.service';
import { toPlanPublic } from './plans.service';
import { isNotificationPayload, NOTIFICATION_TYPES } from '@/types/notifications';

describe('toAppError — codes stables, jamais de message brut', () => {
  it('reconnaît le garde-fou SQL des 3 plans actifs', async () => {
    expect((await toAppError({ message: 'max_active_plans_reached', code: 'P0001' })).code).toBe(
      'max_active_plans',
    );
  });

  it('traduit un refus de RLS / privilège en `forbidden`', async () => {
    expect(
      (await toAppError({ code: '42501', message: 'new row violates row-level security policy' }))
        .code,
    ).toBe('forbidden');
  });

  it('lit le code stable renvoyé par une Edge Function', async () => {
    const response = new Response(
      JSON.stringify({ error: { code: 'under_review', message: 'x' } }),
      { status: 403 },
    );
    expect((await toAppError(new FunctionsHttpError(response))).code).toBe('under_review');
  });

  it('retombe sur `unknown` pour une erreur inconnue', async () => {
    expect((await toAppError('boom')).code).toBe('unknown');
  });
});

describe('getRouteForNotification', () => {
  it('ouvre le chat pour un nouveau message et le détail pour les autres événements de plan', () => {
    expect(
      getRouteForNotification({
        type: 'new_message',
        plan_id: 'p1',
        plan_titre: 'T',
        sender_id: 's',
        sender_prenom: 'A',
        preview: 'x',
      }),
    ).toBe('/plan/p1/chat');
    expect(
      getRouteForNotification({ type: 'request_accepted', plan_id: 'p1', plan_titre: 'T' }),
    ).toBe('/plan/p1');
    expect(
      getRouteForNotification({
        type: 'plan_updated',
        plan_id: 'p1',
        plan_titre: 'T',
        champ_modifie: 'lieu',
      }),
    ).toBe('/plan/p1');
  });

  it('renvoie la modération vers le Profil (jamais un contenu généré depuis le payload)', () => {
    expect(getRouteForNotification({ type: 'moderation', account_status: 'under_review' })).toBe(
      '/(tabs)/profil',
    );
  });
});

describe('contrat de notifications (Blueprint §37)', () => {
  it('ne connaît que les 8 types transactionnels des specs', () => {
    expect([...NOTIFICATION_TYPES].sort()).toEqual([
      'join_request',
      'moderation',
      'new_message',
      'new_participant',
      'plan_reminder',
      'plan_updated',
      'request_accepted',
      'request_declined',
    ]);
    expect(isNotificationPayload({ type: 'marketing_digest' })).toBe(false);
    expect(isNotificationPayload({ type: 'moderation', account_status: 'active' })).toBe(true);
  });
});

describe('toPlanPublic — jamais d’adresse exacte', () => {
  const row = {
    id: 'p1',
    creator_id: 'u1',
    categorie_cle: 'cafe',
    titre: 'Café à Gauthier',
    description: null,
    lieu_public: 'Café Bianca — Gauthier',
    quartier: 'Gauthier',
    date_heure: '2026-09-18T20:00:00Z',
    places_max: 4,
    participation_mode: 'auto',
    status: 'actif',
    city_id: 'c1',
  };

  it('convertit une ligne de plans_public et n’expose aucun champ adresse_exacte', () => {
    const plan = toPlanPublic(row);
    expect(plan).toMatchObject({
      id: 'p1',
      categorie_cle: 'cafe',
      participation_mode: 'auto',
      status: 'actif',
    });
    expect(plan).not.toHaveProperty('adresse_exacte');
  });

  it('rejette une ligne incohérente (catégorie hors liste fermée, statut inconnu)', () => {
    expect(toPlanPublic({ ...row, categorie_cle: 'dating' })).toBeNull();
    expect(toPlanPublic({ ...row, status: 'zombie' })).toBeNull();
    expect(toPlanPublic({ ...row, id: null })).toBeNull();
  });
});
