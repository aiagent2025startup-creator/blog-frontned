import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Image, Loader2 } from 'lucide-react';
import { useChat, Chat } from '@/hooks/useChat';
import { useUser } from '@/context/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { realtimeService } from '@/services/realtimeService';

interface ChatWindowProps {
  chatId: string | null;
  onClose?: () => void;
  onDelete?: (chatId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onClose, onDelete }) => {
  const { chat, sendMessage, markAsRead, error, loading } = useChat(chatId);
  const { user: currentUser } = useUser();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Listen to typing indicators
  useEffect(() => {
    if (!chatId || !chat) return;

    const otherParticipantId = chat.participants.find(p => p._id !== currentUser?.id)?._id;
    if (!otherParticipantId) return;

    const handleTypingStart = (data: any) => {
      if (data.chatId === chatId && data.userId === otherParticipantId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data: any) => {
      if (data.chatId === chatId && data.userId === otherParticipantId) {
        setIsTyping(false);
      }
    };

    const unsubscribeStart = realtimeService.on('typing:start', handleTypingStart);
    const unsubscribeStop = realtimeService.on('typing:stop', handleTypingStop);

    return () => {
      unsubscribeStart();
      unsubscribeStop();
    };
  }, [chatId, chat, currentUser?.id]);

  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <p className="text-lg font-semibold">No chat selected</p>
          <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <p className="text-lg font-semibold">Chat not found</p>
          <p className="text-sm text-muted-foreground">{error || 'Unable to load the chat.'}</p>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants.find((p) => p._id !== currentUser?.id);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch(`http://localhost:5000/api/chats/${chatId}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.success && uploadData.imageUrl) {
        // Send image as a message with the image URL
        await sendMessage(`[IMAGE]${uploadData.imageUrl}`);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      // Emit typing stop event to backend
      const otherParticipantId = chat.participants.find(p => p._id !== currentUser?.id)?._id;
      if (otherParticipantId) {
        try {
          await fetch(`http://localhost:5000/api/chats/${chatId}/typing-stop`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (e) {
          console.error('Error sending typing stop:', e);
        }
      }
      
      await sendMessage(messageText);
      setMessageText('');
      
      // Clear typing timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(null);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessageText(text);

    // Emit typing events to backend
    if (text.length > 0) {
      try {
        fetch(`http://localhost:5000/api/chats/${chatId}/typing-start`, {
          method: 'POST',
          credentials: 'include',
        }).catch(e => console.error('Error sending typing start:', e));
      } catch (e) {
        console.error('Error in typing start:', e);
      }
    }

    // Clear existing timeout and set new one
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (text.length > 0) {
      const timeout = setTimeout(() => {
        try {
          fetch(`http://localhost:5000/api/chats/${chatId}/typing-stop`, {
            method: 'POST',
            credentials: 'include',
          }).catch(e => console.error('Error sending typing stop:', e));
        } catch (e) {
          console.error('Error in typing stop:', e);
        }
        setTypingTimeout(null);
      }, 2000); // Stop typing after 2 seconds of inactivity
      setTypingTimeout(timeout);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
            <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherParticipant?.name}</h2>
            <p className="text-xs text-muted-foreground">{otherParticipant?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm('Delete this chat?')) {
                  onDelete(chatId);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {chat.messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            chat.messages.map((msg) => {
              const isOwn = msg.sender._id === currentUser?.id || msg.sender._id === currentUser?.id;
              return (
                <div key={msg._id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                    <AvatarFallback>{msg.sender.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-xs ${isOwn ? 'items-end' : ''}`}>
                    <div className={`px-3 py-2 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {msg.content.startsWith('[IMAGE]') ? (
                        <img
                          src={msg.content.replace('[IMAGE]', '')}
                          alt="Shared image"
                          className="max-w-xs rounded-lg"
                        />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      {isOwn && msg.read && ' ✓✓'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="flex gap-2 items-end">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={chat.participants.find(p => p._id !== currentUser?.id)?.avatar} />
                <AvatarFallback>{chat.participants.find(p => p._id !== currentUser?.id)?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">typing</span>
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={handleInputChange}
          disabled={sending}
        />
        <Button type="submit" disabled={!messageText.trim() || sending} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
