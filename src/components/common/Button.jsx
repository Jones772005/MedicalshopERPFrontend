import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'bg-[#2482ED] text-white hover:bg-[#1A6BC7] shadow-sm',
    secondary: 'bg-white dark:bg-[#163A59] text-[#2482ED] dark:text-[#7DD3FC] border border-[#2482ED] dark:border-[#23415C] hover:bg-[#EAF3FE] dark:hover:bg-[#1A4262] focus:ring-[#2482ED]',
    outline: 'border border-[#DDE6F0] dark:border-[#23415C] text-[#162033] dark:text-[#D9E6F2] bg-transparent hover:bg-[#EAF3FE] dark:hover:bg-[#163A59] focus:ring-[#2482ED]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'bg-transparent text-[#64748B] dark:text-[#B8CCE0] hover:bg-[#EAF3FE] dark:hover:bg-[#163A59] hover:text-[#2482ED]',
  };

  const sizes = {
    sm: 'h-8 px-3 py-1.5 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
