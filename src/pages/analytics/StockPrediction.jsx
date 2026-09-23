import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Lightbulb, Info, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStockPredictions } from '../../services/analyticsApi';

const StockPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await getStockPredictions();
        setPredictions(res.data);
        if (res.data.length > 0) {
          setSelectedMed(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!selectedMed) return <div>No prediction data available.</div>;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Smart Stock Prediction" 
        description="Demand forecasting based on historical sales trends."
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded shadow-sm">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-400 dark:text-blue-500" />
          <div className="ml-3">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">Important Disclaimer</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              These predictions are estimates based on mock algorithms and historical sales data. 
              They are not guaranteed outcomes and should be used as recommendations to assist human decision-making.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: List of predicted items */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">Predicted Items</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {predictions.map(pred => (
              <button
                key={pred.medicineId}
                onClick={() => setSelectedMed(pred)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedMed.medicineId === pred.medicineId 
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-750 border border-transparent'
                }`}
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm">{pred.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    pred.riskLevel === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {pred.riskLevel} Risk
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Prediction details & Chart */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMed.name}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Demand Forecast Analysis</p>
              </div>
              <div className="mt-2 sm:mt-0 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 rounded-full text-sm font-medium flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" /> AI Recommendation
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-md border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Current Stock</p>
                <p className={`text-lg font-bold ${selectedMed.currentStock < selectedMed.forecastDemand ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {selectedMed.currentStock} units
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-md border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Avg Daily Sales</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedMed.averageDailySales}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-md border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">30-Day Forecast</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedMed.forecastDemand} units</p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-md border border-primary-200 dark:border-primary-800">
                <p className="text-xs text-primary-600 dark:text-primary-400 mb-1 font-semibold">Recommended Stock</p>
                <p className="text-lg font-bold text-primary-700 dark:text-primary-300">{selectedMed.recommendedStock} units</p>
              </div>
            </div>

            {selectedMed.riskLevel === 'High' && (
              <div className="flex items-center p-3 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded border border-red-200 dark:border-red-800 text-sm">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                Estimated stock may fall below minimum level based on current velocity. Immediate reorder recommended.
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historical vs Forecast Demand</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={selectedMed.historicalDemand} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                  <Legend />
                  <Bar dataKey="sales" name="Actual Sales" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="forecast" name="Forecasted Sales" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, fill: '#f59e0b'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockPrediction;
