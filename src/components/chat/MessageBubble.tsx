
import React, { useState } from 'react';
import { Check, CheckCheck, Clock, Reply, Forward, Trash, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, MessageReaction } from '@/types/chat';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export interface MessageBubbleProps {
  message: Message;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  className?: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReply,
  onForward,
  onDelete,
  onReact,
  className,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();
  
  const isOutgoing = message.sender_id === user?.id;
  const status = 'read'; // This would be dynamic in a real app
  
  // Format timestamp
  const timeString = message.created_at 
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
    
  const timeAgo = message.created_at 
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    : '';
    
  // Check if message should disappear
  const isDisappearing = !!message.disappears_at;
  
  // Organize reactions
  const reactions = message.reactions || [];
  const reactionCounts: {[key: string]: number} = {};
  
  reactions.forEach(reaction => {
    reactionCounts[reaction.reaction] = (reactionCounts[reaction.reaction] || 0) + 1;
  });
  
  const formattedReactions = Object.entries(reactionCounts).map(([emoji, count]) => ({
    emoji,
    count,
  }));
  
  // Check if current user has reacted with each emoji
  const userReactions = reactions
    .filter(r => r.user_id === user?.id)
    .map(r => r.reaction);
    
  const statusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={14} />;
      case 'sent':
        return <Check size={14} />;
      case 'delivered':
        return <CheckCheck size={14} />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };
  
  // Render different content based on message type
  const renderContent = () => {
    switch (message.content_type) {
      case 'image':
        return (
          <div className="mb-1">
            <img 
              src={message.file_url || ''} 
              alt="Shared image" 
              className="rounded-lg max-w-full max-h-80 object-contain"
            />
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="mb-1">
            <video
              src={message.file_url || ''}
              controls
              className="rounded-lg max-w-full max-h-80"
            />
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="mb-1">
            <audio 
              src={message.file_url || ''} 
              controls 
              className="w-full"
            />
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
      case 'file':
        return (
          <div className="mb-1">
            <a 
              href={message.file_url || ''}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
            >
              <span className="flex-1 truncate">{message.content}</span>
              <span className="ml-2 text-brand-blue">Download</span>
            </a>
          </div>
        );
      case 'text':
      default:
        return <div className="text-sm mb-1">{message.content}</div>;
    }
  };

  return (
    <div
      className={cn(
        'flex mb-2',
        isOutgoing ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-4 py-2",
          isOutgoing 
            ? "bg-brand-blue text-white" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
          isDisappearing && "border-2 border-yellow-500"
        )}
      >
        {/* Replied message preview */}
        {message.replied_to_message && (
          <div 
            className={cn(
              "text-xs p-2 mb-1 rounded border-l-2",
              isOutgoing 
                ? "bg-blue-600 border-blue-400" 
                : "bg-gray-200 dark:bg-gray-700 border-gray-400"
            )}
          >
            <div className="font-medium mb-1">
              {message.replied_to_message.sender_id === user?.id ? 'You' : message.replied_to_message.sender?.username || 'Unknown'}
            </div>
            <div className="truncate">{message.replied_to_message.content}</div>
          </div>
        )}
        
        {/* Forwarded message indicator */}
        {message.is_forwarded && (
          <div className="text-xs italic mb-1 flex items-center">
            <Forward size={12} className="mr-1" />
            Forwarded
          </div>
        )}
        
        {/* Message content */}
        {renderContent()}
        
        {/* Time and status */}
        <div className="flex items-center justify-end space-x-1.5 text-xs opacity-80">
          <span title={timeAgo}>{timeString}</span>
          {isOutgoing && statusIcon()}
        </div>
        
        {/* Reactions */}
        {formattedReactions.length > 0 && (
          <div className="flex mt-1 -mb-1 -ml-1">
            {formattedReactions.map((reaction, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center rounded-full px-1.5 py-0.5 text-xs shadow-subtle mr-1",
                  userReactions.includes(reaction.emoji)
                    ? "bg-brand-light-blue dark:bg-blue-900"
                    : "bg-white/80 dark:bg-gray-800/80"
                )}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Message actions */}
        {showActions && (
          <div 
            className={cn(
              "absolute -top-4 flex items-center space-x-1",
              isOutgoing ? "right-0" : "left-0"
            )}
          >
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md">
                  <Smile size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 flex space-x-1">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    className="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                    onClick={() => onReact?.(message.id, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            
            <button 
              className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md"
              onClick={() => onReply?.(message.id)}
            >
              <Reply size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <button 
              className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md"
              onClick={() => onForward?.(message.id)}
            >
              <Forward size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {isOutgoing && (
              <button 
                className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md text-red-500"
                onClick={() => onDelete?.(message.id)}
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
