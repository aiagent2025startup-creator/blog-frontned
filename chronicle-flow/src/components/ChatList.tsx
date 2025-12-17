import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useChatList, ChatListItem } from '@/hooks/useChatList';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
  onStartNewChat?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId, onStartNewChat }) => {
  const { chats, loading, error, deleteChat } = useChatList();
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => p.name); // Any participant
    return otherUser?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border-r">
      {/* Header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Chats</h2>
          {onStartNewChat && (
            <Button variant="ghost" size="icon" onClick={onStartNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div>
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {chats.length === 0 ? 'No chats yet. Start a new conversation!' : 'No matching chats.'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={selectedChatId === chat._id}
                onSelect={() => onSelectChat(chat._id)}
                onDelete={() => deleteChat(chat._id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ChatListItemProps {
  chat: ChatListItem;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isSelected, onSelect, onDelete }) => {
  const otherUser = chat.participants[0];

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 cursor-pointer border-b transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <Avatar>
        <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
        <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{otherUser?.name}</h3>
          {chat.unreadCount && chat.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || 'No messages yet'}</p>
        {chat.lastMessageTime && (
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
          </p>
        )}
      </div>

      {isSelected && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this chat?')) {
              onDelete();
            }
          }}
        >
          Delete
        </Button>
      )}
    </div>
  );
};
