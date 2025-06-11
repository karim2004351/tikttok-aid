import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  category: string;
  isRead: boolean;
  actionRequired?: boolean;
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const sortedNotifications = notifications.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
              criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">مركز الإشعارات</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Check className="w-3 h-3 ml-1" />
                    تحديد الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center space-x-2 space-x-reverse mt-2">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {unreadCount} غير مقروء
                </Badge>
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="bg-red-600 animate-pulse">
                    {criticalCount} حرج
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                جاري تحميل الإشعارات...
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="p-2">
                {sortedNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div 
                      className={`p-3 rounded-lg hover:bg-slate-750 transition-colors ${
                        !notification.isRead ? 'bg-slate-750/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 space-x-reverse flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {getNotificationIcon(notification.type)}
                            <div 
                              className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}
                              title={`أولوية ${notification.priority}`}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-white' : 'text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  إجراء مطلوب
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <Badge variant="outline" className="text-xs border-slate-600">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 space-x-reverse ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {index < sortedNotifications.length - 1 && (
                      <hr className="my-1 border-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {sortedNotifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-blue-400 hover:text-blue-300"
                onClick={() => setIsOpen(false)}
              >
                إغلاق مركز الإشعارات
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;