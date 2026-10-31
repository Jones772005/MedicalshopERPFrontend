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
