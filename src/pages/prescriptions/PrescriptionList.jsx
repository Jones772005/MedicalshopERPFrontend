import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPrescriptions } from '../../services/prescriptionApi';

const PrescriptionStatusBadge = ({ status }) => {
  let colors = 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
  let icon = null;
  
  if (status === 'Verified') {
    colors = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
  } else if (status === 'Pending Verification') {
    colors = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  } else if (status === 'Needs Review') {
    colors = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    icon = <ShieldAlert className="w-3 h-3 mr-1" />;
  } else if (status === 'Rejected') {
    colors = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {icon}
      {status}
    </span>
  );
};

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await getPrescriptions();
        setPrescriptions(res.data);
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const columns = [
    { 
      header: 'Prescription ID', 
      accessor: 'prescriptionId',
      cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.prescriptionId}</span>
    },
    { 
      header: 'Customer', 
      accessor: 'customerName'
    },
    { 
      header: 'Doctor', 
      accessor: 'doctorName'
    },
    { 
      header: 'Date', 
      accessor: 'prescriptionDate',
      cell: (row) => new Date(row.prescriptionDate).toLocaleDateString()
    },
    { 
      header: 'Medicines', 
      accessor: 'medicines',
      cell: (row) => row.medicines.length
    },
    { 
      header: 'Verification Status', 
      accessor: 'verificationStatus',
      cell: (row) => <PrescriptionStatusBadge status={row.verificationStatus} />
    },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/prescriptions/${row.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Prescriptions" 
        description="Manage and verify customer prescriptions."
        action={
          <Button onClick={() => navigate('/prescriptions/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Prescription
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Prescriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{prescriptions.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Pending Verification</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {prescriptions.filter(p => p.verificationStatus === 'Pending Verification').length}
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={prescriptions} 
        searchPlaceholder="Search prescriptions, customers or doctors..."
      />
    </div>
  );
};

export default PrescriptionList;
export { PrescriptionStatusBadge };
