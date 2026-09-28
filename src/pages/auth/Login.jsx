import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Eye, EyeOff, Key, UserCheck, ArrowRight,
  Sun, Moon, Zap, Layers, ShieldCheck,
  Mail, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usersData as demoUsers } from '../../data/users';

/* ── Validation schema (unchanged) ──────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/* ── Role-colour helpers for demo cards ─────────────────────────── */
const roleColors = {
  Administrator: { bg: '#EAF3FE', text: '#1A6BC7', border: '#A1CAFA' },
  Pharmacist:    { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
  Cashier:       { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'Store Manager': { bg: '#F5F3FF', text: '#5B21B6', border: '#C4B5FD' },
  'Purchase Manager': { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
  Accountant:    { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  'General Staff': { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
};

const getRoleColors = (role) =>
  roleColors[role] || { bg: '#EAF3FE', text: '#1A6BC7', border: '#A1CAFA' };

/* ── Feature list ────────────────────────────────────────────────── */
const features = [
  { icon: Zap,        title: 'Fast Billing',      sub: 'Barcode & Search' },
  { icon: Layers,     title: 'Smart Inventory',   sub: 'Batch & Expiry Management' },
  { icon: ShieldCheck,title: 'Secure & Reliable', sub: 'Role-based Access Control' },
];

/* ═══════════════════════════════════════════════════════════════════
   LOGIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const Login = () => {
  const [showPassword, setShowPassword]   = useState(false);
  const [loginError,   setLoginError]     = useState('');

  const { login }              = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate               = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email:    'admin@medishop.com',
      password: 'demo123',
    },
  });

  /* ── Handlers (UNCHANGED logic) ──────────────────────────────── */
  const handleDemoLogin = (email) => {
    setValue('email', email);
    setValue('password', 'demo123');
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data) => {
    try {
      setLoginError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(
        err.response?.data?.message ||
        err.message ||
        'Failed to login. Please try again.'
      );
    }
  };

  /* ── Inline styles (scoped — no global pollution) ────────────── */
  const s = getStyles(theme);

  return (
    <div style={s.root}>

      {/* ══════════════════════════════
          LEFT PANEL
         ══════════════════════════════ */}
      <div style={s.leftPanel}>
        <div style={s.overlay} />
        <div style={s.leftContent}>

          {/* Logo + tagline row */}
          <div style={s.logoRow}>
            <div style={s.logoBox}>
              <img
                src="/LOGO.jpeg"
                alt="MEDISHOP ERP Logo"
                style={s.logoImg}
              />
            </div>
            <div style={s.tagline}>
              <span style={s.taglineTop}>Better Pharmacy</span>
              <span style={s.taglineBot}>A Healthier Tomorrow</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 style={s.heading}>
            Complete Medical<br />
            Shop Management<br />
            <span style={s.headingAccent}>Made Simple.</span>
          </h1>

          {/* Description */}
          <p style={s.description}>
            Billing, Inventory, Purchases, Expiry Alerts,<br />
            and More — All in One Powerful System.
          </p>

          {/* Feature list */}
          <div style={s.featureList}>
            {features.map(({ icon: Icon, title, sub }) => (
              <div key={title} style={s.featureItem}>
                <div style={s.featureIcon}>
                  <Icon size={18} color="#fff" />
                </div>
                <div>
                  <div style={s.featureTitle}>{title}</div>
                  <div style={s.featureSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT PANEL
         ══════════════════════════════ */}
      <div style={s.rightPanel}>

        {/* Theme toggle — same slider as Header.jsx */}
        <div style={s.themeToggleWrap}>
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="relative inline-flex items-center justify-center w-14 h-7 rounded-full bg-[#EAF3FE] dark:bg-[#163A59] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:ring-offset-2 cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            <span className="sr-only">Toggle theme</span>
            <span
              className={`absolute left-1 flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#102A43] shadow transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
            >
              {theme === 'dark'
                ? <Moon className="w-3 h-3 text-[#38BDF8]" />
                : <Sun  className="w-3 h-3 text-yellow-500" />
              }
            </span>
          </button>
        </div>

        {/* ── Login card ─────────────────────────────────────── */}
        <div style={s.cardWrap}>
          <div style={s.card}>

            {/* Card header */}
            <p style={s.welcomeText}>Welcome Back!</p>
            <h2 style={s.cardTitle}>
              Login to{' '}
              <span style={s.cardTitleBlue}>MEDISHOP ERP</span>
            </h2>
            <p style={s.cardSubtitle}>Access your pharmacy management system</p>

            {/* Error banner */}
            {loginError && (
              <div style={s.errorBanner} role="alert">
                <p style={s.errorText}>{loginError}</p>
              </div>
            )}

            {/* ── Form ───────────────────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 28 }}>

              {/* Username / Email */}
              <div style={s.fieldGroup}>
                <label htmlFor="login-email" style={s.label}>Username</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIconLeft}>
                    <Mail size={16} color={theme === 'light' ? '#94A3B8' : '#8FA9BF'} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@medishop.com"
                    style={{
                      ...s.input,
                      ...(errors.email ? s.inputError : {}),
                    }}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p style={s.fieldError}>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div style={{ ...s.fieldGroup, marginTop: 20 }}>
                <label htmlFor="login-password" style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIconLeft}>
                    <Lock size={16} color={theme === 'light' ? '#94A3B8' : '#8FA9BF'} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    style={{
                      ...s.input,
                      paddingRight: 48,
                      ...(errors.password ? s.inputError : {}),
                    }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword(v => !v)}
                    style={s.eyeBtn}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={s.fieldError}>{errors.password.message}</p>
                )}
              </div>

              {/* Remember me + Forgot */}
              <div style={s.rememberRow}>
                <label htmlFor="remember-me" style={s.rememberLabel}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    style={s.checkbox}
                  />
                  Remember me
                </label>
                <a href="#" style={s.forgotLink}>
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...s.loginBtn,
                  ...(isSubmitting ? s.loginBtnDisabled : {}),
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      style={s.spinner}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        style={{ opacity: 0.75 }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging in…
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} style={{ marginRight: 8 }} />
                    Login
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Demo / Quick Login ────────────────────────────── */}
          <div style={s.demoSection}>
            <div style={s.demoDividerRow}>
              <span style={s.demoDividerLine} />
              <span style={s.demoDividerText}>
                <Key size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Quick Demo Login
              </span>
              <span style={s.demoDividerLine} />
            </div>

            <div style={s.demoGrid}>
              {demoUsers.map((user) => {
                const { bg, text, border: bdrClr } = getRoleColors(user.role);
                return (
                  <button
                    key={user.id}
                    type="button"
                    id={`demo-login-${user.id}`}
                    onClick={() => handleDemoLogin(user.email)}
                    disabled={isSubmitting}
                    style={{
                      ...s.demoCard,
                      ...(isSubmitting ? s.demoCardDisabled : {}),
                    }}
                  >
                    <span style={{
                      ...s.demoAvatar,
                      background: bg,
                      color: text,
                      border: `1px solid ${bdrClr}`,
                    }}>
                      <UserCheck size={14} />
                    </span>
                    <span style={s.demoMeta}>
                      <span style={s.demoRole}>{user.role}</span>
                      <span style={s.demoEmail}>{user.email}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p style={s.demoHint}>
              Click any account above to instantly log in.{' '}
              Password is{' '}
              <code style={s.demoCode}>demo123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STYLES — inline, fully theme-aware, zero global side-effects
═══════════════════════════════════════════════════════════════════ */
function getStyles(theme) {
  const dark        = theme === 'dark';
  const cardBg      = dark ? '#102A43' : '#FFFFFF';
  const pageBg      = dark ? '#081A2B' : '#F5F8FC';
  const border      = dark ? '#263B50' : '#E5E7EB';
  const labelCol    = dark ? '#D9E6F2' : '#162033';
  const inputBg     = dark ? '#132B42' : '#FFFFFF';
  const inputText   = dark ? '#F8FAFC' : '#162033';
  const subtitleCol = dark ? '#B8CCE0' : '#64748B';

  return {
    root: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: 'hidden',
    },

    /* LEFT */
    leftPanel: {
      position: 'relative',
      width: '45%',
      minHeight: '100vh',
      backgroundImage: "url('/Login backgorund.jpeg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      display: 'flex',
      flexDirection: 'column',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(30,125,235,0.70) 0%, rgba(35,91,210,0.80) 100%)',
      zIndex: 1,
    },
    leftContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 44px',
      height: '100%',
      boxSizing: 'border-box',
      textShadow: '0 1px 4px rgba(0,0,0,0.55)',
    },
    logoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 20,
      marginBottom: 40,
    },
    logoBox: {
      width: 88,
      height: 88,
      background: '#FFFFFF',
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      overflow: 'hidden',
    },
    logoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    tagline: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingTop: 8,
    },
    taglineTop: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.04em',
    },
    taglineBot: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    heading: {
      color: '#FFFFFF',
      fontSize: 'clamp(28px, 3.2vw, 50px)',
      fontWeight: 800,
      lineHeight: 1.08,
      margin: '0 0 20px 0',
    },
    headingAccent: {
      color: '#2DECC9',
    },
    description: {
      color: 'rgba(255,255,255,0.88)',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.65,
      margin: '0 0 36px 0',
    },
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    featureIcon: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    featureTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 600,
    },
    featureSub: {
      color: 'rgba(255,255,255,0.70)',
      fontSize: 12,
      marginTop: 2,
    },

    /* RIGHT */
    rightPanel: {
      position: 'relative',
      width: '55%',
      minHeight: '100vh',
      background: pageBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px 40px',
      boxSizing: 'border-box',
      overflowY: 'auto',
    },

    themeToggleWrap: {
      position: 'absolute',
      top: 22,
      right: 28,
    },

    cardWrap: {
      width: '100%',
      maxWidth: 500,
    },

    card: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: '36px 40px',
      boxShadow: dark
        ? '0 8px 40px rgba(0,0,0,0.35)'
        : '0 4px 32px rgba(36,130,237,0.09)',
      marginBottom: 16,
    },

    welcomeText: {
      color: '#2482ED',
      fontSize: 15,
      fontWeight: 600,
      margin: '0 0 6px 0',
    },
    cardTitle: {
      color: labelCol,
      fontSize: 24,
      fontWeight: 800,
      margin: '0 0 8px 0',
      lineHeight: 1.2,
    },
    cardTitleBlue: {
      color: '#2482ED',
    },
    cardSubtitle: {
      color: subtitleCol,
      fontSize: 14,
      margin: 0,
    },

    errorBanner: {
      background: dark ? 'rgba(220,38,38,0.15)' : '#FEF2F2',
      border: '1px solid rgba(220,38,38,0.35)',
      borderRadius: 10,
      padding: '10px 14px',
      marginTop: 16,
    },
    errorText: {
      color: dark ? '#FCA5A5' : '#DC2626',
      fontSize: 13,
      margin: 0,
    },

    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      color: labelCol,
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 8,
    },
    inputWrap: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    inputIconLeft: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 1,
    },
    input: {
      width: '100%',
      height: 56,
      boxSizing: 'border-box',
      paddingLeft: 42,
      paddingRight: 14,
      background: inputBg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      fontSize: 14,
      color: inputText,
      outline: 'none',
      transition: 'border-color 0.18s, box-shadow 0.18s',
      fontFamily: 'inherit',
    },
    inputError: {
      borderColor: '#EF4444',
    },
    eyeBtn: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: subtitleCol,
      display: 'flex',
      alignItems: 'center',
      padding: 4,
      zIndex: 1,
    },
    fieldError: {
      color: '#EF4444',
      fontSize: 12,
      margin: '5px 0 0 0',
    },

    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 18,
      marginBottom: 22,
    },
    rememberLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: labelCol,
      cursor: 'pointer',
      fontWeight: 500,
    },
    checkbox: {
      accentColor: '#2482ED',
      width: 16,
      height: 16,
      cursor: 'pointer',
    },
    forgotLink: {
      fontSize: 13,
      fontWeight: 600,
      color: '#2482ED',
      textDecoration: 'none',
    },

    loginBtn: {
      width: '100%',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#2482ED',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 4px 18px rgba(36,130,237,0.35)',
      transition: 'background 0.18s, box-shadow 0.18s',
      fontFamily: 'inherit',
    },
    loginBtnDisabled: {
      background: '#6BAAF6',
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
    spinner: {
      width: 18,
      height: 18,
      marginRight: 8,
    },

    /* Demo section */
    demoSection: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: '22px 28px 20px',
      boxShadow: dark
        ? '0 4px 20px rgba(0,0,0,0.25)'
        : '0 2px 12px rgba(36,130,237,0.06)',
    },
    demoDividerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    demoDividerLine: {
      flex: 1,
      height: 1,
      background: border,
    },
    demoDividerText: {
      fontSize: 12,
      fontWeight: 600,
      color: subtitleCol,
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
    },
    demoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    },
    demoCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      background: dark ? '#132B42' : '#F8FAFC',
      border: `1px solid ${border}`,
      borderRadius: 10,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'border-color 0.15s, background 0.15s',
      fontFamily: 'inherit',
    },
    demoCardDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    demoAvatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    demoMeta: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    demoRole: {
      fontSize: 12,
      fontWeight: 700,
      color: labelCol,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    demoEmail: {
      fontSize: 10,
      color: subtitleCol,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    demoHint: {
      fontSize: 11,
      color: subtitleCol,
      textAlign: 'center',
      marginTop: 14,
      marginBottom: 0,
    },
    demoCode: {
      fontFamily: 'monospace',
      background: dark ? '#1A3A55' : '#F1F5F9',
      color: dark ? '#7DD3FC' : '#2482ED',
      padding: '1px 5px',
      borderRadius: 4,
      fontSize: 11,
    },
  };
}

export default Login;
