import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getRoles } from '../../services/rolesApi';
import { createStaff } from '../../services/staffApi';

const CreateStaff = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', employeeId: '', email: '', phone: '',
    dob: '', gender: 'Male', address: '', department: 'Pharmacy',
    designation: '', role: 'Pharmacist', joiningDate: '',
    username: '', password: '', confirmPassword: ''
  });
  
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRoles().then(res => setRoles(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, name: `${formData.firstName} ${formData.lastName}` };
      await createStaff(payload);
      navigate('/staff');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/staff')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Add New Staff" description="Register a new employee and set up their system access." />
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
              <Input label="Employee ID" name="employeeId" placeholder="e.g. EMP-1005" value={formData.employeeId} onChange={handleChange} required />
              <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Sales">Sales (Billing)</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              
              <Input label="Designation" name="designation" placeholder="e.g. Junior Pharmacist" value={formData.designation} onChange={handleChange} required />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 mt-6">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Username" name="username" value={formData.username} onChange={handleChange} required />
              <div></div>
              <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
              <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Passwords are hashed before saving. We simulate this by not persisting plain text.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Register Staff'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateStaff;
