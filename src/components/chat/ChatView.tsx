
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Mic, Image, Smile } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import MessageBubble from '@/components/chat/MessageBubble';
import { toast } from 'sonner';

// Dummy chat data for the selected conversation
const dummyContacts = {
  '1': {
    id: '1',
    name: 'Alice Johnson',
    status: 'online',
    avatar: null,
  },
  '2': {
    id: '2',
    name: 'Bob Smith',
    status: 'away',
    avatar: null,
  },
  '3': {
    id: '3',
    name: 'Carol Williams',
    status: 'offline',
    avatar: null,
  },
  '4': {
    id: '4',
    name: 'Design Team',
    status: null,
    avatar: null,
  },
  '5': {
    id: '5',
    name: 'Eva Davis',
    status: 'busy',
    avatar: null,
  },
};

const dummyMessages = {
  '1': [
    { id: '1', content: 'Hey there! How are you doing?', time: '9:41 AM', isOutgoing: false, status: 'read' },
    { id: '2', content: 'I\'m good! Just finished the project we were working on.', time: '9:42 AM', isOutgoing: true, status: 'read' },
    { id: '3', content: 'That\'s great news! Can you share the results?', time: '9:45 AM', isOutgoing: false, status: 'read' },
    { id: '4', content: 'Sure, I\'ll send you the documents later today.', time: '9:47 AM', isOutgoing: true, status: 'read' },
    { id: '5', content: 'Looking forward to seeing them!', time: '9:50 AM', isOutgoing: false, status: 'read' },
  ],
  '2': [
    { id: '1', content: 'Do you have the document I asked for?', time: '1:23 PM', isOutgoing: false, status: 'read' },
    { id: '2', content: 'Yes, just finishing up some edits.', time: '1:25 PM', isOutgoing: true, status: 'read' },
    { id: '3', content: 'Great, I need it by EOD.', time: '1:26 PM', isOutgoing: false, status: 'read' },
  ],
  '3': [
    { id: '1', content: 'Are we still meeting tomorrow?', time: '5:30 PM', isOutgoing: true, status: 'read' },
    { id: '2', content: 'Yes, 2 PM at the office.', time: '5:35 PM', isOutgoing: false, status: 'read' },
    { id: '3', content: 'Perfect, see you then!', time: '5:36 PM', isOutgoing: true, status: 'delivered' },
  ],
  '4': [
    { id: '1', content: 'Dave: I just pushed the new changes', time: '11:20 AM', isOutgoing: false, status: 'read' },
    { id: '2', content: 'Emma: Looks good to me!', time: '11:25 AM', isOutgoing: false, status: 'read' },
    { id: '3', content: 'I\'ll review them this afternoon.', time: '11:30 AM', isOutgoing: true, status: 'read' },
    { id: '4', content: 'Dave: Thanks!', time: '11:32 AM', isOutgoing: false, status: 'read' },
  ],
  '5': [
    { id: '1', content: 'Thanks for helping out with the project!', time: '9:00 AM', isOutgoing: false, status: 'read' },
    { id: '2', content: 'No problem at all, happy to help.', time: '9:05 AM', isOutgoing: true, status: 'read' },
    { id: '3', content: 'Let\'s catch up next week.', time: '9:10 AM', isOutgoing: false, status: 'read' },
  ],
};

const ChatView: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatId && dummyContacts[chatId]) {
      setContact(dummyContacts[chatId]);
      setMessages(dummyMessages[chatId] || []);
    }
  }, [chatId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sending' as const,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate message sending and status updates
    setTimeout(() => {
      setMessages(msgs => 
        msgs.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'sent' as const } : msg
        )
      );
      
      setTimeout(() => {
        setMessages(msgs => 
          msgs.map(msg => 
            msg.id === newMsg.id ? { ...msg, status: 'delivered' as const } : msg
          )
        );
        
        setTimeout(() => {
          setMessages(msgs => 
            msgs.map(msg => 
              msg.id === newMsg.id ? { ...msg, status: 'read' as const } : msg
            )
          );
        }, 1000);
      }, 1000);
    }, 1000);
  };
  
  const handleAttachFile = () => {
    toast.info("File attachment coming soon!");
  };
  
  const handleVoiceMessage = () => {
    toast.info("Voice messages coming soon!");
  };

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-card overflow-hidden border">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <Link to="/chat" className="lg:hidden mr-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <Avatar 
          initials={contact.name.split(' ').map(n => n[0]).join('')} 
          status={contact.status}
          size="md"
        />
        <div className="ml-3">
          <h2 className="font-semibold">{contact.name}</h2>
          <p className="text-xs text-gray-500">
            {contact.status === 'online' ? 'Online' : 
             contact.status === 'away' ? 'Away' : 
             contact.status === 'busy' ? 'Busy' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            id={message.id}
            content={message.content}
            time={message.time}
            isOutgoing={message.isOutgoing}
            status={message.status}
            reactions={message.reactions}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={handleAttachFile}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Paperclip size={20} />
          </button>
          
          <button 
            type="button" 
            onClick={handleAttachFile}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Image size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-full border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
            />
            <button 
              type="button" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            >
              <Smile size={20} />
            </button>
          </div>
          
          {newMessage.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-full bg-brand-blue text-white hover:bg-blue-600 transition-colors"
            >
              <Send size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoiceMessage}
              className="p-2.5 rounded-full bg-brand-blue text-white hover:bg-blue-600 transition-colors"
            >
              <Mic size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatView;
