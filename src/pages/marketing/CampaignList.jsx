import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCampaigns } from '../../services/marketingApi';

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await getCampaigns();
        setCampaigns(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const columns = [
    { header: 'Campaign Name', accessor: 'name', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.name}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Target Audience', accessor: 'targetAudience' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Sent', accessor: 'sentCount', cell: (row) => row.sentCount || 0 },
    { header: 'Conversion Rate', accessor: 'conversionRate', cell: (row) => `${row.conversionRate || 0}%` },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => navigate(`/marketing/analytics?campaign=${row.id}`)}>
            View Stats
          </Button>
          {row.status === 'Draft' && (
            <Button className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700">
              <Send className="w-3 h-3 mr-1" /> Send Now
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="SMS & Email Marketing" 
        description="Manage promotional campaigns for your customers."
        action={
          <Button onClick={() => navigate('/marketing/campaigns/new')}>
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        }
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded shadow-sm">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">Campaign Guidelines</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Ensure you have explicit consent from customers before sending marketing SMS or emails. Promotional messages for prescription drugs are strictly prohibited by law.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={campaigns} searchPlaceholder="Search campaigns..." />
        )}
      </div>
    </div>
  );
};

export default CampaignList;
