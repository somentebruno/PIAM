export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'creator' | 'approver'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'creator' | 'approver'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'creator' | 'approver'
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      media_cards: {
        Row: {
          id: string
          creator_id: string
          title: string
          caption: string
          tags: string[]
          tagged_accounts: string[]
          suggested_at: string | null
          status: 'draft' | 'awaiting_approval' | 'approved_with_reservations' | 'rejected' | 'approved' | 'published'
          reservation_type: 'caption' | 'media' | 'both' | null
          reservation_comment: string | null
          formats: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          caption?: string
          tags?: string[]
          tagged_accounts?: string[]
          suggested_at?: string | null
          status?: 'draft' | 'awaiting_approval' | 'approved_with_reservations' | 'rejected' | 'approved' | 'published'
          reservation_type?: 'caption' | 'media' | 'both' | null
          reservation_comment?: string | null
          formats?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          caption?: string
          tags?: string[]
          tagged_accounts?: string[]
          suggested_at?: string | null
          status?: 'draft' | 'awaiting_approval' | 'approved_with_reservations' | 'rejected' | 'approved' | 'published'
          reservation_type?: 'caption' | 'media' | 'both' | null
          reservation_comment?: string | null
          formats?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_versions: {
        Row: {
          id: string
          card_id: string
          storage_path: string
          media_type: 'image' | 'video'
          version_number: number
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          storage_path: string
          media_type: 'image' | 'video'
          version_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          storage_path?: string
          media_type?: 'image' | 'video'
          version_number?: number
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          card_id: string
          user_id: string
          action: string
          details: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          action: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          action?: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'creator' | 'approver'
          token: string
          invited_by: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'creator' | 'approver'
          token?: string
          invited_by: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'creator' | 'approver'
          token?: string
          invited_by?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'creator' | 'approver'
      card_status: 'draft' | 'awaiting_approval' | 'approved_with_reservations' | 'rejected' | 'approved' | 'published'
      media_type: 'image' | 'video'
      reservation_type: 'caption' | 'media' | 'both'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ---- Domain type aliases (derived from Database) ----

export type UserRole = Database['public']['Enums']['user_role']
export type CardStatus = Database['public']['Enums']['card_status']
export type MediaType = Database['public']['Enums']['media_type']
export type ReservationType = Database['public']['Enums']['reservation_type']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export type MediaCard = Database['public']['Tables']['media_cards']['Row']
export type MediaCardInsert = Database['public']['Tables']['media_cards']['Insert']

export type MediaVersion = Database['public']['Tables']['media_versions']['Row']
export type MediaVersionInsert = Database['public']['Tables']['media_versions']['Insert']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export type Invite = Database['public']['Tables']['invites']['Row']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']

export type InstagramFormat = 'feed' | 'story' | 'reels' | 'carousel'

export interface MediaItem {
  id: string
  version_id: string
  storage_path: string
  media_type: 'image' | 'video'
  order_index: number
}

// Estendendo o tipo gerado para incluir os itens do carrossel
export type MediaVersion = Database['public']['Tables']['media_versions']['Row'] & {
  items?: MediaItem[]
}
