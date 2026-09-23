import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStaffMembers } from '../../services/staffApi';
import { PermissionGuard } from '../../utils/permissions';

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaffMembers();
        setStaff(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const columns = [
    { header: 'Emp ID', accessor: 'employeeId', cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.employeeId}</span> },
    { header: 'Name', accessor: 'name', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.name}</span> },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => navigate(`/staff/${row.id}`)}>
            View
          </Button>
          <PermissionGuard permission="staff.edit">
            <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => navigate(`/staff/${row.id}/edit`)}>
              Edit
            </Button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Staff Management" 
        description="Manage employee records, roles, and system access."
        action={
          <PermissionGuard permission="staff.create">
            <Button onClick={() => navigate('/staff/add')}>
              <Plus className="w-4 h-4 mr-2" /> Add Staff
            </Button>
          </PermissionGuard>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={staff} searchPlaceholder="Search staff by name or ID..." />
        )}
      </div>
    </div>
  );
};

export default StaffList;
