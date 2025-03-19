
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import ChatList from '@/components/chat/ChatList';
import ChatView from '@/components/chat/ChatView';

const Chat: React.FC = () => {
  const location = useLocation();
  const isChatDetails = location.pathname.match(/\/chat\/\d+/);
  
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-12rem)] flex rounded-lg overflow-hidden shadow-card border animate-fade-in">
        <div 
          className={cn(
            "lg:w-96 border-r",
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
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                  <div className="text-center p-6">
                    <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
                    <p className="text-muted-foreground">Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              } 
            />
            <Route path="/:chatId" element={<ChatView />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
