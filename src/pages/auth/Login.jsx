import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeartPulse, Eye, EyeOff, Key, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { usersData as demoUsers } from '../../data/users';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@medishop.com',
      password: 'demo123',
    }
  });

  const handleDemoLogin = (email) => {
    setValue('email', email);
    setValue('password', 'demo123');
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data) => {
    try {
      setLoginError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <HeartPulse className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Medi<span className="text-primary-600 dark:text-primary-400">ERP</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          Professional Medical Shop Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@medishop.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 text-gray-400 hover:text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-slate-300 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-2.5"
                isLoading={isSubmitting}
              >
                Sign in to ERP
              </Button>
            </div>
          </form>

          {/* Demo Login Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-slate-300 mb-4 flex items-center justify-center">
              <Key className="w-4 h-4 mr-2" />
              Demo Testing Accounts
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleDemoLogin(user.email)}
                  disabled={isSubmitting}
                  className="flex items-center text-left px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mr-3 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{user.role}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Click any account above to instantly log in with appropriate role permissions. Password is <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
