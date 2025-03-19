
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message, MessageReaction } from '@/types/chat';
import { toast } from 'sonner';

export const useMessages = (conversationId: string | undefined) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !user) return;
    
    setLoading(true);
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(id, username, avatar_url),
            replied_to_message:messages!replied_to_id(*),
            reactions:message_reactions(*)
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Transform data to match the expected types
        const typedMessages: Message[] = (data || []).map(msg => {
          // Handle replied_to_message correctly
          let typedRepliedToMessage = null;
          if (msg.replied_to_message) {
            typedRepliedToMessage = {
              ...msg.replied_to_message,
              content_type: (msg.replied_to_message.content_type || 'text') as 'text' | 'image' | 'video' | 'audio' | 'file',
              sender: msg.replied_to_message.sender || null
            };
          }
          
          return {
            ...msg,
            content_type: (msg.content_type || 'text') as 'text' | 'image' | 'video' | 'audio' | 'file',
            sender: msg.sender || null,
            replied_to_message: typedRepliedToMessage,
            reactions: msg.reactions || []
          };
        });
        
        setMessages(typedMessages);
      } catch (error: any) {
        console.error('Error fetching messages:', error.message);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        fetchMessages();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      }, (payload) => {
        fetchMessages();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);
  
  const sendMessage = async (content: string, contentType: Message['content_type'] = 'text', options?: {
    fileUrl?: string;
    repliedToId?: string;
    isForwarded?: boolean;
    disappearsAt?: Date;
  }) => {
    try {
      if (!user) throw new Error('You must be logged in');
      if (!conversationId) throw new Error('No conversation selected');
      
      const newMessage = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        content_type: contentType,
        file_url: options?.fileUrl || null,
        replied_to_id: options?.repliedToId || null,
        is_forwarded: options?.isForwarded || false,
        disappears_at: options?.disappearsAt ? options.disappearsAt.toISOString() : null
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      toast.error('Failed to send message');
      return false;
    }
  };
  
  const addReaction = async (messageId: string, reaction: string) => {
    try {
      if (!user) throw new Error('You must be logged in');
      
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction
        });
        
      if (error) {
        // If reaction already exists, remove it
        if (error.code === '23505') { // unique violation
          const { error: deleteError } = await supabase
            .from('message_reactions')
            .delete()
            .match({ message_id: messageId, user_id: user.id, reaction });
            
          if (deleteError) throw deleteError;
        } else {
          throw error;
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Error adding reaction:', error.message);
      toast.error('Failed to add reaction');
      return false;
    }
  };
  
  const uploadAttachment = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error('You must be logged in');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading attachment:', error.message);
      toast.error('Failed to upload attachment');
      return null;
    }
  };
  
  return {
    messages,
    loading,
    sendMessage,
    addReaction,
    uploadAttachment
  };
};
