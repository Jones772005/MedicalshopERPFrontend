import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi';
import { useLocalDbListener } from '../../hooks/useLocalDbListener';
import { KEYS } from '../../data/storageKeys';

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    default: return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, critical, high, info
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useLocalDbListener(KEYS.NOTIFICATIONS, fetchNotifications);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(id);
      // eslint-disable-next-line react/set-state-in-effect
    fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      // eslint-disable-next-line react/set-state-in-effect
    fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.priority === 'critical';
    if (filter === 'high') return n.priority === 'high';
    if (filter === 'info') return n.priority === 'info';
    return true; // 'all'
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader 
        title="Notification Center" 
        description="View and manage alerts for stock, prescriptions, and system events."
        action={
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={unreadCount === 0 ? "opacity-50 cursor-not-allowed" : ""}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All as Read
          </Button>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-4">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {['all', 'unread', 'critical', 'high', 'info'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  filter === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 mb-4">
                <Bell className="w-6 h-6 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                {filter === 'unread' ? "You're all caught up" : 
                 filter === 'critical' ? "No critical notifications" : 
                 filter === 'high' ? "No high-priority notifications" :
                 filter === 'info' ? "No informational notifications" :
                 "No notifications found"}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                When you receive new alerts, they will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer transition-colors flex items-start space-x-4 ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm sm:text-base ${!notification.read ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-slate-200'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {notification.module}
                    </span>
                    
                    {!notification.read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
