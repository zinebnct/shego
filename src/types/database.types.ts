/**
 * Types de la base de données SHEGO (schéma `public`).
 *
 * ⚠️  Écrit à la main, au format de `supabase gen types typescript`, à partir des migrations
 *     supabase/migrations/2026091800000{2..8}_*.sql (tant qu'aucune instance Supabase n'a été générée ici).
 *     Régénérer dès qu'une instance existe :  npm run db:types   (local)  |  npm run db:types:remote
 *     Les colonnes `geography` sont typées `unknown` par le générateur (elles transitent en GeoJSON/WKB).
 *
 * `users` ne contient AUCUN champ de contact téléphonique (règle LOCKED).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          cle: string;
          nom: string;
          actif: boolean;
          centre: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          cle: string;
          nom: string;
          actif?: boolean;
          centre: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          cle?: string;
          nom?: string;
          actif?: boolean;
          centre?: unknown;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          auth_provider: string;
          prenom: string | null;
          date_naissance: string | null;
          ville_id: string | null;
          bio: string | null;
          photo_url: string | null;
          locale: string;
          account_status: string;
          notifications_opt_in: boolean;
          location_opt_in: boolean;
          device_id: string | null;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          auth_provider: string;
          prenom?: string | null;
          date_naissance?: string | null;
          ville_id?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          locale?: string;
          account_status?: string;
          notifications_opt_in?: boolean;
          location_opt_in?: boolean;
          device_id?: string | null;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        /** Côté client, seules ces colonnes sont modifiables (privilèges de colonne, migration 4). */
        Update: {
          prenom?: string | null;
          date_naissance?: string | null;
          ville_id?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          locale?: string;
          notifications_opt_in?: boolean;
          location_opt_in?: boolean;
          device_id?: string | null;
          push_token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_ville_id_fkey';
            columns: ['ville_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      interests: {
        Row: { id: string; cle: string; ordre: number };
        Insert: { id?: string; cle: string; ordre: number };
        Update: { id?: string; cle?: string; ordre?: number };
        Relationships: [];
      };
      user_interests: {
        Row: { user_id: string; interest_id: string; created_at: string };
        Insert: { user_id: string; interest_id: string; created_at?: string };
        Update: { user_id?: string; interest_id?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: 'user_interests_interest_id_fkey';
            columns: ['interest_id'];
            isOneToOne: false;
            referencedRelation: 'interests';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          creator_id: string;
          categorie_cle: string;
          titre: string;
          description: string | null;
          lieu: unknown;
          lieu_public: string;
          quartier: string;
          /** Non sélectionnable via la table (règle 15.1) — lire `plans_full`. */
          adresse_exacte: string | null;
          date_heure: string;
          places_max: number;
          participation_mode: string;
          status: string;
          city_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          categorie_cle: string;
          titre: string;
          description?: string | null;
          lieu: unknown;
          lieu_public: string;
          quartier: string;
          adresse_exacte?: string | null;
          date_heure: string;
          places_max: number;
          participation_mode: string;
          status?: string;
          city_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'plans_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plans_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_participants: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          status: string;
          created_at: string;
          responded_at: string | null;
        };
        Insert: { plan_id: string; user_id: string; status?: string };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'plan_participants_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          plan_id: string;
          sender_id: string | null;
          contenu: string;
          type: string;
          created_at: string;
        };
        Insert: { plan_id: string; sender_id: string; contenu: string; type?: string };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'messages_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          motif: string;
          commentaire: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_type: string;
          target_id: string;
          motif: string;
          commentaire?: string | null;
        };
        Update: { status?: string; reviewed_by?: string | null; reviewed_at?: string | null };
        Relationships: [];
      };
      blocks: {
        Row: { id: string; blocker_id: string; blocked_id: string; created_at: string };
        Insert: { blocker_id: string; blocked_id: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          lu: boolean;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: { lu?: boolean };
        Relationships: [];
      };
      moderation_actions: {
        Row: {
          id: string;
          target_user_id: string;
          moderator_id: string | null;
          is_automatic: boolean;
          action: string;
          raison: string | null;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      behavior_signals: {
        Row: {
          id: string;
          user_id: string;
          type_signal: string;
          valeur: Json;
          fenetre_debut: string;
          fenetre_fin: string;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      app_config: {
        Row: { cle: string; valeur: Json; updated_at: string };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      /** Autres profils : Avatar · Prénom · Âge · Ville · bio — jamais la date de naissance. */
      public_profiles: {
        Row: {
          id: string | null;
          prenom: string | null;
          age: number | null;
          ville_id: string | null;
          bio: string | null;
          photo_url: string | null;
        };
        Relationships: [];
      };
      /** Plans SANS `adresse_exacte` (lisible par toutes, avant de rejoindre). */
      plans_public: {
        Row: {
          id: string | null;
          creator_id: string | null;
          categorie_cle: string | null;
          titre: string | null;
          description: string | null;
          lieu: unknown;
          lieu_public: string | null;
          quartier: string | null;
          date_heure: string | null;
          places_max: number | null;
          participation_mode: string | null;
          status: string | null;
          city_id: string | null;
        };
        Relationships: [];
      };
      /** Plans AVEC `adresse_exacte` : créatrice ou participante acceptée uniquement (règle 15.1). */
      plans_full: {
        Row: {
          id: string | null;
          creator_id: string | null;
          categorie_cle: string | null;
          titre: string | null;
          description: string | null;
          lieu: unknown;
          lieu_public: string | null;
          quartier: string | null;
          adresse_exacte: string | null;
          date_heure: string | null;
          places_max: number | null;
          participation_mode: string | null;
          status: string | null;
          city_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      fn_discover_plans: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_city_id: string;
          p_categorie?: string;
          p_max_results?: number;
        };
        Returns: { plan_id: string; distance_m: number; palier: number }[];
      };
      fn_list_blocked: {
        Args: Record<PropertyKey, never>;
        Returns: {
          blocked_id: string;
          prenom: string | null;
          photo_url: string | null;
          created_at: string;
        }[];
      };
      fn_is_account_ready: { Args: { p_user_id: string }; Returns: boolean };
      fn_is_account_active: { Args: { p_user_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row'];
