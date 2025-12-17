import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useToast } from '../hooks/use-toast';
import { useUser } from './UserContext';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share';
  message: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  targetBlog?: {
    id: string;
    title: string;
  };
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  useEffect(() => {
    // Connect to real-time service if not already connected
    if (!realtimeService.isConnected()) {
      realtimeService.connect();
    }

    // Load historical notifications for signed-in user
    (async () => {
      try {
        if (currentUser && currentUser.id) {
          const res = await fetch('/api/notifications', { credentials: 'include' });
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              const mapped = json.data.map((n: any) => ({
                id: n._id,
                type: n.type,
                message: n.message,
                actor: n.actor || { id: n.actor?.id, name: n.actor?.name, avatar: n.actor?.avatar },
                targetBlog: n.targetBlog,
                timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
                read: !!n.read,
              }));
              setNotifications(mapped);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    })();

    // Subscribe to notification events using the service's `on` API
    const unsubscribe = realtimeService.on('notification:new', (data: any) => {
      // If the notification is targeted to a recipient, only show it to that user
      if (data.recipientId && currentUser && data.recipientId !== currentUser.id) {
        return;
      }
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: data.type || 'like',
        message: data.message,
        actor: data.actor,
        targetBlog: data.targetBlog,
        timestamp: new Date(data.timestamp),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Show toast for new notification
      toast({
        title: `New ${data.type}!`,
        description: data.message,
        duration: 5000,
      });
    });

    return () => {
      // Cleanup subscription
      unsubscribe();
    };
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // Update backend
    (async () => {
      try {
        await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
      } catch (e) {
        console.error('Failed to mark notification read on server:', e);
      }
    })();
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    (async () => {
      try {
        await fetch(`/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
      } catch (e) {
        console.error('Failed to delete notification on server:', e);
      }
    })();
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
