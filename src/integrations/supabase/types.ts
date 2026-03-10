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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      domain_cutoffs: {
        Row: {
          cutoff_marks: number
          domain: string
          id: string
          updated_at: string
        }
        Insert: {
          cutoff_marks?: number
          domain: string
          id?: string
          updated_at?: string
        }
        Update: {
          cutoff_marks?: number
          domain?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          correct_count: number
          created_at: string
          disqualified: boolean
          disqualified_reason: string | null
          domain: string
          id: string
          questions_shown: Json
          score: number
          selected_answers: Json
          started_at: string
          status: string
          submitted_at: string | null
          total_marks: number
          user_id: string
          violations: number
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          disqualified?: boolean
          disqualified_reason?: string | null
          domain: string
          id?: string
          questions_shown?: Json
          score?: number
          selected_answers?: Json
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_marks?: number
          user_id: string
          violations?: number
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          disqualified?: boolean
          disqualified_reason?: string | null
          domain?: string
          id?: string
          questions_shown?: Json
          score?: number
          selected_answers?: Json
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_marks?: number
          user_id?: string
          violations?: number
          wrong_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          application_id: string
          city: string
          college_name: string
          course: string
          created_at: string
          crn: string
          email: string
          full_name: string
          has_attempted: boolean
          id: string
          phone: string
          selected_domain: string | null
          semester: string
          updated_at: string
          urn: string
          user_id: string
        }
        Insert: {
          application_id: string
          city: string
          college_name: string
          course: string
          created_at?: string
          crn: string
          email: string
          full_name: string
          has_attempted?: boolean
          id?: string
          phone: string
          selected_domain?: string | null
          semester: string
          updated_at?: string
          urn: string
          user_id: string
        }
        Update: {
          application_id?: string
          city?: string
          college_name?: string
          course?: string
          created_at?: string
          crn?: string
          email?: string
          full_name?: string
          has_attempted?: boolean
          id?: string
          phone?: string
          selected_domain?: string | null
          semester?: string
          updated_at?: string
          urn?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string
          domain: string
          id: string
          options: Json
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: string
          domain: string
          id?: string
          options: Json
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string
          domain?: string
          id?: string
          options?: Json
          question_text?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      violation_logs: {
        Row: {
          created_at: string
          details: string | null
          exam_id: string
          id: string
          user_id: string
          violation_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          exam_id: string
          id?: string
          user_id: string
          violation_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          exam_id?: string
          id?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violation_logs_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
