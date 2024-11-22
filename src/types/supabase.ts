export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          identity_number: string
          phone: string
          type: 'individual' | 'corporate'
          assigned_user_id: string | null
          documents: Json | null
          notes: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          identity_number: string
          phone: string
          type: 'individual' | 'corporate'
          assigned_user_id?: string | null
          documents?: Json | null
          notes?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          identity_number?: string
          phone?: string
          type?: 'individual' | 'corporate'
          assigned_user_id?: string | null
          documents?: Json | null
          notes?: Json | null
        }
      }
      vehicles: {
        Row: {
          id: string
          created_at: string
          plate: string
          brand: string
          model: string
          year: string
          chassis_number: string
          customer_id: string
          inspection_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          plate: string
          brand: string
          model: string
          year: string
          chassis_number: string
          customer_id: string
          inspection_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          plate?: string
          brand?: string
          model?: string
          year?: string
          chassis_number?: string
          customer_id?: string
          inspection_date?: string | null
        }
      }
      policies: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          vehicle_id: string
          start_date: string
          end_date: string
          price: number
          type: 'traffic' | 'comprehensive'
          policy_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          vehicle_id: string
          start_date: string
          end_date: string
          price: number
          type: 'traffic' | 'comprehensive'
          policy_number: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          vehicle_id?: string
          start_date?: string
          end_date?: string
          price?: number
          type?: 'traffic' | 'comprehensive'
          policy_number?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          role: 'admin' | 'employee' | 'customer' | 'pending'
          name: string | null
          assigned_customer_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          role: 'admin' | 'employee' | 'customer' | 'pending'
          name?: string | null
          assigned_customer_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          role?: 'admin' | 'employee' | 'customer' | 'pending'
          name?: string | null
          assigned_customer_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}