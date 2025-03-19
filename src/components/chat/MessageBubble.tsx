
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MessageProps {
  id: string;
  content: string;
  time: string;
  isOutgoing: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Array<{
    emoji: string;
    count: number;
  }>;
  className?: string;
}

const MessageBubble: React.FC<MessageProps> = ({
  content,
  time,
  isOutgoing,
  status = 'sent',
  reactions,
  className,
}) => {
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

  return (
    <div
      className={cn(
        'flex mb-2',
        isOutgoing ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          'message-bubble',
          isOutgoing ? 'outgoing' : 'incoming'
        )}
      >
        <div className="text-sm mb-1">{content}</div>
        <div className="flex items-center justify-end space-x-1.5 text-xs opacity-80">
          <span>{time}</span>
          {isOutgoing && statusIcon()}
        </div>
        
        {reactions && reactions.length > 0 && (
          <div className="flex mt-1 -mb-1 -ml-1">
            {reactions.map((reaction, index) => (
              <div 
                key={index}
                className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-full px-1.5 py-0.5 text-xs shadow-subtle mr-1"
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
