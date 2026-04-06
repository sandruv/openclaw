/**
 * Socket.io helper utilities for server-side event emission
 * These functions provide a consistent interface for emitting events across the application
 */

type EventData = Record<string, any>;

/**
 * Emit an event to all connected clients
 * @param event The event name
 * @param data The data to send with the event
 * @returns boolean indicating if the event was emitted
 */
export function emitToAll(event: string, data: EventData): boolean {
    if (!global.io) {
        console.warn(`[Socket] Cannot emit '${event}' event: Socket.io instance not available`);
        return false;
    }
    
    try {
        // Add timestamp if not present
        const enrichedData = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
        };
        
        global.io.emit(event, enrichedData);
        return true;
    } catch (error) {
        console.error(`[Socket] Error emitting '${event}' event:`, error);
        return false;
    }
}

/**
 * Emit an event to all clients except the one with the specified socket ID
 * @param socketId The socket ID to exclude
 * @param event The event name
 * @param data The data to send with the event
 * @returns boolean indicating if the event was emitted
 */
export function emitToOthers(socketId: string, event: string, data: EventData): boolean {
    if (!global.io) {
        console.warn(`[Socket] Cannot emit '${event}' event: Socket.io instance not available`);
        return false;
    }
    
    if (!socketId) {
        console.warn(`[Socket] Invalid socketId for emitToOthers: ${socketId}`);
        return emitToAll(event, data); // Fallback to emitting to all
    }
    
    try {
        // Add timestamp if not present
        const enrichedData = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
        };
        
        global.io.except(socketId).emit(event, enrichedData);
        return true;
    } catch (error) {
        console.error(`[Socket] Error emitting '${event}' event to others:`, error);
        return false;
    }
}

/**
 * Emit an event to all clients in a specific room
 * @param room The room name
 * @param event The event name
 * @param data The data to send with the event
 * @returns boolean indicating if the event was emitted
 */
export function emitToRoom(room: string, event: string, data: EventData): boolean {
    if (!global.io) {
        console.warn(`[Socket] Cannot emit '${event}' event to room '${room}': Socket.io instance not available`);
        return false;
    }
    
    if (!room) {
        console.warn(`[Socket] Invalid room for emitToRoom: ${room}`);
        return false;
    }
    
    try {
        // Add timestamp if not present
        const enrichedData = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
        };
        
        global.io.to(room).emit(event, enrichedData);
        return true;
    } catch (error) {
        console.error(`[Socket] Error emitting '${event}' event to room '${room}':`, error);
        return false;
    }
}