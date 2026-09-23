import { useState, useEffect } from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAuditLogs } from '../../services/auditApi';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogs();
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    { 
      header: 'Timestamp', 
      accessor: 'timestamp',
      cell: (row) => new Date(row.timestamp).toLocaleString()
    },
    { 
      header: 'User', 
      accessor: 'user',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.user}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">{row.role}</div>
        </div>
      )
    },
    { 
      header: 'Action', 
      accessor: 'action',
      cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.action}</span>
    },
    { header: 'Module', accessor: 'module' },
    { header: 'Record ID', accessor: 'recordId' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Details',
      sortable: false,
      cell: (row) => (
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setSelectedLog(row)}>
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Audit Logs" 
        description="Track all system events and user actions."
      />

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
        <div className="flex">
          <ShieldAlert className="w-5 h-5 text-yellow-500" />
          <div className="ml-3">
            <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Security Notice</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Audit logs are read-only and cannot be modified or deleted. They are retained for compliance purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={logs} searchPlaceholder="Search audit logs by action or user..." />
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                Audit Event Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">Timestamp</span>
                    <span className="block text-sm text-gray-900 dark:text-white">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">Status</span>
                    <StatusBadge status={selectedLog.status} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">User</span>
                    <span className="block text-sm text-gray-900 dark:text-white">{selectedLog.user} ({selectedLog.role})</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">IP Address</span>
                    <span className="block text-sm text-gray-900 dark:text-white">{selectedLog.ipAddress}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">Action</span>
                    <span className="block text-sm font-medium text-primary-600 dark:text-primary-400">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">Module / Record</span>
                    <span className="block text-sm text-gray-900 dark:text-white">{selectedLog.module} / {selectedLog.recordId}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                  <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Details</span>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded text-sm text-gray-800 dark:text-slate-300">
                    {selectedLog.details}
                  </div>
                </div>

                {selectedLog.previousValue && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">Previous Value</span>
                      <span className="block text-sm text-red-600 dark:text-red-400 line-through">{selectedLog.previousValue}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">New Value</span>
                      <span className="block text-sm text-green-600 dark:text-green-400 font-medium">{selectedLog.newValue}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                  <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">User Agent</span>
                  <span className="block text-xs text-gray-600 dark:text-slate-400 break-all">{selectedLog.userAgent}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedLog(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
