import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'bg-[#1677FF] text-white hover:bg-[#1254A6] shadow-sm',
    secondary: 'bg-white dark:bg-[#163A59] text-[#1677FF] dark:text-[#7DD3FC] border border-[#1677FF] dark:border-[#23415C] hover:bg-[#EAF4FF] dark:hover:bg-[#1A4262] focus:ring-[#1677FF]',
    outline: 'border border-[#D9E6F2] dark:border-[#23415C] text-[#102A43] dark:text-[#D9E6F2] bg-transparent hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] focus:ring-[#1677FF]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'bg-transparent text-[#627D98] dark:text-[#B8CCE0] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] hover:text-[#1677FF]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
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
