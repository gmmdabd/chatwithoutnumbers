import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Mic, Image, Smile, Forward, Timer, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import MessageBubble from '@/components/chat/MessageBubble';
import { toast } from 'sonner';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Conversation, ConversationParticipant } from '@/types/chat';

const ChatView: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const [disappearTime, setDisappearTime] = useState<number | null>(null);
  const [messageToForward, setMessageToForward] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isShowingParticipants, setIsShowingParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    messages, 
    loading: messagesLoading, 
    sendMessage, 
    addReaction, 
    uploadAttachment 
  } = useMessages(chatId);
  
  useEffect(() => {
    if (!chatId || !user) return;
    
    const fetchConversationDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            participants:conversation_participants(
              *,
              user:profiles(id, username, avatar_url)
            )
          `)
          .eq('id', chatId)
          .single();
          
        if (error) throw error;
        
        const typedParticipants: ConversationParticipant[] = (data.participants || []).map(
          (p: any) => ({
            ...p,
            user: typeof p.user === 'object' && p.user !== null ? p.user : null
          })
        );
        
        const typedConversation: Conversation = {
          id: data.id,
          name: data.name,
          is_group: data.is_group,
          created_at: data.created_at,
          updated_at: data.updated_at,
          participants: typedParticipants
        };
        
        setConversation(typedConversation);
        setParticipants(typedParticipants);
      } catch (error: any) {
        console.error('Error fetching conversation:', error.message);
        toast.error('Failed to load conversation');
        navigate('/chat');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversationDetails();
  }, [chatId, user, navigate]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !isAttaching) return;
    
    const options: any = {};
    
    if (replyingTo) {
      options.repliedToId = replyingTo;
    }
    
    if (disappearTime) {
      const disappearsAt = new Date();
      disappearsAt.setSeconds(disappearsAt.getSeconds() + disappearTime);
      options.disappearsAt = disappearsAt;
    }
    
    const success = await sendMessage(newMessage, 'text', options);
    
    if (success) {
      setNewMessage('');
      setReplyingTo(null);
      setDisappearTime(null);
    }
  };
  
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAttaching(true);
    
    try {
      let contentType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) contentType = 'image';
      else if (file.type.startsWith('video/')) contentType = 'video';
      else if (file.type.startsWith('audio/')) contentType = 'audio';
      
      const fileUrl = await uploadAttachment(file);
      if (!fileUrl) throw new Error('Failed to upload file');
      
      const options: any = {};
      if (replyingTo) options.repliedToId = replyingTo;
      if (disappearTime) {
        const disappearsAt = new Date();
        disappearsAt.setSeconds(disappearsAt.getSeconds() + disappearTime);
        options.disappearsAt = disappearsAt;
      }
      
      const success = await sendMessage(
        contentType === 'file' ? file.name : newMessage, 
        contentType, 
        { ...options, fileUrl }
      );
      
      if (success) {
        setNewMessage('');
        setReplyingTo(null);
        setDisappearTime(null);
      }
    } catch (error: any) {
      console.error('Error attaching file:', error.message);
      toast.error('Failed to attach file');
    } finally {
      setIsAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };
  
  const handleForward = (messageId: string) => {
    setMessageToForward(messageId);
    setIsForwarding(true);
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast.success('Message deleted');
    } catch (error: any) {
      console.error('Error deleting message:', error.message);
      toast.error('Failed to delete message');
    }
  };
  
  const handleAddReaction = (messageId: string, reaction: string) => {
    addReaction(messageId, reaction);
  };
  
  const handleForwardMessage = async (targetConversationId: string) => {
    if (!messageToForward) return;
    
    try {
      const messageToForwardData = messages.find(m => m.id === messageToForward);
      if (!messageToForwardData) return;
      
      const success = await sendMessage(
        messageToForwardData.content || '',
        messageToForwardData.content_type,
        {
          fileUrl: messageToForwardData.file_url,
          isForwarded: true
        }
      );
      
      if (success) {
        toast.success('Message forwarded');
      }
    } catch (error: any) {
      console.error('Error forwarding message:', error.message);
      toast.error('Failed to forward message');
    } finally {
      setIsForwarding(false);
      setMessageToForward(null);
    }
  };
  
  const replyingToMessage = replyingTo 
    ? messages.find(m => m.id === replyingTo)
    : null;
    
  const otherParticipants = participants
    .filter(p => p.user_id !== user?.id)
    .map(p => p.user);
    
  const conversationName = conversation?.is_group
    ? conversation.name
    : otherParticipants[0]?.username || 'Unknown User';
    
  const conversationStatus = conversation?.is_group
    ? `${participants.length} members`
    : 'Online'; // This would be dynamic in a real app
  
  if (isLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
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
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/chat" className="lg:hidden mr-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <Avatar className={!conversation.is_group ? 'border-2 border-green-500' : ''}>
            <span className="flex h-full w-full items-center justify-center font-medium">
              {conversationName.charAt(0).toUpperCase()}
            </span>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-semibold">{conversationName}</h2>
            <p className="text-xs text-gray-500">{conversationStatus}</p>
          </div>
        </div>
        
        {conversation.is_group && (
          <button 
            onClick={() => setIsShowingParticipants(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Users size={20} />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReply={handleReply}
              onForward={handleForward}
              onDelete={handleDeleteMessage}
              onReact={handleAddReaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {replyingToMessage && (
        <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-10 bg-brand-blue mr-2"></div>
            <div>
              <div className="text-sm font-medium">
                Replying to {replyingToMessage.sender_id === user?.id ? 'yourself' : replyingToMessage.sender?.username || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-xs">
                {replyingToMessage.content}
              </div>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setReplyingTo(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button 
              type="button" 
              onClick={handleAttachFile}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={isAttaching}
            >
              <Paperclip size={20} />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Timer size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Message disappears after:</p>
                  <div className="flex flex-wrap gap-2">
                    {[5, 30, 60, 300, 3600, 86400].map(seconds => (
                      <button
                        key={seconds}
                        type="button"
                        className={`px-2 py-1 text-xs rounded ${disappearTime === seconds ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        onClick={() => setDisappearTime(disappearTime === seconds ? null : seconds)}
                      >
                        {seconds < 60 ? `${seconds}s` : 
                         seconds < 3600 ? `${Math.floor(seconds / 60)}m` :
                         seconds < 86400 ? `${Math.floor(seconds / 3600)}h` : `1d`}
                      </button>
                    ))}
                  </div>
                  {disappearTime && (
                    <div className="text-xs text-brand-blue">
                      This message will disappear after sending
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAttaching ? "Uploading attachment..." : "Type a message..."}
              className="w-full px-4 py-2 rounded-full border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
              disabled={isAttaching}
            />
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  <Smile size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-8 gap-2">
                  {['😀', '😂', '❤️', '😍', '👍', '🎉', '🔥', '😊', '🙌', '😎', '🤔', '👏', '🙏', '💯', '🌟', '💪'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                      onClick={() => setNewMessage(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <button
            type="submit"
            className="p-2.5 rounded-full bg-brand-blue text-white hover:bg-blue-600 transition-colors"
            disabled={isAttaching || (!newMessage.trim() && !isAttaching)}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
      
      <Dialog open={isForwarding} onOpenChange={setIsForwarding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-sm">Select a conversation to forward this message to:</p>
            <ForwardMessageList onSelect={handleForwardMessage} currentConversationId={chatId} />
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isShowingParticipants} onOpenChange={setIsShowingParticipants}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Participants</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center p-2 border-b">
                <Avatar>
                  <span className="flex h-full w-full items-center justify-center font-medium">
                    {(participant.user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </Avatar>
                <div className="ml-3">
                  <div className="font-medium">
                    {participant.user?.username || 'Unknown User'}
                    {participant.is_admin && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Admin</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ForwardMessageList: React.FC<{
  onSelect: (conversationId: string) => void;
  currentConversationId?: string;
}> = ({ onSelect, currentConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!user) return;
        
        setLoading(true);
        
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
          
        if (participantError) throw participantError;
        
        if (!participantData || participantData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }
        
        const conversationIds = participantData.map(p => p.conversation_id);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            participants:conversation_participants(
              *,
              user:profiles(id, username, avatar_url)
            )
          `)
          .in('id', conversationIds)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        const filteredConversations: Conversation[] = (data || [])
          .filter(c => c.id !== currentConversationId)
          .map(c => {
            const typedParticipants: ConversationParticipant[] = (c.participants || []).map(
              (p: any) => ({
                ...p,
                user: typeof p.user === 'object' && p.user !== null ? p.user : null
              })
            );
            
            return {
              id: c.id,
              name: c.name,
              is_group: c.is_group,
              created_at: c.created_at,
              updated_at: c.updated_at,
              participants: typedParticipants
            };
          });
        
        setConversations(filteredConversations);
      } catch (error: any) {
        console.error('Error fetching conversations for forward:', error.message);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [user, currentConversationId]);
  
  if (loading) {
    return <div className="text-center py-4">Loading conversations...</div>;
  }
  
  if (conversations.length === 0) {
    return <div className="text-center py-4">No other conversations available</div>;
  }
  
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {conversations.map(conversation => {
        const participants = conversation.participants || [];
        const otherParticipants = participants.filter(p => p.user_id !== user?.id);
        
        const name = conversation.is_group
          ? conversation.name
          : otherParticipants[0]?.user?.username || 'Unknown User';
          
        return (
          <button
            key={conversation.id}
            className="w-full flex items-center p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => onSelect(conversation.id)}
          >
            <Avatar>
              <span className="flex h-full w-full items-center justify-center font-medium">
                {name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </Avatar>
            <span className="ml-3">{name}</span>
            {conversation.is_group && (
              <span className="ml-2 text-xs text-gray-500">
                ({participants.length} members)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ChatView;
