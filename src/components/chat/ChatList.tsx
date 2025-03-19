
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, PlusCircle, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation, ConversationParticipant } from '@/types/chat';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const ChatList: React.FC = () => {
  const { conversations, loading, createConversation } = useConversations();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useAuth();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const navigate = useNavigate();
  
  const filteredChats = conversations.filter(chat => {
    const participants = chat.participants || [];
    const otherParticipants = participants.filter(p => p.user_id !== user?.id);
    const chatName = chat.is_group 
      ? chat.name 
      : otherParticipants[0]?.user?.username || 'Unknown User';
    
    const lastMessage = chat.last_message?.content || '';
    
    return chatName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStartDirectChat = async (userId: string) => {
    if (!user) return;
    const conversationId = await createConversation([userId]);
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
      setIsNewChatOpen(false);
    }
  };

  const handleCreateGroupChat = async (name: string, userIds: string[]) => {
    if (!user) return;
    const conversationId = await createConversation(userIds, name, true);
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
      setIsNewGroupOpen(false);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Messages</h1>
          <div className="flex items-center space-x-2">
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <button className="text-brand-blue hover:bg-brand-light-blue p-2 rounded-full transition-colors">
                  <UserPlus size={22} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <NewDirectChatForm onStartChat={handleStartDirectChat} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
              <DialogTrigger asChild>
                <button className="text-brand-blue hover:bg-brand-light-blue p-2 rounded-full transition-colors">
                  <PlusCircle size={22} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Group Chat</DialogTitle>
                </DialogHeader>
                <NewGroupChatForm onCreateGroup={handleCreateGroupChat} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="relative">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
          />
          <input
            type="text"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground mb-4">No conversations found</p>
            <Button onClick={() => setIsNewChatOpen(true)}>Start a Conversation</Button>
          </div>
        ) : (
          <ul>
            {filteredChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} currentUserId={user?.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

interface ChatItemProps {
  chat: Conversation;
  currentUserId: string | undefined;
}

const ChatListItem: React.FC<ChatItemProps> = ({ chat, currentUserId }) => {
  const { chatId } = useParams();
  const isActive = chatId === chat.id;
  
  const participants = chat.participants || [];
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId);
  
  // For direct messages, show the other person's name
  // For group chats, show the group name
  const chatName = chat.is_group 
    ? chat.name 
    : otherParticipants[0]?.user?.username || 'Unknown User';

  // Get the avatar for direct messages or first letter for group chats
  const avatarText = chat.is_group 
    ? (chat.name || 'G').charAt(0).toUpperCase()
    : (otherParticipants[0]?.user?.username || 'U').charAt(0).toUpperCase();
    
  // Get avatar status for direct messages
  const status = chat.is_group 
    ? null 
    : getRandomStatus(); // This would be replaced with actual online status
    
  // Calculate unread messages (placeholder)
  const unread = Math.floor(Math.random() * 5); // This would be replaced with actual unread count
  
  // Format the time
  const time = chat.last_message?.created_at 
    ? formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })
    : 'No messages';
    
  // Get the last message content
  const lastMessage = chat.last_message?.content || 'No messages yet';
  
  // Helper function for random status (placeholder)
  function getRandomStatus() {
    const statuses = ['online', 'away', 'offline', 'busy'];
    return statuses[Math.floor(Math.random() * statuses.length)] as 'online' | 'away' | 'offline' | 'busy';
  }
  
  return (
    <li>
      <Link
        to={`/chat/${chat.id}`}
        className={cn(
          "flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l-2 border-transparent",
          isActive && "bg-brand-light-blue dark:bg-gray-800/80 border-l-2 border-brand-blue"
        )}
      >
        <Avatar 
          className={!chat.is_group && status ? `border-2 border-${status === 'online' ? 'green' : status === 'away' ? 'yellow' : status === 'busy' ? 'red' : 'gray'}-500` : ''}
        >
          <span className="flex h-full w-full items-center justify-center font-medium">
            {avatarText}
          </span>
        </Avatar>
        <div className="ml-3 flex-1 overflow-hidden">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium truncate">{chatName}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{time}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{lastMessage}</p>
            {unread > 0 && (
              <span className="ml-2 flex-shrink-0 w-5 h-5 bg-brand-blue rounded-full text-xs text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

const NewDirectChatForm: React.FC<{ onStartChat: (userId: string) => void }> = ({ onStartChat }) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchUsername}%`)
        .neq('id', user?.id || '')
        .limit(10);
        
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching users:', error.message);
      toast.error('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-search when the user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchUsername.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchUsername]);
  
  return (
    <div className="space-y-4 mt-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Search by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {searchResults.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {searchUsername.trim() && !loading ? 'No users found' : 'Search for users to start a conversation'}
          </p>
        ) : (
          searchResults.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <Avatar>
                  <span className="flex h-full w-full items-center justify-center font-medium">
                    {(user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </Avatar>
                <span className="ml-3">{user.username}</span>
              </div>
              <Button size="sm" onClick={() => onStartChat(user.id)}>
                Chat
              </Button>
            </div>
          ))
        )}
        {loading && (
          <p className="text-center text-muted-foreground py-2">Searching...</p>
        )}
      </div>
    </div>
  );
};

const NewGroupChatForm: React.FC<{ onCreateGroup: (name: string, userIds: string[]) => void }> = ({ onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchUsername}%`)
        .neq('id', user?.id)
        .limit(10);
        
      if (error) throw error;
      
      // Filter out already selected users
      const filteredResults = (data || []).filter(
        result => !selectedUsers.some(selected => selected.id === result.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error.message);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };
  
  const addUser = (user: any) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter(result => result.id !== user.id));
    setSearchUsername('');
  };
  
  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(selected => selected.id !== userId));
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast.error('Please add at least one user to the group');
      return;
    }
    
    const userIds = selectedUsers.map(user => user.id);
    onCreateGroup(groupName, userIds);
  };
  
  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      
      <div className="flex flex-wrap gap-2 min-h-8">
        {selectedUsers.map(user => (
          <div key={user.id} className="flex items-center bg-brand-light-blue text-brand-blue px-2 py-1 rounded-full text-sm">
            {user.username}
            <button className="ml-1" onClick={() => removeUser(user.id)}>×</button>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          placeholder="Search users to add"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '...' : 'Search'}
        </Button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {searchResults.map(user => (
          <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
            <span>{user.username}</span>
            <Button size="sm" variant="outline" onClick={() => addUser(user)}>
              Add
            </Button>
          </div>
        ))}
      </div>
      
      <Button className="w-full" onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0}>
        Create Group Chat
      </Button>
    </div>
  );
};

export default ChatList;
