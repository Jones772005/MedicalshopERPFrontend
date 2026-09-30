/**
 * EditRoleSheet
 *
 * Right-side slide-over sheet for editing a role's screen-based permissions.
 *
 * Animation lifecycle:
 *   1. On open (roleId becomes non-null):
 *      - Mount via portal
 *      - 2× rAF: set isOpen=true → CSS transition slides in from right
 *
 *   2. On close (X / Cancel / backdrop / Escape):
 *      - Set isOpen=false → CSS transition slides back to translateX(100%)
 *      - After ANIM_MS timeout: call onClose so parent clears roleId
 *
 * Reuses:
 *   - getRoleById           (same as EditRole page)
 *   - updateRolePermissions (same as EditRole page)
 *   - migratePermissions    (in case stored role is still in old format)
 *   - PermissionMatrix      (shared with CreateRole)
 *   - Administrator guard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Settings } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoleById, updateRolePermissions } from '../../services/rolesApi';
import { migratePermissions } from '../../data/screenPermissions';
import PermissionMatrix from './components/PermissionMatrix';

const ANIM_MS = 280;

const EditRoleSheet = ({ roleId, onClose, onSaved }) => {
  // ── Animation state ──────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef(null);

  // ── Role data state ──────────────────────────────────────────────────────
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Slide-IN when roleId is set ──────────────────────────────────────────
  useEffect(() => {
    if (roleId) {
      // eslint-disable-next-line react/set-state-in-effect
      setRole(null);
      setPermissions({});
      setSaveError('');
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsOpen(true));
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [roleId]);

  // ── Load role data ────────────────────────────────────────────────────────
  const fetchRole = useCallback(async () => {
    if (!roleId) return;
    setLoading(true);
    setSaveError('');
    try {
      const res = await getRoleById(roleId);
      const loadedRole = res.data;
      // Migrate permissions in case this role still has old nested format
      const migratedPerms = migratePermissions(loadedRole.permissions);
      setRole(loadedRole);
      setPermissions(migratedPerms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchRole();
  }, [fetchRole]);

  // ── Trigger close animation, then notify parent ───────────────────────────
  const triggerClose = useCallback(() => {
    setIsOpen(false);
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, ANIM_MS);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roleId) return;
    const handler = (e) => { if (e.key === 'Escape') triggerClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [roleId, triggerClose]);

  // ── Permission change from PermissionMatrix ───────────────────────────────
  const handlePermissionChange = (screenId, actionId, value) => {
    const key = `${screenId}.${actionId}`;
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  // ── Save — same API call as EditRole page ─────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await updateRolePermissions(roleId, permissions);
      onSaved();
      triggerClose();
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (!roleId) return null;

  const isAdmin = role?.name === 'Administrator';

  const sheet = (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={triggerClose}
        style={{
          transition: `opacity ${ANIM_MS}ms ease`,
          opacity: isOpen ? 1 : 0,
        }}
        className="fixed inset-0 bg-black/30 z-[200]"
      />

      {/* ── Sheet panel ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Role"
        style={{
          transition: `transform ${ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        className={[
          'fixed top-0 right-0 h-full z-[210]',
          'w-full sm:w-[82vw] md:w-[560px]',
          'flex flex-col',
          'bg-white dark:bg-[#132B42]',
          'shadow-[-4px_0_40px_rgba(0,0,0,0.14)]',
        ].join(' ')}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE6F0] dark:border-[#263B50] flex-shrink-0 bg-white dark:bg-[#132B42]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF2FF] dark:bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-[#2482ED]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#162033] dark:text-white leading-tight">
                Edit Role
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                {role ? role.name : 'Update role details and permissions.'}
              </p>
            </div>
          </div>
          <button
            onClick={triggerClose}
            aria-label="Close edit role sheet"
            className="p-2 rounded-lg text-[#64748B] hover:text-[#162033] hover:bg-[#F5F8FC] dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#1A3A5C] transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body (scrollable) ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : !role ? (
            <div className="p-8 text-center text-[#64748B] dark:text-slate-400 text-sm">
              Role not found.
            </div>
          ) : (
            <>
              {/* Administrator notice */}
              {isAdmin && (
                <div className="mx-5 mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-sm">
                  Administrator permissions cannot be modified. They always have full access.
                </div>
              )}

              {/* Save error */}
              {saveError && (
                <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                  {saveError}
                </div>
              )}

              {/* Screen-based Permission Matrix */}
              <PermissionMatrix
                permissions={permissions}
                onChange={handlePermissionChange}
                disabled={isAdmin}
                compact={true}
              />
            </>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE6F0] dark:border-[#263B50] bg-[#F5F8FC] dark:bg-slate-900/50 flex-shrink-0">
          <Button variant="outline" onClick={triggerClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isAdmin || loading || !role}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(sheet, document.body);
};

export default EditRoleSheet;
