import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  getMedicineRequests, 
  createMedicineRequest, 
  updateMedicineRequest, 
  deleteMedicineRequest 
} from '../../services/medicineRequestApi';
import { getCustomers } from '../../services/customerApi'; 

const requestSchema = z.object({
  medicineName: z.string().min(2, 'Medicine name is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().optional(),
  requestedQuantity: z.coerce.number().int('Must be a whole number').positive('Must be positive'),
  requestedDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  status: z.enum(['Pending', 'Fulfilled', 'Cancelled']).default('Pending'),
});

const MedicineRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [customers, setCustomers] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestedDate: new Date().toISOString().split('T')[0],
      requestedQuantity: 1,
      status: 'Pending'
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, custRes] = await Promise.all([
        getMedicineRequests(),
        getCustomers().catch(() => ({ data: [] })) 
      ]);
      setRequests(reqRes.data || []);
      setCustomers(custRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = (req = null) => {
    setSelectedRequest(req);
    if (req) {
      reset({
        medicineName: req.medicineName,
        customerName: req.customerName,
        customerPhone: req.customerPhone || '',
        requestedQuantity: req.requestedQuantity,
        requestedDate: req.requestedDate ? req.requestedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: req.notes || '',
        status: req.status
      });
    } else {
      reset({
        medicineName: '',
        customerName: '',
        customerPhone: '',
        requestedQuantity: 1,
        requestedDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'Pending'
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRequest(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (selectedRequest) {
        await updateMedicineRequest(selectedRequest.id, data);
      } else {
        await createMedicineRequest(data);
      }
      await fetchData();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save request:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      await deleteMedicineRequest(selectedRequest.id);
      await fetchData();
      setIsDeleteOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const openDeleteConfirm = (req) => {
    setSelectedRequest(req);
    setIsDeleteOpen(true);
  };

  const openView = (req) => {
    setSelectedRequest(req);
    setIsViewOpen(true);
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;
  const cancelledRequests = requests.filter(r => r.status === 'Cancelled').length;

  const columns = [
    { header: 'Request ID', accessor: 'id', cell: (row) => <span className="font-medium text-[#2482ED]">{row.id}</span> },
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-semibold">{row.medicineName}</span> },
    { header: 'Customer', accessor: 'customerName', cell: (row) => (
      <div>
        <div className="font-medium">{row.customerName}</div>
        {row.customerPhone && <div className="text-xs text-gray-500">{row.customerPhone}</div>}
      </div>
    )},
    { header: 'Qty', accessor: 'requestedQuantity' },
    { header: 'Date', accessor: 'requestedDate', cell: (row) => new Date(row.requestedDate).toLocaleDateString() },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', accessor: 'id', cell: (row) => (
        <div className="flex space-x-1">
          <button title="View Request" onClick={() => openView(row)} className="p-1.5 rounded text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"><Eye className="w-4 h-4" /></button>
          <button title="Edit Request" onClick={() => handleOpenForm(row)} className="p-1.5 rounded text-[#2482ED] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"><Edit className="w-4 h-4" /></button>
          <button title="Delete Request" onClick={() => openDeleteConfirm(row)} className="p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <PageHeader 
        title="Medicine Requests" 
        description="Track medicines requested by customers that are currently unavailable."
        action={
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" /> Add Medicine Request
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={totalRequests} icon={FileText} trend="neutral" color="blue" />
        <StatCard title="Pending" value={pendingRequests} icon={Clock} trend="neutral" color="amber" />
        <StatCard title="Fulfilled" value={fulfilledRequests} icon={CheckCircle} trend="neutral" color="emerald" />
        <StatCard title="Cancelled" value={cancelledRequests} icon={XCircle} trend="neutral" color="rose" />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
          <CardTitle>Request List</CardTitle>
          <div className="mt-3 sm:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            columns={columns}
            data={filteredRequests}
            loading={loading}
            searchPlaceholder="Search requests..."
            emptyMessage="No medicine requests found."
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl flex flex-col my-8">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedRequest ? 'Edit Medicine Request' : 'Add Medicine Request'}
              </h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="requestForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">Customer Name</label>
                      <input 
                        type="text"
                        list="customer-list"
                        className="flex h-10 w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                        placeholder="Search or enter name..."
                        {...register('customerName')}
                        onChange={(e) => {
                          register('customerName').onChange(e);
                          const cust = customers.find(c => c.name === e.target.value);
                          if (cust && cust.phoneNumber) {
                            setValue('customerPhone', cust.phoneNumber);
                          }
                        }}
                      />
                      <datalist id="customer-list">
                        {customers.map(c => <option key={c.id} value={c.name} />)}
                      </datalist>
                      {errors.customerName && <p className="mt-1 text-sm text-red-500">{errors.customerName.message}</p>}
                    </div>
                    <Input label="Phone Number" placeholder="Customer phone" error={errors.customerPhone?.message} {...register('customerPhone')} />
                  </div>
                </div>

                {/* Request Information */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Request Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input label="Medicine Name" placeholder="e.g. Azithromycin 500mg" error={errors.medicineName?.message} {...register('medicineName')} />
                    <Input label="Quantity" type="number" min="1" step="1" error={errors.requestedQuantity?.message} {...register('requestedQuantity')} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input label="Requested Date" type="date" error={errors.requestedDate?.message} {...register('requestedDate')} />
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">Status</label>
                      <select
                        {...register('status')}
                        className="flex h-10 w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">Notes</label>
                    <textarea 
                      className="w-full rounded-lg border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                      rows="3"
                      placeholder="Additional details..."
                      {...register('notes')}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end space-x-3 shrink-0 bg-gray-50 dark:bg-slate-800/50 rounded-b-xl">
              <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" form="requestForm" isLoading={isSubmitting}>Save Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                Request Details <span className="ml-3 text-sm font-normal text-gray-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">{selectedRequest.id}</span>
              </h2>
              <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  <StatusBadge status={selectedRequest.status} className="mt-1" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                  <div className="font-medium text-gray-900 dark:text-white">{new Date(selectedRequest.requestedDate).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Medicine</div>
                  <div className="font-bold text-gray-900 dark:text-white">{selectedRequest.medicineName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quantity</div>
                  <div className="font-bold text-gray-900 dark:text-white">{selectedRequest.requestedQuantity}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customer</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedRequest.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedRequest.customerPhone || '-'}</div>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-3 rounded-md border border-gray-100 dark:border-slate-700">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
              
              <div className="pt-4 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                {selectedRequest.updatedAt && <span>Updated: {new Date(selectedRequest.updatedAt).toLocaleString()}</span>}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Medicine Request?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to delete the request for <strong>{selectedRequest?.medicineName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Request</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineRequests;
