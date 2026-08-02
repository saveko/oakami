'use client';

import { useState } from 'react';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
  const { data: unreadData } = useUnreadCount();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-700 rounded transition"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && <NotificationCenter onClose={() => setIsOpen(false)} />}
    </div>
  );
}
