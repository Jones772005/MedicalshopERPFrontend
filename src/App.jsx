import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import AppRoutes from './routes/AppRoutes';
import { initializeDatabase } from './data/seedData';

// Initialize LocalStorage database before React mounts
initializeDatabase();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
