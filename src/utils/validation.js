/**
 * Shared form validation helpers for Medical Shop ERP.
 * Provides consistent validation for Text, Numbers, Dates, Phone, Email, and Passwords.
 */

/**
 * Extracts clean digits from a phone string, stripping +91 or leading 0 if needed.
 */
export const extractMobileDigits = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.trim().replace(/[\s\-().+]/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
};

/**
 * Validates exactly 10-digit Indian mobile number starting with 6, 7, 8, or 9.
 * Accepts formats like: "9876543210", "+91 9876543210", "09876543210", "98765-43210".
 */
export const isValidIndianMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const digits = extractMobileDigits(phone);
  return /^[6-9]\d{9}$/.test(digits);
};

/**
 * Normalizes a phone string to a pure 10-digit Indian mobile string for storage.
 */
export const normalizeIndianMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const digits = extractMobileDigits(phone);
  return digits.length === 10 ? digits : phone.trim();
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return isValidIndianMobile(phone);
};

/**
 * Validates Indian 6-digit postal pincode (100000 to 999999).
 */
export const isValidPincode = (pincode) => {
  if (!pincode || typeof pincode !== 'string') return false;
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
};

/**
 * Validates Indian GSTIN (15 characters: 2 state digits + 10 PAN + 1 entity + Z + 1 check char).
 */
export const isValidGSTIN = (gstin) => {
  if (!gstin || typeof gstin !== 'string') return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase());
};

/**
 * Validates Indian PAN (10 characters: 5 letters + 4 digits + 1 letter).
 */
export const isValidPAN = (pan) => {
  if (!pan || typeof pan !== 'string') return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
};

/**
 * Validates Indian Drug License number (5 to 35 alphanumeric characters with hyphens/slashes).
 */
export const isValidDrugLicense = (dl) => {
  if (!dl || typeof dl !== 'string') return false;
  return /^[A-Za-z0-9/\-\s]{5,35}$/.test(dl.trim());
};

/**
 * Validates Indian GST HSN code (4, 6, or 8 digits).
 */
export const isValidHSN = (hsn) => {
  if (!hsn || typeof hsn !== 'string') return false;
  return /^[0-9]{4,8}$/.test(hsn.trim());
};

/**
 * Validates barcode string (4 to 20 alphanumeric characters or standard numeric formats).
 */
export const isValidBarcode = (barcode) => {
  if (!barcode || typeof barcode !== 'string') return false;
  return /^[A-Za-z0-9-]{4,20}$/.test(barcode.trim());
};

/**
 * Validates UPI Virtual Payment Address (e.g., username@bank).
 */
export const isValidUPI = (upiId) => {
  if (!upiId || typeof upiId !== 'string') return false;
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/.test(upiId.trim());
};

/**
 * Validates monetary amount with at most 2 decimal places.
 */
export const isValidPrice = (val, { min = 0, max = 10000000 } = {}) => {
  if (val === '' || val === null || val === undefined) return false;
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) return false;
  return /^\d+(\.\d{1,2})?$/.test(String(val).trim());
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
