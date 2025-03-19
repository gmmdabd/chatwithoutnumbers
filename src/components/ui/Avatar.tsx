
import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'offline' | 'busy' | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  initials,
  size = 'md',
  status = null,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
  };

  const getInitials = () => {
    if (initials) return initials;
    if (!alt) return '?';
    
    return alt
      .split(' ')
      .map(name => name[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center overflow-hidden',
          'text-white font-medium bg-gradient-to-br from-brand-blue to-blue-600',
          sizeClasses[size],
          className
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} 
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>
      
      {status && (
        <span 
          className={cn(
            'absolute block rounded-full border-2 border-white dark:border-gray-900',
            statusColors[status],
            size === 'sm' ? 'w-2.5 h-2.5 bottom-0 right-0' :
            size === 'md' ? 'w-3 h-3 bottom-0 right-0' :
            size === 'lg' ? 'w-3.5 h-3.5 bottom-0.5 right-0.5' :
            'w-4 h-4 bottom-1 right-1'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
