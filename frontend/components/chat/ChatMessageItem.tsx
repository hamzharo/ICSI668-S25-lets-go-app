// frontend/components/chat/ChatMessageItem.tsx
'use client';

import React from 'react';
import { ChatMessage } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessageItemProps {
  message: ChatMessage;
  currentUserId: string; // To determine if it's an "own" message
}

const ChatMessageItem = ({ message, currentUserId }: ChatMessageItemProps) => {
  const isOwn = message.senderId === currentUserId;

  // Determine initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else if (names.length === 1 && names[0].length > 0) {
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  const messageTimestamp = new Date(message.timestamp);
  const timeAgo = formatDistanceToNowStrict(messageTimestamp, { addSuffix: true });
  const fullTimestamp = format(messageTimestamp, "MMM d, yyyy 'at' h:mm a");


  return (
    <div className={cn("flex items-end gap-2 mb-3", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderProfilePictureUrl || undefined} alt={message.senderFirstName} />
          <AvatarFallback>{getInitials(message.senderFirstName)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl shadow-sm",
          isOwn
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
        )}
      >
        {!isOwn && (
            <p className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">{message.senderFirstName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={cn("text-xs mt-1.5", isOwn ? "text-blue-200 text-right" : "text-gray-400 dark:text-gray-500 text-left")} title={fullTimestamp}>
          {timeAgo}
        </p>
      </div>
      {isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
            {/* Typically you don't show your own avatar next to every message, but an option */}
            {/* <AvatarImage src={currentUserAvatarUrl || undefined} alt="My avatar" /> */}
            <AvatarFallback>{getInitials("You")}</AvatarFallback> {/* Or current user's initials */}
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessageItem;