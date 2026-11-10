import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Shield, Briefcase, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStaffById } from '../../services/staffApi';
import { PermissionGuard } from '../../utils/permissions';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaffById(id);
        setStaff(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!staff) return <div className="p-8 text-center text-gray-500">Staff member not found.</div>;

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/staff')} className="p-1.5 h-auto text-[#64748B] hover:text-[#162033] dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Back to Staff List</span>
          </Button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            {staff.name}
          </span>
          <StatusBadge status={staff.status} />
        </div>
        <PermissionGuard permission="staff.edit">
          <Button size="sm" onClick={() => navigate(`/staff/${staff.id}/edit`)} className="self-end sm:self-auto">
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info & Employment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Gender</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Date of Birth</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.dob}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary-500" /> Employment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Employee ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Department</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Designation</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Joining Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.joiningDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account, Metrics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary-500" /> Account & Security
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Username</p>
                <p className="font-medium text-gray-900 dark:text-white">{staff.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">System Role</p>
                <p className="font-medium text-primary-600 dark:text-primary-400">{staff.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Last Login</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(staff.lastLogin).toLocaleString()}</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full justify-center text-sm" onClick={() => alert("Password reset link sent to email")}>
                  Reset Password
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-lg shadow-sm border border-blue-100 dark:border-indigo-800/30 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-blue-200 dark:border-indigo-800/30 pb-2 mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Total Sales</span>
                <span className="font-bold text-gray-900 dark:text-white">{staff.metrics?.sales || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Invoices Created</span>
                <span className="font-bold text-gray-900 dark:text-white">{staff.metrics?.invoices || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Purchases Handled</span>
                <span className="font-bold text-gray-900 dark:text-white">{staff.metrics?.purchases || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Rx Verified</span>
                <span className="font-bold text-gray-900 dark:text-white">{staff.metrics?.prescriptions || 0}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDetails;
