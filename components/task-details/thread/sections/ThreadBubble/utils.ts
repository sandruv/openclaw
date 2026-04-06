import { TicketActivityType } from "@/lib/ticketTypeIdProvider"
import { getInitials } from "@/lib/utils"
import { ActivityData, ClientDisplayInfo } from "./types"

// Helper function to determine if an activity is from a client
export const isClientMessage = (activity: ActivityData, taskUserEmail?: string) => {    
  // Check if activity type ID is ClientResponse (4)
  if (activity.activity_type.id === TicketActivityType.ClientResponse) {
    return true
  }
  
  // Check if the 'from' field matches the task user's email (most accurate method)
  // Trim and normalize both emails for comparison
  if (activity.from && taskUserEmail && typeof activity.from === 'string') {
    const normalizedFrom = activity.from.trim().toLowerCase()
    const normalizedTaskEmail = taskUserEmail.trim().toLowerCase()
    if (normalizedFrom === normalizedTaskEmail) {
      return true
    }
  }
  
  // Fallback: Check if the 'from' field contains a non-yanceyworks email
  if (activity.from && typeof activity.from === 'string') {
    const normalizedFrom = activity.from.trim().toLowerCase()
    if (normalizedFrom.includes('@') && !normalizedFrom.includes('yanceyworks.com')) {
      return true
    }
  }

  return false
}

// Helper function to get client display info
export const getClientDisplayInfo = (
  activity: ActivityData, 
  taskUserEmail?: string,
  taskUserFirstName?: string,
  taskUserLastName?: string
): ClientDisplayInfo | null => {
  if (!isClientMessage(activity, taskUserEmail)) return null
  
  // If we have task user info and the from field matches, use the user's name
  // Trim and normalize both emails for comparison
  if (activity.from && taskUserEmail && typeof activity.from === 'string') {
    const normalizedFrom = activity.from.trim().toLowerCase()
    const normalizedTaskEmail = taskUserEmail.trim().toLowerCase()
    if (normalizedFrom === normalizedTaskEmail) {
      return {
        name: taskUserFirstName ? `${taskUserFirstName}` : 'Client',
        initials: taskUserFirstName ? getInitials(`${taskUserFirstName} ${taskUserLastName || ''}`) : 'C'
      }
    }
  }
  
  // Fallback to generic client info
  return {
    name: 'Client',
    initials: 'C'
  }
}

// Helper function to determine if we should use Next.js Image or regular img
export const shouldUseNextImage = (src: string) => {
  if (!src) return false
  // Use regular img for CID references (email attachments)
  if (src.startsWith('cid:')) return false
  // Use regular img for data URLs (base64 images)
  if (src.startsWith('data:')) return false
  // Use Next.js Image for HTTP/HTTPS URLs
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}
