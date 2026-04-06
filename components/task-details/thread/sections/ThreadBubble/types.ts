export interface ImageDialogState {
  open: boolean
  src: string
  alt: string
}

export interface ActivityData {
  id: number
  content: string
  date_start: string
  date_end: string
  time_elapse: number | null
  from?: string
  agent: {
    id: number
    first_name: string
    last_name: string
  }
  activity_type: {
    id: number
    name: string
  }
  status?: {
    name: string
  }
  files?: any[]
}

export interface ClientDisplayInfo {
  name: string
  initials: string
}
