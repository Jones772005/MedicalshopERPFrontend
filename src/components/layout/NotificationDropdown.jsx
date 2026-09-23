import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertTriangle, AlertCircle, CalendarClock, CircleAlert } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi';
import { useLocalDbListener } from '../../hooks/useLocalDbListener';
import { KEYS } from '../../data/storageKeys';

const getIcon = (notification) => {
  const id = notification.id;
  if (id.startsWith('out_of_stock') || id.startsWith('expired')) return <CircleAlert className="w-5 h-5 text-red-500 dark:text-red-400" />;
  if (id.startsWith('low_stock')) return <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  if (id.startsWith('near_expiry')) return <CalendarClock className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  
  if (notification.priority === 'critical') return <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
  if (notification.priority === 'high') return <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  if (notification.priority === 'info') return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  return <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />;
};

const getRelativeTime = (dateStr) => {
  const diffMs = new Date() - new Date(dateStr);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffHours < 48) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isRecent = (dateStr) => {
  return (new Date() - new Date(dateStr)) < 5 * 60 * 1000;
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      // notificationApi.js already returns them sorted by createdAt desc
      setNotifications(res.data.slice(0, 10)); // Show top 10 in dropdown
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchNotifications();
    // In a real app, this might poll or use websockets
  }, []);

  useLocalDbListener(KEYS.NOTIFICATIONS, fetchNotifications);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 600); // Wait for pulse to finish
      return () => clearTimeout(timer);
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount]);

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
    setIsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-[#627D98] dark:text-[#B8CCE0] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] hover:text-[#1677FF] dark:hover:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#1677FF] transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-bold border-2 border-white dark:border-[#102A43] shadow-sm transform translate-x-0.5 -translate-y-0.5 transition-all ${animateBadge ? 'scale-110 shadow-md' : 'scale-100'}`}>
             {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] sm:w-[400px] bg-white dark:bg-[#102A43] rounded-xl shadow-xl py-0 border border-[#D9E6F2] dark:border-[#23415C] z-50 overflow-hidden max-h-[85vh] sm:max-h-[480px] flex flex-col">
          <div className="px-4 py-3 border-b border-[#D9E6F2] dark:border-[#23415C] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F2A43]">
            <h3 className="text-sm font-semibold text-[#102A43] dark:text-[#F8FAFC]">
              Notifications 
              {unreadCount > 0 && <span className="ml-1.5 text-[#627D98] dark:text-[#8FA9BF] font-normal">({unreadCount})</span>}
            </h3>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#627D98] dark:text-[#8FA9BF]">
                No recent notifications
              </div>
            ) : (
              <ul className="divide-y divide-[#D9E6F2] dark:divide-[#23415C]">
                {notifications.map(notification => {
                  const recent = isRecent(notification.createdAt);
                  const unread = !notification.read;
                  return (
                    <li 
                      key={notification.id} 
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] cursor-pointer transition-colors ${unread ? 'bg-[#F0F7FF] dark:bg-[#132B42]' : 'bg-white dark:bg-[#102A43]'}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification)}
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm ${unread ? 'font-semibold text-[#102A43] dark:text-[#F8FAFC]' : 'font-medium text-[#334E68] dark:text-[#B8CCE0]'}`}>
                              {notification.title}
                            </p>
                            {recent && unread && (
                              <span className="ml-2 flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#627D98] dark:text-[#9FB3C8] mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-[#829AB1] dark:text-[#768C9E] mt-1.5" title={new Date(notification.createdAt).toLocaleString()}>
                            {getRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {unread && !recent && (
                          <div className="ml-2 flex-shrink-0 mt-1.5">
                            <span className="block h-2 w-2 rounded-full bg-[#1677FF] dark:bg-[#38BDF8]"></span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="px-4 py-2.5 border-t border-[#D9E6F2] dark:border-[#23415C] bg-[#F8FAFC] dark:bg-[#0F2A43] flex justify-between items-center">
            <button 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-[#627D98] dark:text-[#8FA9BF] hover:text-[#102A43] dark:hover:text-[#F8FAFC] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-medium text-[#1677FF] hover:text-[#0052CC] dark:text-[#38BDF8] transition-colors cursor-pointer"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
