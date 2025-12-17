import { useEffect, useState } from 'react';
import { getJson, postJson, deleteJson } from '@/lib/api';

export interface ChatListItem {
  _id: string;
  participants: Array<{ _id: string; name: string; avatar?: string; email: string }>;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSender?: { _id: string; name: string; avatar?: string };
  updatedAt: string;
  unreadCount?: number; // Added for tracking unread messages
}

export function useChatList() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await getJson('/chats');
      if (json && json.success) {
        setChats(json.data || []);
      } else {
        setError(json?.message || 'Failed to fetch chats');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const getOrCreateChat = async (participantId: string) => {
    try {
      const json = await getJson(`/chats/with/${participantId}`);
      if (json && json.success) {
        // Refresh chats list
        fetchChats();
        return json.data;
      } else {
        setError(json?.message || 'Failed to create chat');
        return null;
      }
    } catch (e: any) {
      setError(e.message || 'Error creating chat');
      return null;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const json = await deleteJson(`/chats/${chatId}`);
      if (json && json.success) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
      } else {
        setError(json?.message || 'Failed to delete chat');
      }
    } catch (e: any) {
      setError(e.message || 'Error deleting chat');
    }
  };

  return {
    chats,
    loading,
    error,
    fetchChats,
    getOrCreateChat,
    deleteChat,
  };
}
