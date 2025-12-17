import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';
import { Button } from '@/components/ui/button';
import { useChatList } from '@/hooks/useChatList';
import { useUser } from '@/context/UserContext';
import { MessageCircle } from 'lucide-react';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useUser();
  const { chats, deleteChat, fetchChats, getOrCreateChat } = useChatList();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showStartChat, setShowStartChat] = useState(false);

  // Handle deep-linking from profile/blog (e.g., ?user=userId)
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && userId !== currentUser?.id) {
      const startChat = async () => {
        const chat = await getOrCreateChat(userId);
        if (chat) {
          setSelectedChatId(chat._id);
          fetchChats();
          // Clean up query param
          navigate('/messages', { replace: true });
        }
      };
      startChat();
    }
  }, [searchParams, currentUser?.id, navigate, getOrCreateChat, fetchChats]);

  if (!currentUser?.id) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <p className="text-lg font-semibold mb-4">Please log in to view messages</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <ChatList
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId || ''}
            onStartNewChat={() => setShowStartChat(true)}
          />

          {/* Chat Window */}
          {showStartChat ? (
            <StartChatModal
              onClose={() => setShowStartChat(false)}
              onChatCreated={(chatId) => {
                setSelectedChatId(chatId);
                setShowStartChat(false);
                fetchChats();
              }}
            />
          ) : (
            <div className="col-span-2">
              <ChatWindow
                chatId={selectedChatId}
                onDelete={(chatId) => {
                  deleteChat(chatId);
                  setSelectedChatId(null);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface StartChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

function StartChatModal({ onClose, onChatCreated }: StartChatModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { getOrCreateChat } = useChatList();
  const { user: currentUser } = useUser();

  // Fetch all users on mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/users/all', {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          // Filter out current user
          const otherUsers = (json.data || []).filter((u: any) => u._id !== currentUser?.id);
          setUsers(otherUsers);
          setFilteredUsers(otherUsers);
        }
      } catch (e) {
        console.error('Error fetching users:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [currentUser?.id]);

  // Filter users based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = search.toLowerCase();
    const filtered = users.filter(
      (user: any) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleSelectUser = async (userId: string) => {
    const chat = await getOrCreateChat(userId);
    if (chat) {
      onChatCreated(chat._id);
    }
  };

  return (
    <div className="col-span-2 bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="space-y-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold">Start a new conversation</h2>

        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search ? 'No users found matching your search.' : 'No users available.'}
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSelectUser(user._id)}
                  className="ml-2 flex-shrink-0"
                >
                  Chat
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={onClose} className="w-full mt-4">
        Cancel
      </Button>
    </div>
  );
}
