// Timer configuration constants

/** How often to show desktop notification reminders (in minutes) */
export const NOTIFICATION_INTERVAL_MINUTES = 15

/** How often to show inactivity confirmation dialog (in minutes) */
export const INACTIVITY_CHECK_INTERVAL_MINUTES = 30

/** How long user has to respond to inactivity dialog before auto-stop (in seconds) */
export const INACTIVITY_TIMEOUT_SECONDS = 120

/** How often to play sound during inactivity dialog (in milliseconds) */
export const INACTIVITY_SOUND_INTERVAL_MS = 10000

// Sound file paths
export const SOUNDS = {
  /** Notification sound for periodic timer reminders */
  NOTIFICATION: '/sounds/notif1.mp3',
  /** Sound for inactivity confirmation dialog */
  INACTIVITY: '/sounds/notif2.mp3',
} as const

/** Default volume for notification sounds (0-1) */
export const NOTIFICATION_VOLUME = 0.8
