import { useEffect, useState } from 'react';
import { realtimeService } from '@/services/realtimeService';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Chat {
  _id: string;
  participants: ChatUser[];
  messages: ChatMessage[];
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSender?: { _id: string; name: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export function useChat(chatId: string | null) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!chatId) return;

    const fetchChat = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setChat(json.data);
        } else {
          setError(json.message || 'Failed to fetch chat');
        }
      } catch (e: any) {
        setError(e.message || 'Error fetching chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    // Listen to incoming messages in real-time
    const unsubscribe = realtimeService.on('message:sent', (data: any) => {
      if (data.chatId === chatId) {
        // Show toast notification for new message
        toast({
          title: `Message from ${data.sender.name}`,
          description: data.content,
          duration: 5000,
        });

        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                _id: data.messageId,
                sender: {
                  _id: data.sender.id,
                  name: data.sender.name,
                  avatar: data.sender.avatar,
                },
                content: data.content,
                read: false,
                createdAt: data.timestamp,
              },
            ],
            lastMessage: data.content,
            lastMessageTime: data.timestamp,
            lastMessageSender: { _id: data.sender.id, name: data.sender.name, avatar: data.sender.avatar },
          };
        });
      }
    });

    // Listen to read receipts
    const unsubscribeRead = realtimeService.on('message:read', (data: any) => {
      if (data.chatId === chatId) {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg._id === data.messageId ? { ...msg, read: true, readAt: data.timestamp } : msg
            ),
          };
        });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeRead();
    };
  }, [chatId]);

  const sendMessage = async (content: string) => {
    if (!chatId || !content.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (json.success) {
        // Optimistically update UI (message already in DB)
        return json.data;
      } else {
        setError(json.message || 'Failed to send message');
        return null;
      }
    } catch (e: any) {
      setError(e.message || 'Error sending message');
      return null;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!chatId) return;

    try {
      await fetch(`http://localhost:5000/api/chats/${chatId}/messages/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Error marking message as read:', e);
    }
  };

  return {
    chat,
    loading,
    error,
    sendMessage,
    markAsRead,
  };
}
