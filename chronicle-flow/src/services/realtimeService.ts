/**
 * Real-time event service using Server-Sent Events (SSE)
 * Enables instant updates to blogs, likes, comments without page refresh
 */

export type EventType = 
  | 'blog:created' 
  | 'blog:updated' 
  | 'blog:deleted' 
  | 'like:added' 
  | 'comment:added' 
  | 'follow:added'
  | 'notification:new'
  | 'message:sent'
  | 'message:read'
  | 'typing:start'
  | 'typing:stop';

export interface RealtimeEvent {
  type: EventType;
  data: any;
  timestamp: string;
}

class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<EventType, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Connect to real-time events
   */
  connect() {
    if (this.eventSource) {
      return; // Already connected
    }

    try {
      // Connect to SSE endpoint on backend
      this.eventSource = new EventSource(
        'http://localhost:5000/api/events/stream',
        { withCredentials: true }
      );

      this.eventSource.onopen = () => {
        console.log('✅ Real-time connection established');
        this.reconnectAttempts = 0;
      };

      this.eventSource.addEventListener('message', (event) => {
        try {
          const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
          this.emit(realtimeEvent.type, realtimeEvent.data);
        } catch (error) {
          console.error('Failed to parse real-time event:', error);
        }
      });

      this.eventSource.onerror = () => {
        console.error('❌ Real-time connection error');
        this.disconnect();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from real-time events
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`🔄 Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: EventType, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(eventType: EventType, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Auto-connect on import
if (typeof window !== 'undefined') {
  realtimeService.connect();
}
