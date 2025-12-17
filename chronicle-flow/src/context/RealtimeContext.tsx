import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeService, EventType } from '../services/realtimeService';
import { realtimeConfig } from '@/config/realtimeConfig';

interface RealtimeContextType {
  connected: boolean;
  lastEvent: { type: EventType; data: any; timestamp: string } | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: EventType; data: any; timestamp: string } | null>(null);

  useEffect(() => {
    // Listen to all event types to track connection
    const unsubscribers: (() => void)[] = [];

    const eventTypes: EventType[] = [
      'blog:created',
      'blog:updated',
      'blog:deleted',
      'like:added',
      'comment:added',
      'follow:added',
      'message:sent',
      'message:read',
      'typing:start',
      'typing:stop',
    ];

    eventTypes.forEach((eventType) => {
      const unsubscribe = realtimeService.on(eventType, (data) => {
        setLastEvent({
          type: eventType,
          data,
          timestamp: new Date().toISOString(),
        });
        // Connection is active when we receive events
        setConnected(true);
      });
      unsubscribers.push(unsubscribe);
    });

    // Initialize connection status immediately
    setConnected(realtimeService.isConnected());

    // Always poll the connection status for reliable updates
    const interval = window.setInterval(() => {
      const isConnected = realtimeService.isConnected();
      setConnected(isConnected);
    }, 500);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      window.clearInterval(interval);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ connected, lastEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}
