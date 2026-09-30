import Button from '../common/Button';
import { Save } from 'lucide-react';

const SettingsHeader = ({
  icon: Icon,
  title,
  description,
  onSave,
  saving = false,
  saveDisabled = false,
  hasUnsavedChanges = false,
  children
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE6F0] dark:border-slate-700/60 pb-4 mb-6">
      <div className="flex items-start sm:items-center space-x-3 min-w-0">
        {Icon && (
          <div className="p-2.5 rounded-lg bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#162033] dark:text-white leading-tight truncate">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
        {hasUnsavedChanges && (
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full">
            Unsaved changes
          </span>
        )}
        {children}
        {onSave && (
          <Button 
            type="button"
            onClick={onSave} 
            disabled={saving || saveDisabled}
            className="h-9 px-4 text-xs font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SettingsHeader;
