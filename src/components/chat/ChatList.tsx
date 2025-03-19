
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Dummy data for chat list
const dummyChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey, how are you doing?',
    time: '2m ago',
    unread: 3,
    avatar: null,
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Can you send me the document?',
    time: '1h ago',
    unread: 0,
    avatar: null,
    status: 'away' as const,
  },
  {
    id: '3',
    name: 'Carol Williams',
    lastMessage: 'Looking forward to our meeting!',
    time: '3h ago',
    unread: 0,
    avatar: null,
    status: 'offline' as const,
  },
  {
    id: '4',
    name: 'Design Team',
    lastMessage: 'Dave: I just pushed the new changes',
    time: 'Yesterday',
    unread: 5,
    avatar: null,
    status: null,
  },
  {
    id: '5',
    name: 'Eva Davis',
    lastMessage: 'Thanks for your help!',
    time: 'Yesterday',
    unread: 0,
    avatar: null,
    status: 'busy' as const,
  },
];

const ChatList: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredChats = dummyChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Messages</h1>
          <button className="text-brand-blue hover:bg-brand-light-blue p-2 rounded-full transition-colors">
            <PlusCircle size={22} />
          </button>
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
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <ul>
            {filteredChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

interface ChatItemProps {
  chat: {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string | null;
    status: 'online' | 'away' | 'offline' | 'busy' | null;
  };
}

const ChatListItem: React.FC<ChatItemProps> = ({ chat }) => {
  const location = useLocation();
  const isActive = location.pathname === `/chat/${chat.id}`;
  
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
          className={chat.status ? `border-2 border-${chat.status === 'online' ? 'green' : chat.status === 'away' ? 'yellow' : chat.status === 'busy' ? 'red' : 'gray'}-500` : ''}
        >
          <span className="flex h-full w-full items-center justify-center font-medium">
            {chat.name.split(' ').map(n => n[0]).join('')}
          </span>
        </Avatar>
        <div className="ml-3 flex-1 overflow-hidden">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium truncate">{chat.name}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{chat.time}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
            {chat.unread > 0 && (
              <span className="ml-2 flex-shrink-0 w-5 h-5 bg-brand-blue rounded-full text-xs text-white flex items-center justify-center">
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

export default ChatList;
