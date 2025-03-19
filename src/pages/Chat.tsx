
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ChatList from '@/components/chat/ChatList';
import ChatView from '@/components/chat/ChatView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const location = useLocation();
  const isChatDetails = location.pathname.match(/\/chat\/[\w-]+/);
  const { user, loading } = useAuth();
  
  // If the auth is still loading, show a loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="w-full h-[calc(100vh-12rem)] flex rounded-lg overflow-hidden shadow-card border animate-fade-in">
      <div 
        className={cn(
          "lg:w-96 border-r bg-white dark:bg-gray-900",
          isChatDetails ? "hidden lg:block" : "w-full"
        )}
      >
        <ChatList />
      </div>
      
      <div 
        className={cn(
          "flex-1",
          isChatDetails ? "block" : "hidden lg:block"
        )}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-6 max-w-sm">
                  <div className="mb-4 bg-brand-light-blue dark:bg-gray-800 p-4 rounded-full inline-block">
                    <MessageSquareText size={32} className="text-brand-blue" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">Your messages</h2>
                  <p className="text-muted-foreground mb-6">Send private messages to friends or create group chats to collaborate with a team.</p>
                  <Button className="w-full" onClick={() => document.querySelector('[aria-label="New Chat"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Start a Conversation
                  </Button>
                </div>
              </div>
            } 
          />
          <Route path="/:chatId" element={<ChatView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Chat;
