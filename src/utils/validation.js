/**
 * Shared form validation helpers for Medical Shop ERP.
 * Provides consistent validation for Text, Numbers, Dates, Phone, Email, and Passwords.
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim();
  // Accepts standard international/domestic phone formats between 7 and 15 digits
  return /^[0-9+\-\s()]{7,15}$/.test(cleaned) && cleaned.replace(/\D/g, '').length >= 7;
};

export const isNonEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const isValidNumber = (value, { min, max, positive = false, allowZero = true, integer = false } = {}) => {
  if (value === '' || value === null || value === undefined) return false;
  const num = Number(value);
  if (isNaN(num)) return false;
  if (integer && !Number.isInteger(num)) return false;
  if (positive && num <= 0) return false;
  if (!allowZero && num === 0) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const isValidDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
};

export const isDateAfterOrEqual = (dateAfter, dateBefore) => {
  if (!isValidDate(dateAfter) || !isValidDate(dateBefore)) return false;
  return new Date(dateAfter).getTime() >= new Date(dateBefore).getTime();
};

/**
 * Triggers a compact amber validation toast notification and scrolls/focuses to the first invalid field.
 * @param {number|Array|Object} fieldCountOrErrors - Number of invalid fields, array of field names, or error object
 * @param {Object} [options] - Optional overrides { title, message, firstField }
 */
export const notifyValidationError = (fieldCountOrErrors, options = {}) => {
  let count = 0;
  let firstFieldName = options.firstField || null;

  if (typeof fieldCountOrErrors === 'number') {
    count = fieldCountOrErrors;
  } else if (Array.isArray(fieldCountOrErrors)) {
    count = fieldCountOrErrors.length;
    if (count > 0 && !firstFieldName) {
      firstFieldName = fieldCountOrErrors[0];
    }
  } else if (fieldCountOrErrors && typeof fieldCountOrErrors === 'object') {
    const keys = Object.keys(fieldCountOrErrors).filter(k => fieldCountOrErrors[k]);
    count = keys.length;
    if (count > 0 && !firstFieldName) {
      firstFieldName = keys[0];
    }
  }

  const message = options.message || (
    count > 1
      ? `${count} required fields need attention.`
      : count === 1
      ? '1 required field needs attention.'
      : 'Please fill in all required fields before saving.'
  );

  const title = options.title || 'Required fields missing';

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('erp:validation-toast', {
        detail: {
          title,
          message,
          count,
        },
      })
    );
  }

  // Automatically focus and scroll to the first invalid field
  focusFirstInvalidField(firstFieldName);
};

export const focusFirstInvalidField = (firstKey) => {
  if (typeof document === 'undefined') return;

  setTimeout(() => {
    if (firstKey && typeof firstKey === 'string') {
      const escapedKey = firstKey.replace(/[[\]]/g, '\\$&');
      const el = document.querySelector(
        `[name="${escapedKey}"], #${firstKey}, [data-name="${firstKey}"], [aria-label*="${firstKey}" i]`
      );
      if (el && typeof el.focus === 'function') {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    const invalidEl = document.querySelector(
      '.border-red-500, [aria-invalid="true"], input:invalid, select:invalid, textarea:invalid'
    );
    if (invalidEl && typeof invalidEl.focus === 'function') {
      invalidEl.focus();
      invalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 60);
};
