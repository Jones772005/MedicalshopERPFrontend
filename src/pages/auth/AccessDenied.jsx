import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = ({ requiredPermission }) => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          403 Access Denied
        </h1>
        
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          You do not have permission to view this page or perform this action.
        </p>
        
        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 mb-8 border border-gray-100 dark:border-slate-700 text-left">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-slate-400 block mb-1">Current Role:</span>
            <span className="font-semibold text-gray-900 dark:text-white block mb-3">{currentRole?.name || 'Unknown'}</span>
            
            {requiredPermission && (
              <>
                <span className="text-gray-500 dark:text-slate-400 block mb-1">Required Permission:</span>
                <code className="bg-gray-200 dark:bg-slate-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs">
                  {requiredPermission}
                </code>
              </>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full justify-center" 
          onClick={() => navigate('/dashboard')}
          icon={ArrowLeft}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
