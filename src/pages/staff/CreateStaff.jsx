import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getRoles } from '../../services/rolesApi';
import { createStaff } from '../../services/staffApi';
import { isValidIndianMobile, normalizeIndianMobile, isValidEmail, notifyValidationError } from '../../utils/validation';

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getRoles().then(res => setRoles(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!isValidIndianMobile(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number (e.g., 9876543210)';
    }

    if (!formData.dob) {
      errs.dob = 'Date of birth is required';
    }

    if (!formData.employeeId.trim()) {
      errs.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.trim().length < 2) {
      errs.employeeId = 'Employee ID must be at least 2 characters';
    }

    if (!formData.joiningDate) {
      errs.joiningDate = 'Joining date is required';
    }

    if (!formData.designation.trim()) {
      errs.designation = 'Designation is required';
    } else if (formData.designation.trim().length < 2) {
      errs.designation = 'Designation must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9._]{3,20}$/.test(formData.username.trim())) {
      errs.username = 'Username must be 3-20 characters (letters, numbers, dot, underscore)';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notifyValidationError(errs);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: normalizeIndianMobile(formData.phone),
        employeeId: formData.employeeId.trim(),
        designation: formData.designation.trim(),
        username: formData.username.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
      };
      await createStaff(payload);
      navigate('/staff');
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to register staff.' }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/staff')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Add New Staff" description="Register a new employee and set up their system access." />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        {errors.form && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {errors.form}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required error={errors.firstName} />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required error={errors.lastName} />
              <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required error={errors.email} />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required error={errors.phone} />
              <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required error={errors.dob} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
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
              <Input label="Employee ID" name="employeeId" placeholder="e.g. EMP-1005" value={formData.employeeId} onChange={handleChange} required error={errors.employeeId} />
              <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required error={errors.joiningDate} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select name="department" value={formData.department} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Sales">Sales (Billing)</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              
              <Input label="Designation" name="designation" placeholder="e.g. Junior Pharmacist" value={formData.designation} onChange={handleChange} required error={errors.designation} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Role <span className="text-red-500">*</span>
                </label>
                <select name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 mt-6">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Username" name="username" value={formData.username} onChange={handleChange} required error={errors.username} />
              <div></div>
              <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required error={errors.password} />
              <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required error={errors.confirmPassword} />
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
