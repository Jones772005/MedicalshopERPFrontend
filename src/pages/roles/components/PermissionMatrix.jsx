/**
 * PermissionMatrix
 *
 * Reusable screen-based permission matrix component.
 * Used in both CreateRole (full page) and EditRoleSheet (side panel).
 *
 * Props:
 *   permissions  – flat { "screen.action": boolean } object
 *   onChange     – (screenId, actionId, value) => void
 *   disabled     – boolean: all checkboxes disabled (Administrator role)
 *   compact      – boolean: smaller padding for the side sheet
 */

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { SCREEN_SECTIONS, permKey } from '../../../data/screenPermissions';

const PermissionMatrix = ({ permissions = {}, onChange, disabled = false, compact = false }) => {
  const [search, setSearch] = useState('');

  // Filter sections/screens based on search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return SCREEN_SECTIONS;
    return SCREEN_SECTIONS
      .map(section => ({
        ...section,
        screens: section.screens.filter(
          screen =>
            screen.label.toLowerCase().includes(q) ||
            section.label.toLowerCase().includes(q)
        ),
      }))
      .filter(section => section.screens.length > 0);
  }, [search]);

  const px = compact ? 'px-4' : 'px-5';
  const py = compact ? 'py-2.5' : 'py-3';

  return (
    <div>
      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className={`${px} pt-4 pb-3`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search screens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-900 text-[#162033] dark:text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2482ED]/30"
          />
        </div>
      </div>

      {/* ── Matrix ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#64748B] dark:text-slate-400">
          No screens match your search.
        </div>
      ) : (
        filtered.map(section => (
          <div key={section.id}>
            {/* Section header */}
            <div className={`${px} pt-4 pb-1.5`}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-[#2482ED] dark:text-blue-400">
                {section.label}
              </p>
            </div>

            {/* Screen rows */}
            {section.screens.map(screen => {
              const allChecked = screen.actions.every(
                a => !!permissions[permKey(screen.id, a.id)]
              );
              const anyChecked = screen.actions.some(
                a => !!permissions[permKey(screen.id, a.id)]
              );
              const indeterminate = anyChecked && !allChecked;

              return (
                <div
                  key={screen.id}
                  className={`${px} ${py} border-b border-[#DDE6F0] dark:border-slate-700/60 hover:bg-[#F5F8FC] dark:hover:bg-[#1A3A5C]/30 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    {/* Screen-level "select all" checkbox */}
                    <input
                      type="checkbox"
                      title={`Toggle all ${screen.label} permissions`}
                      className="mt-[3px] h-3.5 w-3.5 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-[#2482ED] focus:ring-[#2482ED] cursor-pointer flex-shrink-0 disabled:opacity-40"
                      checked={allChecked}
                      ref={el => { if (el) el.indeterminate = indeterminate; }}
                      onChange={e => {
                        screen.actions.forEach(a => onChange(screen.id, a.id, e.target.checked));
                      }}
                      disabled={disabled}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Screen name */}
                      <p className="text-[13px] font-semibold text-[#162033] dark:text-white mb-1.5 leading-tight">
                        {screen.label}
                      </p>
                      {/* Actions row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {screen.actions.map(action => {
                          const key = permKey(screen.id, action.id);
                          return (
                            <label
                              key={action.id}
                              className="inline-flex items-center gap-1.5 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-[#2482ED] focus:ring-[#2482ED] cursor-pointer disabled:opacity-40"
                                checked={!!permissions[key]}
                                onChange={e => onChange(screen.id, action.id, e.target.checked)}
                                disabled={disabled}
                              />
                              <span className="text-[12px] text-[#64748B] dark:text-slate-300">
                                {action.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

export default PermissionMatrix;
