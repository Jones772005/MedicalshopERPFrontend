import localDb from '../services/localDb';
import { KEYS } from '../data/storageKeys';
import { mockSettings } from '../data/settings';

/**
 * Creates a comprehensive, immutable snapshot of the pharmacy branding
 * at the exact moment a business transaction document is created.
 * 
 * Captures all configurable identity fields so that historical documents
 * remain completely immutable even if the Administrator changes Settings.
 */
export const getPharmacySnapshot = () => {
  try {
    const allSettings = localDb.get(KEYS.SETTINGS);
    const pharmacy = (allSettings && typeof allSettings === 'object' && !Array.isArray(allSettings) && allSettings.pharmacy)
      ? allSettings.pharmacy
      : mockSettings.pharmacy;

    return {
      name: pharmacy?.name?.trim() || mockSettings.pharmacy.name,
      logo: pharmacy?.logo || null,
      owner: pharmacy?.owner || mockSettings.pharmacy.owner || '',
      registrationNo: pharmacy?.registrationNo || mockSettings.pharmacy.registrationNo || '',
      drugLicenseNo: pharmacy?.drugLicenseNo || mockSettings.pharmacy.drugLicenseNo || '',
      gstin: pharmacy?.gstin || mockSettings.pharmacy.gstin || '',
      phone: pharmacy?.phone || mockSettings.pharmacy.phone || '',
      email: pharmacy?.email || mockSettings.pharmacy.email || '',
      address: pharmacy?.address || mockSettings.pharmacy.address || '',
      city: pharmacy?.city || mockSettings.pharmacy.city || '',
      state: pharmacy?.state || mockSettings.pharmacy.state || '',
      pincode: pharmacy?.pincode || mockSettings.pharmacy.pincode || '',
      website: pharmacy?.website || mockSettings.pharmacy.website || '',
      snapshotAt: new Date().toISOString()
    };
  } catch {
    return {
      name: mockSettings.pharmacy.name,
      logo: null,
      owner: mockSettings.pharmacy.owner || '',
      registrationNo: mockSettings.pharmacy.registrationNo || '',
      drugLicenseNo: mockSettings.pharmacy.drugLicenseNo || '',
      gstin: mockSettings.pharmacy.gstin || '',
      phone: mockSettings.pharmacy.phone || '',
      email: mockSettings.pharmacy.email || '',
      address: mockSettings.pharmacy.address || '',
      city: mockSettings.pharmacy.city || '',
      state: mockSettings.pharmacy.state || '',
      pincode: mockSettings.pharmacy.pincode || '',
      website: mockSettings.pharmacy.website || '',
      snapshotAt: new Date().toISOString()
    };
  }
};

/**
 * Clearly defined historical fallback for legacy records that predated snapshot support.
 * Standard fixed identity; does not claim to represent active/current settings.
 */
export const LEGACY_HISTORICAL_FALLBACK = {
  name: 'Medical Shop ERP',
  logo: null,
  owner: '',
  registrationNo: 'REG-2024-987654',
  drugLicenseNo: 'DL-MH-2024-12345',
  gstin: '27AADCP1234Q1Z5',
  phone: '+91 800 123 4567',
  email: 'contact@medierp.shop',
  address: '123 Pharmacy Lane, Healthcare City',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  website: 'https://medierp.shop',
  snapshotAt: null
};

export const getLegacyHistoricalFallback = () => ({ ...LEGACY_HISTORICAL_FALLBACK });

/**
 * Safely resolves the pharmacy branding for displaying an existing document.
 * 
 * Rules:
 * 1. Uses the saved pharmacy snapshot if present.
 * 2. Never fetches current settings to overwrite saved historical values.
 * 3. If an old record has no snapshot, uses a clearly defined historical fallback
 *    and does not silently replace missing details with current branding.
 */
export const resolveDocumentBranding = (doc) => {
  if (doc?.pharmacy && typeof doc.pharmacy === 'object') {
    const p = doc.pharmacy;
    const fullAddress = [
      p.address,
      p.city,
      p.state ? `${p.state} - ${p.pincode || ''}`.trim() : p.pincode
    ].filter(Boolean).join(', ');

    const contactLine = [
      p.phone ? `Phone: ${p.phone}` : null,
      p.gstin ? `GSTIN: ${p.gstin}` : null,
      p.drugLicenseNo ? `DL: ${p.drugLicenseNo}` : null
    ].filter(Boolean).join(' | ');

    return {
      hasSnapshot: true,
      name: p.name || 'Medical Shop ERP',
      logo: p.logo || null,
      displayLogo: p.logo || '/LOGO.jpeg',
      owner: p.owner || '',
      registrationNo: p.registrationNo || '',
      drugLicenseNo: p.drugLicenseNo || '',
      gstin: p.gstin || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      pincode: p.pincode || '',
      website: p.website || '',
      fullAddress,
      contactLine,
      snapshotAt: p.snapshotAt || null,
      isHistoricalFallback: false
    };
  }

  // Clearly defined historical fallback for legacy records that predated snapshot support.
  // Standard fixed identity; does not claim to represent the active/current settings.
  const fullAddress = '123 Pharmacy Lane, Healthcare City, IN 400001';
  const contactLine = 'Phone: +91 800 123 4567 | GSTIN: 27AADCP1234Q1Z5 | DL: DL-MH-2024-12345';

  return {
    hasSnapshot: false,
    ...LEGACY_HISTORICAL_FALLBACK,
    displayLogo: '/LOGO.jpeg',
    fullAddress,
    contactLine,
    isHistoricalFallback: true
  };
};

