import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { ArrowLeft, Users, MousePointerClick, MessageCircle, RefreshCw, Megaphone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCampaigns } from '../../services/marketingApi';

const MarketingAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialParamCampaignId = queryParams.get('campaign');

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await getCampaigns();
        const list = res.data || [];
        setCampaigns(list);
        if (list.length > 0) {
          const match = initialParamCampaignId ? list.find(c => String(c.id) === String(initialParamCampaignId)) : null;
          setSelectedCampaignId(match ? match.id : list[0].id);
        }
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [initialParamCampaignId]);

  if (loading) return <LoadingSpinner />;

  const currentCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const overview = currentCampaign ? {
    sent: currentCampaign.qrScans || 0,
    delivered: currentCampaign.websiteVisits || 0,
    opened: currentCampaign.offerViews || 0,
    clicked: currentCampaign.couponUsage || 0,
    conversions: currentCampaign.newCustomers || 0
  } : { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0 };

  const openRate = overview.delivered > 0 ? ((overview.opened / overview.delivered) * 100).toFixed(1) : '0.0';
  const clickRate = overview.opened > 0 ? ((overview.clicked / overview.opened) * 100).toFixed(1) : '0.0';
  const convRate = overview.clicked > 0 ? ((overview.conversions / overview.clicked) * 100).toFixed(1) : '0.0';

  const funnelData = [
    { name: 'Delivered', value: overview.delivered },
    { name: 'Opened', value: overview.opened },
    { name: 'Clicked', value: overview.clicked },
    { name: 'Converted', value: overview.conversions }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/marketing/campaigns')} 
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Marketing Analytics" description="Track the performance of your campaigns." />
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Marketing Campaigns Found</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Create promotional campaigns to track engagement, impressions, customer visits, and conversions.
          </p>
          <button
            onClick={() => navigate('/marketing/campaigns/new')}
            className="inline-flex items-center px-4 py-2 bg-[#2482ED] text-white text-sm font-medium rounded-lg hover:bg-[#1A6BC7] transition-colors"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Campaign to View Stats</label>
            <select 
              className="block w-full max-w-md rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={selectedCampaignId || ''}
              onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.campaignName || c.name || `Campaign #${c.id}`}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-slate-400 mb-2 flex justify-center"><MessageCircle className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Sent</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.sent}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-slate-400 mb-2 flex justify-center"><Users className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Delivered</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.delivered}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-blue-500 mb-2 flex justify-center"><RefreshCw className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Opened</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overview.opened}</div>
              <div className="text-xs text-gray-400 mt-1">{openRate}% Open Rate</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-purple-500 mb-2 flex justify-center"><MousePointerClick className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Clicked</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overview.clicked}</div>
              <div className="text-xs text-gray-400 mt-1">{clickRate}% Click Rate</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-green-500 mb-2 flex justify-center"><span className="text-lg font-bold">₹</span></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Conversions</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{overview.conversions}</div>
              <div className="text-xs text-gray-400 mt-1">{convRate}% Conv. Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Engagement Funnel</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Campaign Revenue Impact</h3>
              <p className="text-3xl font-extrabold text-[#2482ED] my-4">
                ₹{((currentCampaign?.revenue) || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
                Total direct sales generated from this campaign coupon and promotional links.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketingAnalytics;
