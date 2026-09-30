const SettingsSection = ({ icon: Icon, title, description, children, className = '' }) => {
  return (
    <div className={`space-y-3.5 ${className}`}>
      {title && (
        <div className="space-y-1 mb-3">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-[#2482ED] flex-shrink-0" />}
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#162033] dark:text-slate-100 whitespace-nowrap">
              {title}
            </h3>
            <div className="h-px bg-[#DDE6F0] dark:bg-slate-700/70 flex-1 ml-2"></div>
          </div>
          {description && (
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default SettingsSection;
