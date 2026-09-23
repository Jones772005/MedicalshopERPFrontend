import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPrescriptionById, verifyPrescription } from '../../services/prescriptionApi';
import { PrescriptionStatusBadge } from './PrescriptionList';
import { useAuth } from '../../context/AuthContext';

const PrescriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // for checking if user can verify
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchRx = async () => {
    try {
      const res = await getPrescriptionById(id);
      setPrescription(res.data);
      setNotes(res.data.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchRx();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerifyAction = async (status) => {
    setVerifying(true);
    try {
      await verifyPrescription(id, { status, notes });
      await // eslint-disable-next-line react/set-state-in-effect
    fetchRx();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!prescription) return <div className="p-8 text-center text-gray-500">Prescription not found.</div>;

  const canVerify = currentUser?.role === 'Admin' || currentUser?.role === 'Pharmacist';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/prescriptions')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Details</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{prescription.prescriptionId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 dark:text-slate-400">Customer</span>
                <span className="font-medium text-gray-900 dark:text-white">{prescription.customerName}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-slate-400">Doctor</span>
                <span className="font-medium text-gray-900 dark:text-white">{prescription.doctorName}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-slate-400">Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Date(prescription.prescriptionDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-slate-400">Status</span>
                <div className="mt-1"><PrescriptionStatusBadge status={prescription.verificationStatus} /></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prescribed Medicines</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                <thead className="bg-white dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-slate-400">Medicine</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-slate-400">Dosage</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-slate-400">Frequency & Duration</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-slate-400">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {prescription.medicines.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{item.medicineName}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{item.dosage}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                        {item.frequency} for {item.duration}
                        {item.instructions && <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.instructions}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Document */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Document</h2>
            <div className="aspect-[3/4] bg-gray-100 dark:bg-slate-900 rounded flex flex-col items-center justify-center border border-gray-200 dark:border-slate-700">
              {/* Mock Document Preview */}
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Document Preview</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 break-all px-4 text-center">{prescription.documentName}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Verification Panel</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pharmacist Notes</label>
              <textarea 
                className="w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:ring-primary-500"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canVerify || prescription.verificationStatus === 'Verified'}
                placeholder="Enter notes regarding dosage, alternatives, or verification steps..."
              />
            </div>

            {prescription.verificationStatus === 'Verified' ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 text-sm">
                <p className="font-semibold text-green-800 dark:text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> Verified
                </p>
                <p className="text-green-600 dark:text-green-500 mt-1">Verified by {prescription.verifiedBy} on {new Date(prescription.verifiedAt).toLocaleDateString()}</p>
              </div>
            ) : canVerify ? (
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleVerifyAction('Verified')}
                  disabled={verifying}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve & Verify
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                    onClick={() => handleVerifyAction('Needs Review')}
                    disabled={verifying}
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" /> Needs Review
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                    onClick={() => handleVerifyAction('Rejected')}
                    disabled={verifying}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-400">
                You do not have permission to verify prescriptions.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionDetails;
