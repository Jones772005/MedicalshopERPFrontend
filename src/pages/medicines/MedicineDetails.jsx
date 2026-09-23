import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicine } from '../../services/medicineApi';
import { getInventory } from '../../services/inventoryApi';
import { calculateAvailableStock } from '../../utils/stockUtils';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMed = async () => {
      try {
        const [res, invRes] = await Promise.all([
          getMedicine(id),
          getInventory()
        ]);
        const medData = res.data;
        const invItems = invRes.data || [];
        medData.quantity = calculateAvailableStock(invItems, medData.id);
        
        // Dynamic status based on computed quantity
        const threshold = medData.minimumStockLevel !== undefined && !isNaN(medData.minimumStockLevel) ? Number(medData.minimumStockLevel) : 0;
        if (medData.quantity === 0) {
          medData.status = 'Out of Stock';
        } else if (medData.quantity <= threshold) {
          medData.status = 'Low Stock';
        } else {
          medData.status = 'Normal';
        }

        setMedicine(medData);
      } catch (error) {
        console.error(error);
        navigate('/medicines');
      } finally {
        setLoading(false);
      }
    };
    fetchMed();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2482ED]"></div></div>;
  }

  if (!medicine) return null;

  return (
    <div>
      <PageHeader 
        title={medicine.name} 
        description="Detailed medicine information and current stock status."
        action={
          <div className="space-x-3">
            <Button variant="secondary" onClick={() => navigate('/medicines')}>Back to List</Button>
            <Button onClick={() => navigate(`/medicines/${medicine.id}/edit`)}>Edit Medicine</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
            <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
              <CardTitle className="text-[15px] text-[#162033] dark:text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Generic Name</dt><dd className="mt-1.5 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.genericName}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Brand Name</dt><dd className="mt-1.5 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.brandName || '-'}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Category</dt><dd className="mt-1.5 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.category}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Manufacturer</dt><dd className="mt-1.5 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.manufacturer}</dd></div>
                <div className="sm:col-span-2"><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Description</dt><dd className="mt-1.5 text-[13px] text-[#162033] dark:text-slate-300 leading-relaxed">{medicine.description || 'No description available.'}</dd></div>
              </dl>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
            <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
              <CardTitle className="text-[15px] text-[#162033] dark:text-white">Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Purchase</dt><dd className="mt-1 text-[16px] font-bold text-[#2482ED] dark:text-[#38BDF8]">₹{medicine.purchasePrice.toFixed(2)}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Selling</dt><dd className="mt-1 text-[16px] font-bold text-[#2482ED] dark:text-[#38BDF8]">₹{medicine.sellingPrice.toFixed(2)}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">MRP</dt><dd className="mt-1 text-[16px] font-bold text-[#162033] dark:text-white">₹{medicine.mrp.toFixed(2)}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">GST</dt><dd className="mt-1 text-[16px] font-bold text-[#162033] dark:text-slate-200">{medicine.gst}%</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
            <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
              <CardTitle className="text-[15px] text-[#162033] dark:text-white">Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="mb-5">
                <StatusBadge status={medicine.status} />
              </div>
              <dl className="space-y-5">
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Current Quantity</dt><dd className="mt-1 text-[22px] font-black text-[#162033] dark:text-white">{medicine.quantity}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Low Stock Alert At</dt><dd className="mt-1 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.minimumStockLevel !== undefined ? medicine.minimumStockLevel : 0}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Batch Number</dt><dd className="mt-1 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.batchNumber}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Expiry Date</dt><dd className="mt-1 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.expiryDate}</dd></div>
                <div><dt className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Rack Number</dt><dd className="mt-1 text-[14px] font-semibold text-[#162033] dark:text-slate-200">{medicine.rackNumber || 'Not assigned'}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;
