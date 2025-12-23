import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useToast } from '../hooks/use-toast';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
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
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Connect to real-time service if not already connected
    if (!realtimeService.isConnected()) {
      realtimeService.connect();
    }

    // Load historical notifications for signed-in user
    (async () => {
      try {
        if (currentUser && currentUser.id) {
          // Use full backend URL and include credentials + Authorization fallback
          const headers: any = { 'Content-Type': 'application/json' };
          const token = getAuthToken();
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${API_BASE_URL}/notifications`, { credentials: 'include', headers });
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

    // Subscribe to all relevant events
    const handleEvent = (data: any, type: Notification['type']) => {
      // If the notification is targeted to a recipient, only show it to that user
      if (data.recipientId && currentUser && data.recipientId !== currentUser.id) {
        return;
      }

      // Don't notify if the actor is the current user (e.g. liked their own post)
      if (data.actor?.id === currentUser?.id) {
        return;
      }

      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type,
        message: data.message || getMessageForType(type, data),
        actor: data.actor,
        targetBlog: data.targetBlog,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Show toast
      toast({
        title: getTitleForType(type),
        description: notification.message,
        duration: 5000,
      });

      // Show system notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(getTitleForType(type), {
            body: notification.message,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.error('Failed to show system notification:', e);
        }
      }
    };

    const unsubNotif = realtimeService.on('notification:new', (data) => handleEvent(data, data.type || 'like'));
    const unsubLike = realtimeService.on('like:added', (data) => handleEvent(data, 'like'));
    const unsubComment = realtimeService.on('comment:added', (data) => handleEvent(data, 'comment'));
    const unsubFollow = realtimeService.on('follow:added', (data) => handleEvent(data, 'follow'));

    // Helper to generate messages if backend doesn't send one
    const getMessageForType = (type: string, data: any) => {
      const actorName = data.actor?.name || 'Someone';
      const blogTitle = data.targetBlog?.title || 'your blog';
      switch (type) {
        case 'like': return `${actorName} liked "${blogTitle}"`;
        case 'comment': return `${actorName} commented on "${blogTitle}"`;
        case 'follow': return `${actorName} started following you`;
        default: return 'New notification';
      }
    };

    const getTitleForType = (type: string) => {
      switch (type) {
        case 'like': return 'New Like ❤️';
        case 'comment': return 'New Comment 💬';
        case 'follow': return 'New Follower 👥';
        default: return 'Notification 🔔';
      }
    };

    return () => {
      unsubNotif();
      unsubLike();
      unsubComment();
      unsubFollow();
    };
  }, [toast, currentUser]);

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
