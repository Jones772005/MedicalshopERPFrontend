/**
 * PageHeader — page-level header block.
 *
 * The <h1> page title is now shown in the application Header bar
 * (via resolvePageTitle + useLocation), so we intentionally suppress
 * the duplicate h1 here.
 *
 * Props:
 *   title       — kept for backward-compat / document.title usage (not rendered)
 *   description — optional subtitle text below the title area
 *   action      — optional JSX for right-side action buttons
 */
const PageHeader = ({ title: _title, description, action }) => {
  // Nothing to render if there's no description and no action
  if (!description && !action) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        {description && (
          <p className="text-[13.5px] font-normal leading-relaxed text-[#627D98] dark:text-[#B8CCE0]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
