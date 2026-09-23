import { cn } from '../../utils/cn';

const StatusBadge = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
      case 'paid':
      case 'verified':
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
      case 'low stock':
      case 'near expiry':
      case 'pending':
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
      case 'out of stock':
      case 'expired':
      case 'failed':
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300';
    }
  };

  return (
    <span className={cn("px-2.5 py-0.5 inline-flex text-[11px] leading-4 font-bold uppercase tracking-wider rounded-full shadow-sm", getStatusStyles(), className)}>
      {status}
    </span>
  );
};

export default StatusBadge;
