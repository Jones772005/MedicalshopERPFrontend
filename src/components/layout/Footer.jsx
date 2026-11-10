import { usePharmacyBranding } from '../../context/SettingsContext';

const Footer = () => {
  const { name: pharmacyName } = usePharmacyBranding();
  const currentYear = new Date().getFullYear();
  const displayName = pharmacyName?.trim() || 'Medical Shop ERP';

  return (
    <footer
      className="w-full border-t border-[#DDE6F0] dark:border-[#263B50] py-3.5 sm:py-4 px-4 sm:px-6 transition-colors duration-200 mt-auto print:hidden"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <p className="font-normal text-[#64748B] dark:text-slate-400 text-center sm:text-left">
          &copy; {currentYear} {displayName}. All rights reserved.
        </p>
        <p className="font-medium text-[#64748B] dark:text-slate-400 text-center sm:text-right">
          Developed by CODE BLAZA TECHNOLOGY
        </p>
      </div>
    </footer>
  );
};

export default Footer;

