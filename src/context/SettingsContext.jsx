import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsApi';
import { mockSettings } from '../data/settings';

const SettingsContext = createContext();

// eslint-disable-next-line react/only-export-components
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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

  return (
    <SettingsContext.Provider value={{ settings, loading, updateCategorySettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
