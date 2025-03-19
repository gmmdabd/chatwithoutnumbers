
import { User } from '@supabase/supabase-js';

export type Conversation = {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
};

export type ConversationParticipant = {
  id: string;
  conversation_id: string;
  user_id: string;
  is_admin: boolean;
  joined_at: string;
  user?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string | null;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  file_url: string | null;
  replied_to_id: string | null;
  replied_to_message?: Message;
  is_forwarded: boolean;
  disappears_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
};

export type MessageReaction = {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
};
