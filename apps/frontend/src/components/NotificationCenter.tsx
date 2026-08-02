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

  const handleMarkAsRead = (id: string) => {
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

  return (
    <div className="fixed right-0 top-16 w-96 max-h-screen bg-white shadow-2xl rounded-lg overflow-hidden z-50">
      <div className="sticky top-0 p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {notifications.some((n: any) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-sm text-sky-500 hover:text-sky-600 font-medium disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
        {isLoading && (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-4 border-b cursor-pointer transition ${severityColor(
                notification.severity,
              )}`}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification.id);
                }
              }}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="sticky bottom-0 p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
