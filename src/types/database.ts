export type UserRole = 'admin' | 'creator' | 'approver'

export type CardStatus =
  | 'draft'
  | 'awaiting_approval'
  | 'approved_with_reservations'
  | 'rejected'
  | 'approved'
  | 'published'

export type MediaType = 'image' | 'video'

export type ReservationType = 'caption' | 'media' | 'both'

export type InstagramFormat = 'feed' | 'story' | 'reels'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      media_cards: {
        Row: MediaCard
        Insert: MediaCardInsert
        Update: Partial<MediaCardInsert>
      }
      media_versions: {
        Row: MediaVersion
        Insert: MediaVersionInsert
        Update: Partial<MediaVersionInsert>
      }
      audit_logs: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: never
      }
      invites: {
        Row: Invite
        Insert: InviteInsert
        Update: Partial<InviteInsert>
      }
    }
  }
}

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export type ProfileInsert = Omit<Profile, 'created_at'>

export interface MediaCard {
  id: string
  creator_id: string
  title: string
  caption: string
  tags: string[]
  tagged_accounts: string[]
  suggested_at: string | null
  status: CardStatus
  reservation_type: ReservationType | null
  reservation_comment: string | null
  created_at: string
  updated_at: string
}

export type MediaCardInsert = Omit<MediaCard, 'id' | 'created_at' | 'updated_at'>

export interface MediaVersion {
  id: string
  card_id: string
  storage_path: string
  media_type: MediaType
  version_number: number
  created_at: string
}

export type MediaVersionInsert = Omit<MediaVersion, 'id' | 'created_at'>

export interface AuditLog {
  id: string
  card_id: string
  user_id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>

export interface Invite {
  id: string
  email: string
  role: UserRole
  token: string
  invited_by: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export type InviteInsert = Omit<Invite, 'id' | 'created_at'>
