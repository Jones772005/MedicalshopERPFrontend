import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { ArrowLeft, Users, MousePointerClick, MessageCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const mockCampaigns = [
  { id: 1, name: 'Winter Wellness Promo' },
  { id: 2, name: 'Diwali Special Offers' },
  { id: 3, name: 'Chronic Patient Refill Reminder' }
];

const mockAnalytics = {
  1: {
    overview: { sent: 1250, delivered: 1200, opened: 850, clicked: 320, conversions: 45 },
    engagementTrend: [
      { day: 'Day 1', opens: 300, clicks: 120 },
      { day: 'Day 2', opens: 250, clicks: 80 },
      { day: 'Day 3', opens: 150, clicks: 60 },
      { day: 'Day 4', opens: 100, clicks: 40 },
      { day: 'Day 5', opens: 50, clicks: 20 },
    ],
    deviceStats: [
      { name: 'Mobile', value: 75 },
      { name: 'Desktop', value: 25 }
    ]
  },
  2: {
    overview: { sent: 5000, delivered: 4800, opened: 3200, clicked: 1500, conversions: 210 },
    engagementTrend: [
      { day: 'Day 1', opens: 1500, clicks: 700 },
      { day: 'Day 2', opens: 1000, clicks: 400 },
      { day: 'Day 3', opens: 400, clicks: 250 },
      { day: 'Day 4', opens: 200, clicks: 100 },
      { day: 'Day 5', opens: 100, clicks: 50 },
    ],
    deviceStats: [
      { name: 'Mobile', value: 85 },
      { name: 'Desktop', value: 15 }
    ]
  },
  3: {
    overview: { sent: 300, delivered: 295, opened: 280, clicked: 150, conversions: 85 },
    engagementTrend: [
      { day: 'Day 1', opens: 200, clicks: 100 },
      { day: 'Day 2', opens: 50, clicks: 30 },
      { day: 'Day 3', opens: 20, clicks: 10 },
      { day: 'Day 4', opens: 5, clicks: 5 },
      { day: 'Day 5', opens: 5, clicks: 5 },
    ],
    deviceStats: [
      { name: 'Mobile', value: 90 },
      { name: 'Desktop', value: 10 }
    ]
  }
};

const MarketingAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultCampaignId = queryParams.get('campaign') || '1';

  const [selectedCampaign, setSelectedCampaign] = useState(Number(defaultCampaignId));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setData(mockAnalytics[selectedCampaign] || mockAnalytics[1]);
      setLoading(false);
    }, 500);
  }, [selectedCampaign]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/marketing/campaigns')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Marketing Analytics" description="Track the performance of your campaigns." />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Campaign to View Stats</label>
        <select 
          className="block w-full max-w-md rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(Number(e.target.value))}
        >
          {mockCampaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-slate-400 mb-2 flex justify-center"><MessageCircle className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Sent</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.sent}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-slate-400 mb-2 flex justify-center"><Users className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Delivered</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.delivered}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-blue-500 mb-2 flex justify-center"><RefreshCw className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Opened</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.overview.opened}</div>
              <div className="text-xs text-gray-400 mt-1">{((data.overview.opened / data.overview.delivered) * 100).toFixed(1)}% Open Rate</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-purple-500 mb-2 flex justify-center"><MousePointerClick className="w-5 h-5" /></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Clicked</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.overview.clicked}</div>
              <div className="text-xs text-gray-400 mt-1">{((data.overview.clicked / data.overview.opened) * 100).toFixed(1)}% Click Rate</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-center">
              <div className="text-green-500 mb-2 flex justify-center"><span className="text-lg font-bold">₹</span></div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Conversions</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.overview.conversions}</div>
              <div className="text-xs text-gray-400 mt-1">{((data.overview.conversions / data.overview.clicked) * 100).toFixed(1)}% Conv. Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Engagement Trend (First 5 Days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                    <Legend />
                    <Line type="monotone" dataKey="opens" name="Opens" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Engagement Funnel</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Delivered', value: data.overview.delivered },
                    { name: 'Opened', value: data.overview.opened },
                    { name: 'Clicked', value: data.overview.clicked },
                    { name: 'Converted', value: data.overview.conversions }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketingAnalytics;
