/**
 * Utility functions for email form processing
 */

import { Task } from '@/types/tasks'

export interface EmailExtractionResult {
  toEmails: string[]
  ccEmails: string[]
  shouldShowCc: boolean
}

/**
 * Validates if a string is a valid email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extracts valid email addresses from a string using regex
 */
export const extractEmailsFromString = (emailString: string): string[] => {
  if (!emailString || typeof emailString !== 'string') {
    return []
  }
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  return emailString.match(emailRegex) || []
}

/**
 * Filters out help@yanceyworks.com from an array of email addresses
 */
export const filterHelpEmails = (emails: string[]): string[] => {
  return emails.filter(email => 
    !email.toLowerCase().includes('help@yanceyworks.com')
  )
}

/**
 * Extracts TO emails from the first activity only
 * Prioritizes "from" field if available, falls back to email_to
 * If no valid emails found in first activity, returns empty array (fallback handled in main function)
 */
export const extractToEmails = (activities: any[]): string[] => {
  let toEmails: string[] = []
  
  if (activities.length === 0) {
    console.log('[UtilsForm] No activities available for TO email extraction')
    return toEmails
  }
  
  const firstActivity = activities[activities.length - 1]
  console.log(`[UtilsForm] Checking first activity for TO emails:`, {
    activityId: firstActivity.id,
    activityType: firstActivity.activity_type?.name,
    hasFrom: !!firstActivity.from,
    hasEmailTo: !!firstActivity.email_to
  })
  
  // Check for "from" property first (but exclude help@yanceyworks.com)
  if (firstActivity.from && 
      typeof firstActivity.from === 'string' && 
      firstActivity.from.includes('@') && 
      !firstActivity.from.toLowerCase().includes('help@yanceyworks.com')) {
    toEmails = [firstActivity.from]
    console.log(`[UtilsForm] Found valid "from" field in first activity for TO:`, toEmails, firstActivity)
  } 
  // Fallback to email_to if no valid "from" or if "from" was help@yanceyworks.com
  else if (firstActivity.email_to) {
    const emailString = firstActivity.email_to.trim()
    if (emailString) {
      const extractedEmails = extractEmailsFromString(emailString)
      const filteredEmails = filterHelpEmails(extractedEmails)
      
      if (filteredEmails.length > 0) {
        toEmails = filteredEmails
        console.log(`[UtilsForm] Found valid email_to in first activity for TO:`, {
          originalString: emailString,
          extractedEmails,
          filteredEmails: toEmails
        })
      }
    }
  }
  
  if (toEmails.length === 0) {
    console.log('[UtilsForm] No valid TO emails found in first activity')
  }
  
  return toEmails
}

/**
 * Extracts CC emails from the first activity only
 * Handles both string and array formats
 * If no valid emails found in first activity, returns empty array (fallback handled in main function)
 */
export const extractCcEmails = (activities: any[]): string[] => {
  let ccEmails: string[] = []
  
  if (activities.length === 0) {
    console.log('[UtilsForm] No activities available for CC email extraction')
    return ccEmails
  }
  
  const firstActivity = activities[activities.length - 1]
  
  if (!firstActivity.email_cc) {
    console.log('[UtilsForm] First activity has no email_cc field')
    return ccEmails
  }
  
  console.log(`[UtilsForm] Checking first activity for CC emails:`, {
    activityId: firstActivity.id,
    activityType: firstActivity.activity_type?.name,
    hasEmailCc: !!firstActivity.email_cc,
    emailCcType: typeof firstActivity.email_cc
  })
  
  // Handle string format
  if (typeof firstActivity.email_cc === 'string' && firstActivity.email_cc.trim() !== '') {
    const extractedEmails = extractEmailsFromString(firstActivity.email_cc.trim())
    const filteredCcEmails = filterHelpEmails(extractedEmails)
    
    if (filteredCcEmails.length > 0) {
      ccEmails = filteredCcEmails
      console.log(`[UtilsForm] Found valid CC emails from string in first activity:`, {
        originalString: firstActivity.email_cc,
        extractedEmails,
        filteredEmails: filteredCcEmails
      })
    }
  }
  
  // Handle array format (runtime type assertion)
  if (Array.isArray(firstActivity.email_cc) && firstActivity.email_cc.length > 0) {
    const validEmails = firstActivity.email_cc.filter((email: unknown) => 
      typeof email === 'string' && 
      validateEmail(email) && 
      !email.toLowerCase().includes('help@yanceyworks.com')
    )
    
    if (validEmails.length > 0) {
      ccEmails = validEmails
      console.log(`[UtilsForm] Found valid CC emails from array in first activity:`, validEmails)
    }
  }
  
  if (ccEmails.length === 0) {
    console.log('[UtilsForm] No valid CC emails found in first activity')
  }
  
  return ccEmails
}

/**
 * Main function to extract emails from task activities for form initialization
 * Extracts CC and TO emails from the first activity only
 * Falls back to task.user.email if no emails found in first activity
 * Returns both TO and CC emails along with CC visibility flag
 */
export const extractEmailsFromTask = (task: Task | null): EmailExtractionResult => {
  const result: EmailExtractionResult = {
    toEmails: [],
    ccEmails: [],
    shouldShowCc: false
  }
  
  if (!task) {
    console.log('[UtilsForm] No task provided for email extraction')
    return result
  }
  
  console.log('[UtilsForm] Starting email extraction from task:', {
    taskId: task.id,
    hasActivities: !!task.activities,
    activitiesLength: task.activities?.length || 0,
    hasUser: !!task.user,
    userEmail: task.user?.email
  })
  
  // Try to extract emails from first activity if activities exist
  if (task.activities && task.activities.length > 0) {
    console.log('[UtilsForm] Extracting emails from first activity:', {
      firstActivityId: task.activities[0]?.id,
      firstActivityType: task.activities[0]?.activity_type?.name,
      firstActivityCreatedAt: task.activities[0]?.created_at
    })
    
    // Extract TO emails from first activity only
    result.toEmails = extractToEmails(task.activities)
    
    // Extract CC emails from first activity only
    result.ccEmails = extractCcEmails(task.activities)
  } else {
    console.log('[UtilsForm] No activities found, will use fallback')
  }
  
  // Fallback to task.user.email if no TO emails found in first activity
  if (result.toEmails.length === 0 && task.user?.email) {
    if (validateEmail(task.user.email) && !task.user.email.toLowerCase().includes('help@yanceyworks.com')) {
      result.toEmails = [task.user.email]
      console.log('[UtilsForm] Using task.user.email as fallback for TO emails:', result.toEmails)
    } else {
      console.log('[UtilsForm] task.user.email is invalid or help@yanceyworks.com, not using as fallback:', task.user.email)
    }
  }
  
  result.shouldShowCc = result.ccEmails.length > 0
  
  console.log('[UtilsForm] Final email extraction result:', {
    toEmails: result.toEmails,
    ccEmails: result.ccEmails,
    shouldShowCc: result.shouldShowCc
  })
  
  return result
}
