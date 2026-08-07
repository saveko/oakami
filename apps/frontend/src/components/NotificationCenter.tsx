'use client';

import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/lib/hooks/useNotifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { data: notificationData, isLoading } = useNotifications(50);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const severityColor = (severity: string) => {
    if (severity === 'CRITICAL')
      return 'border-l-4 border-red-500 bg-red-50 hover:bg-red-100';
    if (severity === 'WARNING')
      return 'border-l-4 border-yellow-500 bg-yellow-50 hover:bg-yellow-100';
    return 'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100';
  };

  const handleNotificationKeyDown = (
    e: React.KeyboardEvent,
    notification: any,
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!notification.isRead) {
        handleMarkAsRead(notification.id, e);
      }
    }
  };

  return (
    <div
      id="notification-center"
      className="fixed right-0 top-16 w-96 max-h-[calc(100vh-64px)] bg-white shadow-2xl rounded-lg overflow-hidden z-50 flex flex-col"
      role="dialog"
      aria-label="Notifications panel"
      aria-modal="true"
    >
      <div className="sticky top-0 p-4 border-b bg-white flex justify-between items-center gap-2">
        <h2 className="font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({unreadCount} unread)
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 px-2 py-1 rounded"
            aria-label="Mark all notifications as read"
            aria-busy={markAllAsReadMutation.isPending}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1" role="region" aria-label="Notification list" aria-live="polite">
        {isLoading && (
          <div className="p-8 text-center text-gray-500" role="status">
            Loading notifications...
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500" role="status">
            <p>No notifications yet</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((notification: any) => (
            <button
              key={notification.id}
              className={`w-full p-4 border-b cursor-pointer transition text-left focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sky-500 ${severityColor(
                notification.severity,
              )} ${!notification.isRead ? 'font-medium' : ''}`}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification.id);
                }
              }}
              onKeyDown={(e) => handleNotificationKeyDown(e, notification)}
              aria-label={`${notification.title}. ${notification.message}`}
              aria-pressed={notification.isRead}
              aria-describedby={`notification-time-${notification.id}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span
                        className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0"
                        aria-label="Unread"
                      ></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  <p
                    id={`notification-time-${notification.id}`}
                    className="text-xs text-gray-500 mt-2"
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
      </div>

      <div className="sticky bottom-0 p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
          aria-label="Close notifications panel"
        >
          Close
        </button>
      </div>
    </div>
  );
}
