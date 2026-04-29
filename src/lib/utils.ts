import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}

export function getMediaUrl(path: string | null) {
  if (!path) return null
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return `${baseUrl}/storage/v1/object/public/media-uploads/${path}`
}
