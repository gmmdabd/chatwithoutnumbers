
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, ConversationParticipant } from '@/types/chat';
import { toast } from 'sonner';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Get all conversations the user is part of
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
        
        // Get the actual conversations with their participants
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
        
        // Get the last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
          data.map(async (conversation) => {
            const { data: messagesData, error: messagesError } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (messagesError) throw messagesError;
            
            return {
              ...conversation,
              last_message: messagesData && messagesData.length > 0 ? messagesData[0] : null
            };
          })
        );
        
        setConversations(conversationsWithLastMessage);
      } catch (error: any) {
        console.error('Error fetching conversations:', error.message);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to changes
    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        fetchConversations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const createConversation = async (userIds: string[], name: string | null = null, isGroup = false) => {
    try {
      if (!user) throw new Error('You must be logged in');
      if (!userIds.includes(user.id)) userIds.push(user.id);
      
      // For direct messages, check if a conversation already exists
      if (!isGroup && userIds.length === 2) {
        const otherUserId = userIds.find(id => id !== user.id);
        
        const { data: existingConvos, error: existingError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
          
        if (existingError) throw existingError;
        
        const existingConvoIds = existingConvos.map(c => c.conversation_id);
        
        if (existingConvoIds.length) {
          const { data: otherUserConvos, error: otherUserError } = await supabase
            .from('conversation_participants')
            .select('conversation_id, conversation:conversations(is_group)')
            .in('conversation_id', existingConvoIds)
            .eq('user_id', otherUserId);
            
          if (otherUserError) throw otherUserError;
          
          const existingDM = otherUserConvos.find(c => !c.conversation.is_group);
          
          if (existingDM) {
            return existingDM.conversation_id;
          }
        }
      }
      
      // Create a new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          name: name,
          is_group: isGroup
        })
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add all participants
      const participants = userIds.map(userId => ({
        conversation_id: newConversation.id,
        user_id: userId,
        is_admin: userId === user.id // creator is admin
      }));
      
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participants);
        
      if (participantError) throw participantError;
      
      return newConversation.id;
    } catch (error: any) {
      console.error('Error creating conversation:', error.message);
      toast.error('Failed to create conversation');
      return null;
    }
  };
  
  return {
    conversations,
    loading,
    createConversation
  };
};
