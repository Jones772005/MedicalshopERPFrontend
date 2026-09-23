import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, AlertTriangle, AlertCircle, CalendarClock, CircleAlert, CircleCheck, Bell } from 'lucide-react';
import { getNotifications, markNotificationRead, syncDynamicNotifications } from '../../services/notificationApi';
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
  if (notification.priority === 'success') return <CircleCheck className="w-5 h-5 text-green-500 dark:text-green-400" />;
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

const ToastItem = ({ notification, onClose, onClick }) => {
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Wait for exit animation
  };

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsEntering(false), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleClose = (e) => {
    e.stopPropagation();
    triggerExit();
  };

  const handleClick = () => {
    triggerExit();
    onClick(notification);
  };

  return (
    <div 
      onClick={handleClick}
      className={`pointer-events-auto w-[calc(100vw-24px)] sm:w-[380px] bg-white dark:bg-[#102A43] shadow-lg rounded-[12px] p-4 flex items-start gap-3 border border-[#D9E6F2] dark:border-[#23415C] cursor-pointer transition-all duration-300 transform ${isEntering || isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {getIcon(notification)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#102A43] dark:text-[#F8FAFC] whitespace-normal break-words">
          {notification.title}
        </p>
        <p className="mt-1 text-xs text-[#627D98] dark:text-[#B8CCE0] whitespace-normal break-words">
          {notification.message}
        </p>
        <p className="mt-1.5 text-[11px] text-[#829AB1] dark:text-[#768C9E] whitespace-nowrap">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>
      <div className="shrink-0 flex items-center justify-center w-8 h-8 -mr-1 -mt-1">
        <button
          onClick={handleClose}
          aria-label="Close notification"
          title="Close notification"
          className="text-[#829AB1] dark:text-[#768C9E] hover:bg-gray-100 dark:hover:bg-[#1A334B] hover:text-[#102A43] dark:hover:text-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1677FF] rounded-full p-1.5 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const NotificationToastManager = () => {
  const [toasts, setToasts] = useState([]);
  const initialLoadDone = useRef(false);
  const knownIds = useRef(new Set());
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const currentNotifications = res.data;
      
      if (!initialLoadDone.current) {
        // Initial load: record all existing IDs as known, don't show toasts
        currentNotifications.forEach(n => knownIds.current.add(n.id));
        initialLoadDone.current = true;
        return;
      }

      // Sync knownIds: remove any IDs that are no longer in the DB
      // This ensures dynamic notifications that were resolved (e.g. stock refilled)
      // will correctly trigger a new toast if they happen again.
      const currentIds = new Set(currentNotifications.map(n => n.id));
      for (const id of knownIds.current) {
        if (!currentIds.has(id)) {
          knownIds.current.delete(id);
        }
      }

      // Check for genuinely new, unread notifications
      const newToasts = [];
      currentNotifications.forEach(n => {
        if (!knownIds.current.has(n.id)) {
          knownIds.current.add(n.id);
          if (!n.read) {
            newToasts.push(n);
          }
        }
      });

      if (newToasts.length > 0) {
        setToasts(prev => {
          // Add new ones to the top, keep max 3 visible total
          const combined = [...newToasts, ...prev];
          return combined.slice(0, 3);
        });
      }
    } catch (err) {
      console.error('Failed to load notifications for toasts', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLocalDbListener(KEYS.NOTIFICATIONS, fetchNotifications);
  useLocalDbListener(KEYS.INVENTORY, syncDynamicNotifications);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleToastClick = async (notification) => {
    try {
      await markNotificationRead(notification.id);
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-[75px] right-[12px] sm:right-[24px] z-50 flex flex-col gap-3 pointer-events-none w-[calc(100vw-24px)] sm:w-auto items-end">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          notification={toast} 
          onClose={removeToast}
          onClick={handleToastClick}
        />
      ))}
    </div>
  );
};

export default NotificationToastManager;
