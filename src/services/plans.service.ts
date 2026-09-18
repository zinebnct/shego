/**
 * Plans — Technical Blueprint V1.3 §21 : discoverPlans, getPlan, createPlan, cancelPlan, updateCapacity, updateLocationTime.
 *
 * RÈGLE 15.1 (adresse exacte) : la lecture passe TOUJOURS par une vue.
 *   - `plans_public` (par défaut) : lieu_public + quartier, jamais l'adresse exacte ;
 *   - `plans_full` : adresse exacte, uniquement pour la créatrice / une participante acceptée (filtre serveur).
 * Aucun `select('*')` sur la table `plans` (privilège de colonne : refusé). Aucun masquage côté client.
 */
import { supabase } from '@/lib/supabase';
import { isCategoryKey, type CategoryKey, type ParticipationMode } from '@/types/categories';
import type { Views } from '@/types/database.types';
import type { PlanFull, PlanPublic, PlanStatus } from '@/types/domain';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { EDGE_FUNCTIONS, fromSupabase, invokeFunction } from './_internal';

const PLAN_PUBLIC_COLUMNS =
  'id, creator_id, categorie_cle, titre, description, lieu_public, quartier, date_heure, places_max, participation_mode, status, city_id';
const PLAN_FULL_COLUMNS = `${PLAN_PUBLIC_COLUMNS}, adresse_exacte`;

const PLAN_STATUSES: readonly PlanStatus[] = ['actif', 'complet', 'annule', 'passe'];

/** Ligne de vue (colonnes nullables) → plan strict, ou `null` si la ligne est incohérente. */
export function toPlanPublic(row: Omit<Views<'plans_public'>, 'lieu'>): PlanPublic | null {
  const { id, creator_id, categorie_cle, titre, lieu_public, quartier, date_heure, city_id } = row;
  if (
    !id ||
    !creator_id ||
    !categorie_cle ||
    !titre ||
    !lieu_public ||
    !quartier ||
    !date_heure ||
    !city_id
  ) {
    return null;
  }
  if (!isCategoryKey(categorie_cle)) return null;
  const status = PLAN_STATUSES.find((s) => s === row.status);
  const mode =
    row.participation_mode === 'auto' || row.participation_mode === 'request'
      ? row.participation_mode
      : null;
  if (!status || !mode || row.places_max === null) return null;
  return {
    id,
    creator_id,
    categorie_cle,
    titre,
    description: row.description,
    lieu_public,
    quartier,
    date_heure,
    places_max: row.places_max,
    participation_mode: mode,
    status,
    city_id,
  };
}

/** Plan visible avant de rejoindre. */
export async function getPlan(planId: string): Promise<Result<PlanPublic>> {
  const result = await fromSupabase(
    supabase.from('plans_public').select(PLAN_PUBLIC_COLUMNS).eq('id', planId).maybeSingle(),
  );
  if (result.error) return fail(result.error);
  const plan = toPlanPublic(result.data);
  return plan ? ok(plan) : fail(appError('not_found'));
}

/** Plan AVEC adresse exacte — vide (`not_found`) tant que la personne n'est pas créatrice ou acceptée. */
export async function getPlanFull(planId: string): Promise<Result<PlanFull>> {
  const result = await fromSupabase(
    supabase.from('plans_full').select(PLAN_FULL_COLUMNS).eq('id', planId).maybeSingle(),
  );
  if (result.error) return fail(result.error);
  const plan = toPlanPublic(result.data);
  return plan
    ? ok({ ...plan, adresse_exacte: result.data.adresse_exacte })
    : fail(appError('not_found'));
}

export interface DiscoverParams {
  /** Position de l'utilisatrice : transmise le temps de l'appel, JAMAIS persistée (Blueprint produit §15 point 3). */
  lat: number;
  lng: number;
  cityId: string;
  categorie?: CategoryKey;
}

export interface DiscoveredPlan extends PlanPublic {
  /** Distance approximative au lieu du plan (jamais la position d'une utilisatrice). */
  distance_m: number;
  /** Rayon de découverte atteint : 3000 | 8000 | 20000, ou 0 = ville entière. */
  palier: number;
}

export interface DiscoverResult {
  plans: DiscoveredPlan[];
}

/** Découverte élastique (RPC `fn_discover_plans` enveloppée par l'Edge Function `plans-discover`). */
export function discoverPlans(params: DiscoverParams): Promise<Result<DiscoverResult>> {
  return invokeFunction<DiscoverResult>(EDGE_FUNCTIONS.plansDiscover, {
    lat: params.lat,
    lng: params.lng,
    city_id: params.cityId,
    categorie: params.categorie ?? null,
  });
}

export interface CreatePlanInput {
  categorie: CategoryKey;
  titre: string;
  /** ISO 8601 ; jamais dans le passé. */
  dateHeure: string;
  lieu: { lat: number; lng: number };
  lieuPublic: string;
  quartier: string;
  adresseExacte?: string;
  placesMax: number; // 2 à 20
  participationMode: ParticipationMode;
  description?: string;
  cityId: string;
}

/**
 * Création : l'Edge Function revérifie la condition d'accès complète (session, profil, photo, `account_status =
 * active`) et la limite de 3 plans actifs ; la RLS reste la barrière réelle.
 */
export function createPlan(input: CreatePlanInput): Promise<Result<PlanPublic>> {
  return invokeFunction<PlanPublic>(EDGE_FUNCTIONS.plansCreate, {
    categorie_cle: input.categorie,
    titre: input.titre,
    date_heure: input.dateHeure,
    lieu: input.lieu,
    lieu_public: input.lieuPublic,
    quartier: input.quartier,
    adresse_exacte: input.adresseExacte ?? null,
    places_max: input.placesMax,
    participation_mode: input.participationMode,
    description: input.description ?? null,
    city_id: input.cityId,
  });
}

export function cancelPlan(planId: string): Promise<Result<{ ok: true }>> {
  return invokeFunction(EDGE_FUNCTIONS.planCancel, { plan_id: planId });
}

/** Réservé à la créatrice ; refusé si `nouvelleCapacite < participantes acceptées`. */
export function updateCapacity(
  planId: string,
  nouvelleCapacite: number,
): Promise<Result<PlanPublic>> {
  return invokeFunction<PlanPublic>(EDGE_FUNCTIONS.plansUpdateCapacity, {
    plan_id: planId,
    nouvelle_capacite: nouvelleCapacite,
  });
}

export interface UpdateLocationTimeInput {
  lieu?: { lat: number; lng: number };
  lieuPublic?: string;
  quartier?: string;
  adresseExacte?: string;
  dateHeure?: string;
}

/** Réservé à la créatrice ; génère un message système dans le chat + une notification `plan_updated`. */
export function updateLocationTime(
  planId: string,
  changes: UpdateLocationTimeInput,
): Promise<Result<PlanPublic>> {
  return invokeFunction<PlanPublic>(EDGE_FUNCTIONS.plansUpdateLocationTime, {
    plan_id: planId,
    lieu: changes.lieu,
    lieu_public: changes.lieuPublic,
    quartier: changes.quartier,
    adresse_exacte: changes.adresseExacte,
    date_heure: changes.dateHeure,
  });
}
