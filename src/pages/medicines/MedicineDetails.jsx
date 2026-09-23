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
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
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
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div><dt className="text-sm font-medium text-gray-500">Generic Name</dt><dd className="mt-1 text-sm text-gray-900">{medicine.genericName}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Brand Name</dt><dd className="mt-1 text-sm text-gray-900">{medicine.brandName || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Category</dt><dd className="mt-1 text-sm text-gray-900">{medicine.category}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Manufacturer</dt><dd className="mt-1 text-sm text-gray-900">{medicine.manufacturer}</dd></div>
                <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500">Description</dt><dd className="mt-1 text-sm text-gray-900">{medicine.description || 'No description available.'}</dd></div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Pricing Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><dt className="text-sm font-medium text-gray-500">Purchase Price</dt><dd className="mt-1 text-lg font-semibold text-gray-900">₹{medicine.purchasePrice.toFixed(2)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Selling Price</dt><dd className="mt-1 text-lg font-semibold text-gray-900">₹{medicine.sellingPrice.toFixed(2)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">MRP</dt><dd className="mt-1 text-lg font-semibold text-gray-900">₹{medicine.mrp.toFixed(2)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">GST</dt><dd className="mt-1 text-lg font-semibold text-gray-900">{medicine.gst}%</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <StatusBadge status={medicine.status} />
              </div>
              <dl className="space-y-4">
                <div><dt className="text-sm font-medium text-gray-500">Current Quantity</dt><dd className="mt-1 text-2xl font-bold text-gray-900">{medicine.quantity}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Low Stock Alert At</dt><dd className="mt-1 text-sm font-semibold text-gray-900">{medicine.minimumStockLevel !== undefined ? medicine.minimumStockLevel : 0}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Batch Number</dt><dd className="mt-1 text-sm text-gray-900">{medicine.batchNumber}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Expiry Date</dt><dd className="mt-1 text-sm text-gray-900">{medicine.expiryDate}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Rack Number</dt><dd className="mt-1 text-sm text-gray-900">{medicine.rackNumber || 'Not assigned'}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;
