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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advisor_credits: {
        Row: {
          advisor_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          advisor_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      credit_txns: {
        Row: {
          advisor_id: string
          amount: number
          created_at: string
          description: string
          id: string
        }
        Insert: {
          advisor_id: string
          amount: number
          created_at?: string
          description: string
          id?: string
        }
        Update: {
          advisor_id?: string
          amount?: number
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      expert_contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          phone: string
          scenario_code: string | null
          scenario_id: string | null
          scenario_snapshot: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          phone: string
          scenario_code?: string | null
          scenario_id?: string | null
          scenario_snapshot?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          phone?: string
          scenario_code?: string | null
          scenario_id?: string | null
          scenario_snapshot?: Json | null
        }
        Relationships: []
      }
      nda_signatures: {
        Row: {
          agreement_version: string
          email: string
          full_name: string
          id: string
          ip_address: string | null
          pdf_path: string
          signed_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          agreement_version?: string
          email: string
          full_name: string
          id?: string
          ip_address?: string | null
          pdf_path: string
          signed_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          agreement_version?: string
          email?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          pdf_path?: string
          signed_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          npn_number: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          npn_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          npn_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scenario_lookup_attempts: {
        Row: {
          advisor_id: string
          code_attempted: string
          created_at: string
          id: string
          succeeded: boolean
        }
        Insert: {
          advisor_id: string
          code_attempted: string
          created_at?: string
          id?: string
          succeeded: boolean
        }
        Update: {
          advisor_id?: string
          code_attempted?: string
          created_at?: string
          id?: string
          succeeded?: boolean
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          agent_notes: string | null
          assigned_agent_id: string | null
          birth_year: number
          claimed_at: string | null
          claimed_by: string | null
          conditions: Json
          cost_preference: string
          created_at: string
          created_by: string | null
          expires_at: string
          gender: string | null
          id: string
          income_band: string | null
          medications: Json
          preferences: Json
          scenario_code: string
          tobacco: boolean
          wants_contact: boolean
          zip3: string
        }
        Insert: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          birth_year: number
          claimed_at?: string | null
          claimed_by?: string | null
          conditions?: Json
          cost_preference?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          gender?: string | null
          id?: string
          income_band?: string | null
          medications?: Json
          preferences?: Json
          scenario_code: string
          tobacco?: boolean
          wants_contact?: boolean
          zip3: string
        }
        Update: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          birth_year?: number
          claimed_at?: string | null
          claimed_by?: string | null
          conditions?: Json
          cost_preference?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          gender?: string | null
          id?: string
          income_band?: string | null
          medications?: Json
          preferences?: Json
          scenario_code?: string
          tobacco?: boolean
          wants_contact?: boolean
          zip3?: string
        }
        Relationships: []
      }
      soas: {
        Row: {
          advisor_id: string
          id: string
          plan_type: string | null
          scenario_id: string
          signed_at: string
          status: string
        }
        Insert: {
          advisor_id: string
          id?: string
          plan_type?: string | null
          scenario_id: string
          signed_at?: string
          status?: string
        }
        Update: {
          advisor_id?: string
          id?: string
          plan_type?: string | null
          scenario_id?: string
          signed_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "soas_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_credits: {
        Args: { p_amount: number; p_description: string; p_target: string }
        Returns: number
      }
      admin_assign_agent: {
        Args: { p_agent: string; p_scenario: string }
        Returns: undefined
      }
      admin_set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      agent_update_notes: {
        Args: { p_notes: string; p_scenario: string }
        Returns: undefined
      }
      create_scenario: {
        Args: {
          p_birth_year: number
          p_conditions: Json
          p_cost_preference: string
          p_gender: string
          p_income_band: string
          p_medications: Json
          p_preferences: Json
          p_tobacco: boolean
          p_zip3: string
        }
        Returns: string
      }
      deduct_credit: { Args: { p_description: string }; Returns: number }
      gen_scenario_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: { p_action: string; p_metadata: Json }
        Returns: undefined
      }
      lookup_scenario: {
        Args: { p_code: string }
        Returns: {
          agent_notes: string | null
          assigned_agent_id: string | null
          birth_year: number
          claimed_at: string | null
          claimed_by: string | null
          conditions: Json
          cost_preference: string
          created_at: string
          created_by: string | null
          expires_at: string
          gender: string | null
          id: string
          income_band: string | null
          medications: Json
          preferences: Json
          scenario_code: string
          tobacco: boolean
          wants_contact: boolean
          zip3: string
        }
        SetofOptions: {
          from: "*"
          to: "scenarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_scenarios: {
        Args: never
        Returns: {
          agent_notes: string | null
          assigned_agent_id: string | null
          birth_year: number
          claimed_at: string | null
          claimed_by: string | null
          conditions: Json
          cost_preference: string
          created_at: string
          created_by: string | null
          expires_at: string
          gender: string | null
          id: string
          income_band: string | null
          medications: Json
          preferences: Json
          scenario_code: string
          tobacco: boolean
          wants_contact: boolean
          zip3: string
        }[]
        SetofOptions: {
          from: "*"
          to: "scenarios"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      purchase_credits: {
        Args: { p_amount: number; p_description: string }
        Returns: number
      }
      update_scenario: {
        Args: {
          p_birth_year: number
          p_conditions: Json
          p_cost_preference: string
          p_gender: string
          p_income_band: string
          p_medications: Json
          p_preferences: Json
          p_scenario_id: string
          p_tobacco: boolean
          p_zip3: string
        }
        Returns: {
          agent_notes: string | null
          assigned_agent_id: string | null
          birth_year: number
          claimed_at: string | null
          claimed_by: string | null
          conditions: Json
          cost_preference: string
          created_at: string
          created_by: string | null
          expires_at: string
          gender: string | null
          id: string
          income_band: string | null
          medications: Json
          preferences: Json
          scenario_code: string
          tobacco: boolean
          wants_contact: boolean
          zip3: string
        }
        SetofOptions: {
          from: "*"
          to: "scenarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "client"
        | "advisor"
        | "admin"
        | "viewer"
        | "editor"
        | "qa"
        | "agent"
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
    Enums: {
      app_role: [
        "client",
        "advisor",
        "admin",
        "viewer",
        "editor",
        "qa",
        "agent",
      ],
    },
  },
} as const
