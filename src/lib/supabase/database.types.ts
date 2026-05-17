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
          equipement_id: string | null
          heures_fonctionnement: number | null
          id: string
          nombre_cycles: number | null
          note_supplementaire: string | null
          page_number: number
          points_controle: Json
          points_erp: Json
          rapport_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipement_id?: string | null
          heures_fonctionnement?: number | null
          id?: string
          nombre_cycles?: number | null
          note_supplementaire?: string | null
          page_number?: number
          points_controle?: Json
          points_erp?: Json
          rapport_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipement_id?: string | null
          heures_fonctionnement?: number | null
          id?: string
          nombre_cycles?: number | null
          note_supplementaire?: string | null
          page_number?: number
          points_controle?: Json
          points_erp?: Json
          rapport_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controles_equipement_id_fkey"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements"
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
      dossiers: {
        Row: {
          client_id: string
          created_at: string
          date_cloture: string | null
          date_ouverture: string
          description: string | null
          id: string
          montant_total_ht: number | null
          notes: string | null
          reference: string
          site_id: string | null
          statut: string
          titre: string | null
          type_dossier: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_cloture?: string | null
          date_ouverture?: string
          description?: string | null
          id?: string
          montant_total_ht?: number | null
          notes?: string | null
          reference: string
          site_id?: string | null
          statut?: string
          titre?: string | null
          type_dossier?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_cloture?: string | null
          date_ouverture?: string
          description?: string | null
          id?: string
          montant_total_ht?: number | null
          notes?: string | null
          reference?: string
          site_id?: string | null
          statut?: string
          titre?: string | null
          type_dossier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossiers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      equipements: {
        Row: {
          annee_installation: number | null
          avec_batterie: boolean
          commentaire: string | null
          created_at: string
          date_mise_en_service: string | null
          id: string
          marque: string | null
          modele: string | null
          notes_techniques: string | null
          numero_serie: string | null
          repere: string
          site_id: string
          type_porte: string
          updated_at: string
        }
        Insert: {
          annee_installation?: number | null
          avec_batterie?: boolean
          commentaire?: string | null
          created_at?: string
          date_mise_en_service?: string | null
          id?: string
          marque?: string | null
          modele?: string | null
          notes_techniques?: string | null
          numero_serie?: string | null
          repere: string
          site_id: string
          type_porte?: string
          updated_at?: string
        }
        Update: {
          annee_installation?: number | null
          avec_batterie?: boolean
          commentaire?: string | null
          created_at?: string
          date_mise_en_service?: string | null
          id?: string
          marque?: string | null
          modele?: string | null
          notes_techniques?: string | null
          numero_serie?: string | null
          repere?: string
          site_id?: string
          type_porte?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipements_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      factures: {
        Row: {
          client_id: string
          created_at: string
          date_echeance: string | null
          date_facture: string
          dossier_id: string | null
          id: string
          lignes: Json
          montant_ht: number
          notes: string | null
          numero: string
          statut: string
          taux_tva: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          dossier_id?: string | null
          id?: string
          lignes?: Json
          montant_ht?: number
          notes?: string | null
          numero: string
          statut?: string
          taux_tva?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          dossier_id?: string | null
          id?: string
          lignes?: Json
          montant_ht?: number
          notes?: string | null
          numero?: string
          statut?: string
          taux_tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports: {
        Row: {
          archived_at: string | null
          client_id: string
          constat_general: Json | null
          created_at: string | null
          date_intervention: string
          date_signature: string | null
          demande_client: string | null
          description_probleme: string | null
          diagnostic: string | null
          dossier_id: string | null
          equipement_id: string | null
          id: string
          montant_ht: number | null
          nom_signataire_client: string | null
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
          archived_at?: string | null
          client_id: string
          constat_general?: Json | null
          created_at?: string | null
          date_intervention?: string
          date_signature?: string | null
          demande_client?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          dossier_id?: string | null
          equipement_id?: string | null
          id?: string
          montant_ht?: number | null
          nom_signataire_client?: string | null
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
          archived_at?: string | null
          client_id?: string
          constat_general?: Json | null
          created_at?: string | null
          date_intervention?: string
          date_signature?: string | null
          demande_client?: string | null
          description_probleme?: string | null
          diagnostic?: string | null
          dossier_id?: string | null
          equipement_id?: string | null
          id?: string
          montant_ht?: number | null
          nom_signataire_client?: string | null
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
            foreignKeyName: "rapports_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_equipement_id_fkey"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements"
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
      rdvs: {
        Row: {
          client_id: string
          created_at: string
          date_rdv: string
          dossier_id: string | null
          duree_minutes: number | null
          id: string
          notes: string | null
          site_id: string | null
          statut: string
          type_rdv: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_rdv: string
          dossier_id?: string | null
          duree_minutes?: number | null
          id?: string
          notes?: string | null
          site_id?: string | null
          statut?: string
          type_rdv?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_rdv?: string
          dossier_id?: string | null
          duree_minutes?: number | null
          id?: string
          notes?: string | null
          site_id?: string | null
          statut?: string
          type_rdv?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdvs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rdvs_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reglements: {
        Row: {
          created_at: string
          date_reglement: string
          facture_id: string
          id: string
          mode_paiement: string
          montant: number
          notes: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_reglement?: string
          facture_id: string
          id?: string
          mode_paiement?: string
          montant: number
          notes?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_reglement?: string
          facture_id?: string
          id?: string
          mode_paiement?: string
          montant?: number
          notes?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reglements_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
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
