import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, PowerOff, Power } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDiscountById, activateDiscount, deactivateDiscount, deleteDiscount } from '../../services/discountApi';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

const getDisplayStatus = (discount) => {
  if (discount.status === 'inactive') return 'Inactive';
  const now = new Date();
  now.setHours(0,0,0,0);
  const nowTime = now.getTime();
  const startStr = typeof discount.validFrom === 'string' && discount.validFrom.length === 10 ? discount.validFrom + 'T00:00:00' : discount.validFrom;
  const endStr = typeof discount.validUntil === 'string' && discount.validUntil.length === 10 ? discount.validUntil + 'T00:00:00' : discount.validUntil;
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (nowTime < start) return 'Scheduled';
  if (nowTime > end) return 'Expired';
  return 'Active';
};

const DiscountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDiscount = async () => {
    setLoading(true);
    try {
      const res = await getDiscountById(id);
      setDiscount(res.data);
    } catch (err) {
      console.error(err);
      navigate('/discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleActivate = async () => {
    if (!window.confirm('Are you sure you want to activate this discount?')) return;
    try {
      await activateDiscount(id);
      fetchDiscount();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('This discount will no longer be eligible for future billing. Continue?')) return;
    try {
      await deactivateDiscount(id);
      fetchDiscount();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to archive this discount?')) return;
    try {
      await deleteDiscount(id);
      navigate('/discounts');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!discount) return <div className="p-8 text-center">Discount not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/discounts')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <PageHeader title={`Discount: ${discount.id}`} description="View promotional discount details." />
      </div>

      <div className="max-w-5xl bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Discount Overview</h2>
          <div className="flex space-x-2">
            {hasPermission(user, 'discounts.manage') && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/discounts/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            {hasPermission(user, 'discounts.activate') && (
              discount.status === 'active' ? (
                <Button variant="outline" size="sm" onClick={handleDeactivate} className="text-orange-500 border-orange-200 hover:bg-orange-50">
                  <PowerOff className="w-4 h-4 mr-2" /> Deactivate
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleActivate} className="text-green-600 border-green-200 hover:bg-green-50">
                  <Power className="w-4 h-4 mr-2" /> Activate
                </Button>
              )
            )}
            {hasPermission(user, 'discounts.manage') && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Archive
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Discount Name</p>
              <p className="font-medium text-gray-900 dark:text-white text-lg">{discount.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Status</p>
              <StatusBadge status={getDisplayStatus(discount)} />
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Medicine</p>
              <p className="font-medium text-gray-900 dark:text-white">{discount.medicineName || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Batch</p>
              <p className="font-medium text-gray-900 dark:text-white">{discount.batchNumber || 'All Batches'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Discount Type</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{discount.discountType}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Discount Value</p>
              <p className="font-medium text-green-600 dark:text-green-400 text-lg">
                {discount.discountType === 'percentage' ? `${discount.discountValue}%` : `₹${discount.discountValue}`}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Maximum Discount</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {discount.maxDiscountAmount ? `₹${discount.maxDiscountAmount}` : '-'}
              </p>
            </div>
            
            <div className="hidden md:block"></div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Valid From</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(discount.validFrom).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Valid Until</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(discount.validUntil).toLocaleDateString()}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Description</p>
              <p className="text-gray-900 dark:text-white">{discount.description || 'No description provided.'}</p>
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-4 mt-2 text-sm text-gray-500 flex justify-between">
              <span>Created At: {new Date(discount.createdAt).toLocaleString()}</span>
              <span>Updated At: {new Date(discount.updatedAt).toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDetails;
