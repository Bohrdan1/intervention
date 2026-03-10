export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string | null
          id: string
          nom: string
          sous_titre: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nom: string
          sous_titre?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string
          sous_titre?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      controles: {
        Row: {
          created_at: string | null
          id: string
          installation_id: string
          page_number: number
          points_controle: Json
          points_erp: Json
          rapport_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          installation_id: string
          page_number?: number
          points_controle?: Json
          points_erp?: Json
          rapport_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          installation_id?: string
          page_number?: number
          points_controle?: Json
          points_erp?: Json
          rapport_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controles_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_rapport_id_fkey"
            columns: ["rapport_id"]
            isOneToOne: false
            referencedRelation: "rapports"
            referencedColumns: ["id"]
          },
        ]
      }
      equipements: {
        Row: {
          actif: boolean | null
          created_at: string | null
          etat: string | null
          id: string
          localisation: string
          marque: string
          modele: string | null
          notes: string | null
          site_id: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          etat?: string | null
          id?: string
          localisation: string
          marque: string
          modele?: string | null
          notes?: string | null
          site_id?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          etat?: string | null
          id?: string
          localisation?: string
          marque?: string
          modele?: string | null
          notes?: string | null
          site_id?: string | null
        }
        Relationships: []
      }
      installations: {
        Row: {
          created_at: string | null
          id: string
          modele: string | null
          repere: string
          site_id: string
          type_porte: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modele?: string | null
          repere: string
          site_id: string
          type_porte?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modele?: string | null
          repere?: string
          site_id?: string
          type_porte?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          client_id: string | null
          created_at: string | null
          date_debut_intervention: string | null
          date_fin_intervention: string | null
          date_planifiee: string | null
          description_probleme: string | null
          diagnostic: string | null
          duree_minutes: number | null
          equipement_id: string | null
          facture_envoyee: boolean | null
          facture_id: string | null
          id: string
          montant_ttc: number | null
          nom_signataire: string | null
          notes_internes: string | null
          numero: string | null
          pieces_remplacees: Json | null
          priorite: string | null
          signature_client_url: string | null
          site_id: string | null
          statut: string
          travaux_realises: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date_debut_intervention?: string | null
          date_fin_intervention?: string | null
          date_planifiee?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          duree_minutes?: number | null
          equipement_id?: string | null
          facture_envoyee?: boolean | null
          facture_id?: string | null
          id?: string
          montant_ttc?: number | null
          nom_signataire?: string | null
          notes_internes?: string | null
          numero?: string | null
          pieces_remplacees?: Json | null
          priorite?: string | null
          signature_client_url?: string | null
          site_id?: string | null
          statut?: string
          travaux_realises?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date_debut_intervention?: string | null
          date_fin_intervention?: string | null
          date_planifiee?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          duree_minutes?: number | null
          equipement_id?: string | null
          facture_envoyee?: boolean | null
          facture_id?: string | null
          id?: string
          montant_ttc?: number | null
          nom_signataire?: string | null
          notes_internes?: string | null
          numero?: string | null
          pieces_remplacees?: Json | null
          priorite?: string | null
          signature_client_url?: string | null
          site_id?: string | null
          statut?: string
          travaux_realises?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_equipement_id_fkey"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports: {
        Row: {
          client_id: string
          constat_general: Json | null
          created_at: string | null
          date_intervention: string
          demande_client: string | null
          description_probleme: string | null
          diagnostic: string | null
          id: string
          installation_id: string | null
          numero_cm: string
          observations_visite: string | null
          photos: Json | null
          pieces_utilisees: Json | null
          recommandations: string | null
          signature_client: string | null
          signature_data: string | null
          site_id: string
          statut: string
          technicien: string
          travaux_effectues: string | null
          type_rapport: string | null
          updated_at: string | null
          visite_data: Json | null
        }
        Insert: {
          client_id: string
          constat_general?: Json | null
          created_at?: string | null
          date_intervention?: string
          demande_client?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          id?: string
          installation_id?: string | null
          numero_cm: string
          observations_visite?: string | null
          photos?: Json | null
          pieces_utilisees?: Json | null
          recommandations?: string | null
          signature_client?: string | null
          signature_data?: string | null
          site_id: string
          statut?: string
          technicien?: string
          travaux_effectues?: string | null
          type_rapport?: string | null
          updated_at?: string | null
          visite_data?: Json | null
        }
        Update: {
          client_id?: string
          constat_general?: Json | null
          created_at?: string | null
          date_intervention?: string
          demande_client?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          id?: string
          installation_id?: string | null
          numero_cm?: string
          observations_visite?: string | null
          photos?: Json | null
          pieces_utilisees?: Json | null
          recommandations?: string | null
          signature_client?: string | null
          signature_data?: string | null
          site_id?: string
          statut?: string
          technicien?: string
          travaux_effectues?: string | null
          type_rapport?: string | null
          updated_at?: string | null
          visite_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rapports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          adresse: string | null
          client_id: string
          created_at: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_numero_cm: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
