import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsApi';
import { mockSettings } from '../data/settings';
import localDb from '../services/localDb';
import { KEYS } from '../data/storageKeys';

const SettingsContext = createContext();

// eslint-disable-next-line react/only-export-components
export const useSettings = () => useContext(SettingsContext);

// Centralized branding accessor hook
// eslint-disable-next-line react/only-export-components
export const usePharmacyBranding = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    try {
      const stored = localDb.get(KEYS.SETTINGS);
      const pharmacy = (stored && typeof stored === 'object' && !Array.isArray(stored) && stored.pharmacy) || mockSettings.pharmacy;
      const logo = pharmacy?.logo || null;
      return {
        name: pharmacy?.name?.trim() || mockSettings.pharmacy.name,
        logo,
        defaultLogo: '/LOGO.jpeg',
        displayLogo: logo || '/LOGO.jpeg',
        pharmacy: pharmacy || mockSettings.pharmacy,
        updateBranding: async () => false
      };
    } catch {
      return {
        name: mockSettings.pharmacy.name,
        logo: null,
        defaultLogo: '/LOGO.jpeg',
        displayLogo: '/LOGO.jpeg',
        pharmacy: mockSettings.pharmacy,
        updateBranding: async () => false
      };
    }
  }

  return {
    ...context.branding,
    updateBranding: (newBranding) => context.updateCategorySettings('pharmacy', newBranding)
  };
};

export const SettingsProvider = ({ children }) => {
  // Initialize synchronously from localDb if available to prevent flash of fallback branding
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localDb.get(KEYS.SETTINGS);
      if (stored && typeof stored === 'object' && !Array.isArray(stored) && Object.keys(stored).length > 0) {
        return stored;
      }
    } catch {
      // Fallback to mock settings
    }
    return mockSettings;
  });
  const [loading, setLoading] = useState(true);

  // Fetch from service on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Listen for external database changes (e.g. backup restore or direct storage updates)
  useEffect(() => {
    const handleDbChange = (e) => {
      if (e.detail?.key === KEYS.SETTINGS || e.detail?.key === 'ALL') {
        try {
          const stored = localDb.get(KEYS.SETTINGS);
          if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
            setSettings(stored);
          }
        } catch (err) {
          console.error('Failed to sync settings on DB change:', err);
        }
      }
    };

    window.addEventListener('medishop-db-change', handleDbChange);
    return () => window.removeEventListener('medishop-db-change', handleDbChange);
  }, []);

  // Synchronize document.title with the latest pharmacy name
  useEffect(() => {
    const pharmacyName = settings?.pharmacy?.name?.trim();
    if (pharmacyName && typeof document !== 'undefined') {
      const currentTitle = document.title;
      if (!currentTitle || currentTitle.includes('Medical Shop ERP') || currentTitle.includes('MediShop')) {
        document.title = currentTitle
          ? currentTitle.replace(/Medical Shop ERP|MediShop ERP|MediShop/g, pharmacyName)
          : pharmacyName;
      }
    }
  }, [settings?.pharmacy?.name]);

  const updateCategorySettings = async (category, newSettings) => {
    try {
      const res = await updateSettings(category, newSettings);
      setSettings(prev => ({
        ...prev,
        [category]: res.data
      }));
      return true;
    } catch (err) {
      console.error(`Failed to update ${category} settings:`, err);
      return false;
    }
  };

  const pharmacy = settings?.pharmacy || mockSettings.pharmacy;
  const logo = pharmacy?.logo || null;
  const branding = {
    name: pharmacy?.name?.trim() || mockSettings.pharmacy.name,
    logo,
    defaultLogo: '/LOGO.jpeg',
    displayLogo: logo || '/LOGO.jpeg',
    pharmacy: pharmacy || mockSettings.pharmacy
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateCategorySettings, branding }}>
      {children}
    </SettingsContext.Provider>
  );
};
