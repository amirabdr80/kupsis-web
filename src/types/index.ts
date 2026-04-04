export interface PastActivity {
  id: string
  name: string
  description?: string
  date?: string
  time?: string
  place?: string
  participants?: string
  cost?: string
  organiser?: string
  status?: string
  sort_order?: number
  created_at?: string
}

export interface FutureActivity {
  id: string
  name: string
  description?: string
  date?: string
  time?: string
  place?: string
  participants?: string
  cost?: string
  organiser?: string
  status?: string
  sort_order?: number
  created_at?: string
}

export interface PhotoGroup {
  id: string
  name: string
  description?: string
  date?: string
  cover_url?: string
  sort_order?: number
  photos?: Photo[]
  created_at?: string
}

export interface Photo {
  id: string
  group_id: string
  url: string
  caption?: string
  sort_order?: number
}

export interface CalendarOverride {
  date: string
  pb: boolean
  ot: boolean
  lw: boolean
  cuti: boolean
}

export interface Donation {
  id: string
  donor_name?: string
  amount: number
  date?: string
  note?: string
  created_at?: string
}
