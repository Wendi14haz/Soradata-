export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          file_preview: Json | null
          id: string
          is_user: boolean
          session_id: string
          visualization_data: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          file_preview?: Json | null
          id?: string
          is_user?: boolean
          session_id: string
          visualization_data?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          file_preview?: Json | null
          id?: string
          is_user?: boolean
          session_id?: string
          visualization_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_sessions: {
        Row: {
          created_at: string | null
          created_by: string
          file_id: string
          id: string
          is_active: boolean | null
          session_name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          file_id: string
          id?: string
          is_active?: boolean | null
          session_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          file_id?: string
          id?: string
          is_active?: boolean | null
          session_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_sessions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_prompts: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          prompt_text: string
          title: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt_text: string
          title: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt_text?: string
          title?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      data_analyses: {
        Row: {
          ai_response: string | null
          analysis_prompt: string
          created_at: string | null
          file_id: string | null
          id: string
          insights_json: Json | null
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          analysis_prompt: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          insights_json?: Json | null
          user_id: string
        }
        Update: {
          ai_response?: string | null
          analysis_prompt?: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          insights_json?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_analyses_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_reports: {
        Row: {
          created_at: string
          file_id: string
          id: string
          issues_found: number
          quality_score: number
          total_checks: number
          updated_at: string
          user_id: string
          validation_results: Json
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          issues_found?: number
          quality_score?: number
          total_checks?: number
          updated_at?: string
          user_id: string
          validation_results: Json
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          issues_found?: number
          quality_score?: number
          total_checks?: number
          updated_at?: string
          user_id?: string
          validation_results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_reports_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          subscription_plan: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          subscription_plan?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          cursor_position: Json | null
          id: string
          is_online: boolean | null
          joined_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          cursor_position?: Json | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          cursor_position?: Json | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_projects: {
        Row: {
          file_id: string
          id: string
          owner_id: string
          permissions: string | null
          shared_at: string | null
          shared_with_id: string
        }
        Insert: {
          file_id: string
          id?: string
          owner_id: string
          permissions?: string | null
          shared_at?: string | null
          shared_with_id: string
        }
        Update: {
          file_id?: string
          id?: string
          owner_id?: string
          permissions?: string | null
          shared_at?: string | null
          shared_with_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_projects_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
        ]
      }
      user_files: {
        Row: {
          column_count: number | null
          file_metadata: Json | null
          file_size: number
          file_type: string
          filename: string
          id: string
          original_filename: string
          processed: boolean | null
          row_count: number | null
          storage_path: string
          upload_date: string | null
          user_id: string
        }
        Insert: {
          column_count?: number | null
          file_metadata?: Json | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          original_filename: string
          processed?: boolean | null
          row_count?: number | null
          storage_path: string
          upload_date?: string | null
          user_id: string
        }
        Update: {
          column_count?: number | null
          file_metadata?: Json | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          original_filename?: string
          processed?: boolean | null
          row_count?: number | null
          storage_path?: string
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      validation_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          rule_config: Json
          rule_name: string
          rule_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_config: Json
          rule_name: string
          rule_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_config?: Json
          rule_name?: string
          rule_type?: string
          user_id?: string
        }
        Relationships: []
      }
      visualizations: {
        Row: {
          analysis_id: string
          chart_config: Json
          chart_type: string
          created_at: string | null
          id: string
          title: string | null
        }
        Insert: {
          analysis_id: string
          chart_config: Json
          chart_type: string
          created_at?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          analysis_id?: string
          chart_config?: Json
          chart_type?: string
          created_at?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visualizations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "data_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_report_data: {
        Args: { p_analysis_id: string }
        Returns: {
          analysis_data: Json
          file_data: Json
          visualizations_data: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
