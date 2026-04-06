// TODO: This should be dynamic from DB
// Types of ticket activity IDs
export enum TicketActivityType {
  Triage = 1,
  PrivateNote = 2,
  UserEmail = 3,
  ClientResponse = 4,
  Resolve = 5,
  Reassign = 6
}

// Interface for ticket activity record
export interface TicketActivityRecord {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Ticket Activity Type Provider class
export class TicketActivityTypeProvider {
  private static readonly activityTypes = new Map<TicketActivityType, string>([
    [TicketActivityType.Triage, 'Triage'],
    [TicketActivityType.PrivateNote, 'Private Note'],
    [TicketActivityType.UserEmail, 'User Email'],
    [TicketActivityType.ClientResponse, 'Client Response'],
    [TicketActivityType.Resolve, 'Resolve'],
    [TicketActivityType.Reassign, 'Reassignment']
  ]);

  // Get name for a specific activity type
  static getTypeName(type: TicketActivityType): string {
    return this.activityTypes.get(type) || 'Unknown';
  }

  // Create a new activity record
  static createRecord(type: TicketActivityType): TicketActivityRecord {
    const now = new Date().toISOString();
    return {
      id: type,
      name: this.getTypeName(type),
      created_at: now,
      updated_at: now,
    };
  }

  // Validate if an activity type exists
  static isValidType(type: TicketActivityType): boolean {
    return this.activityTypes.has(type);
  }
}
