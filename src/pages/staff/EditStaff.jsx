import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoles } from '../../services/rolesApi';
import { getStaffById, updateStaff } from '../../services/staffApi';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', employeeId: '', email: '', phone: '',
    dob: '', gender: 'Male', address: '', department: 'Pharmacy',
    designation: '', role: '', joiningDate: '', status: 'Active', username: ''
  });
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, staffRes] = await Promise.all([
          getRoles(),
          getStaffById(id)
        ]);
        setRoles(rolesRes.data);
        const staff = staffRes.data;
        setFormData({
          firstName: staff.firstName || staff.name.split(' ')[0],
          lastName: staff.lastName || staff.name.split(' ').slice(1).join(' '),
          employeeId: staff.employeeId,
          email: staff.email,
          phone: staff.phone,
          dob: staff.dob,
          gender: staff.gender,
          address: staff.address,
          department: staff.department,
          designation: staff.designation,
          role: staff.role,
          joiningDate: staff.joiningDate,
          status: staff.status,
          username: staff.username
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, name: `${formData.firstName} ${formData.lastName}` };
      await updateStaff(id, payload);
      navigate(`/staff/${id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(`/staff/${id}`)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Edit Staff Profile" description={`Update details for ${formData.firstName} ${formData.lastName}`} />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
              <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"></textarea>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 mt-6">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Sales">Sales (Billing)</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              
              <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700 space-x-3">
            <Button variant="outline" type="button" onClick={() => navigate(`/staff/${id}`)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditStaff;
