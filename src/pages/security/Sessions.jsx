import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Globe, ShieldOff } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSessions, revokeSession, revokeAllOtherSessions } from '../../services/securityApi';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getSessions();
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    if (window.confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) {
      try {
        await revokeSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRevokeOthers = async () => {
    if (window.confirm('Are you sure you want to revoke all OTHER sessions?')) {
      try {
        await revokeAllOtherSessions();
        setSessions(prev => prev.filter(s => s.status === 'Current'));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('phone') || device.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-gray-500" />;
    }
    return <Monitor className="w-5 h-5 text-gray-500" />;
  };

  const columns = [
    { 
      header: 'Device & Browser', 
      accessor: 'device',
      cell: (row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mr-3">
            {getDeviceIcon(row.device)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center">
              {row.device}
              {row.status === 'Current' && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 uppercase tracking-wide">
                  This Device
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{row.browser} on {row.os}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'User', 
      accessor: 'userName',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.userName}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">{row.userId}</div>
        </div>
      )
    },
    { 
      header: 'Location & IP', 
      accessor: 'location',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white flex items-center">
            <Globe className="w-3 h-3 mr-1 text-gray-400" /> {row.location}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400">{row.ipAddress}</div>
        </div>
      )
    },
    { 
      header: 'Last Active', 
      accessor: 'lastActive',
      cell: (row) => new Date(row.lastActive).toLocaleString()
    },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        row.status !== 'Current' && row.status !== 'Expired' ? (
          <Button variant="outline" className="px-2 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleRevoke(row.id)}>
            Revoke
          </Button>
        ) : (
          <span className="text-xs text-gray-400">{row.status}</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Active Sessions" 
        description="Manage active logins and device sessions."
        action={
          <Button variant="outline" onClick={handleRevokeOthers} className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
            <ShieldOff className="w-4 h-4 mr-2" /> Revoke All Other Sessions
          </Button>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={sessions} searchPlaceholder="Search sessions by user or device..." />
        )}
      </div>
    </div>
  );
};

export default Sessions;
