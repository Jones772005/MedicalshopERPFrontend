/**
 * PageHeader / PageToolbar — standardized compact toolbar across all ERP pages.
 *
 * Placed immediately below the application header:
 * - Left: Useful contextual information (e.g. record counts, badges, filters) when available.
 * - Right: Primary actions, buttons, and controls.
 * - Redundant subtitles and duplicate page titles are suppressed.
 * - Renders nothing if there is no contextual info and no action.
 */
const PageHeader = ({ 
  title: _title, 
  description: _description, // Redundant subtitles suppressed globally
  info,
  count,
  countLabel = 'records',
  children,
  action,
  className = ''
}) => {
  const hasLeftContent = Boolean(children || info || (count !== undefined && count !== null));

  // Nothing to render if there's no contextual info and no action
  if (!hasLeftContent && !action) return null;

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5 min-h-[36px] ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
        {count !== undefined && count !== null && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            {typeof count === 'number' ? count.toLocaleString('en-IN') : count} {countLabel}
          </span>
        )}
        {info && (
          <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
            {info}
          </span>
        )}
        {children}
      </div>

      {action && (
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
