import { useState } from 'react';
import { QrCode, Download, Link as LinkIcon, Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// Mock QR Codes. In a real app we'd use qrcode.react
const QRManagement = () => {
  const [activeTab, setActiveTab] = useState('store');

  const tabs = [
    { id: 'store', label: 'Store Link / Feedback' },
    { id: 'payment', label: 'UPI Payment' },
    { id: 'app', label: 'App Download' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="QR Code Management" 
        description="Generate and manage QR codes for store displays, invoices, and marketing."
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            
            {/* QR Display */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-md mb-4">
                <QrCode className="w-48 h-48 text-gray-800" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xl">Scan to {activeTab === 'store' ? 'Visit Store' : activeTab === 'payment' ? 'Pay via UPI' : 'Download App'}</h3>
            </div>

            {/* QR Settings */}
            <div className="w-full max-w-md space-y-6">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination URL / Content</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 sm:text-sm">
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={
                      activeTab === 'store' ? 'https://medierp.shop/feedback/123' : 
                      activeTab === 'payment' ? 'upi://pay?pa=medierp@bank&pn=Medical Shop ERP' : 
                      'https://medierp.shop/download-app'
                    }
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full justify-center">
                    <Download className="w-4 h-4 mr-2" /> Download PNG
                  </Button>
                  <Button variant="outline" className="w-full justify-center">
                    <Download className="w-4 h-4 mr-2" /> Download SVG
                  </Button>
                  <Button className="w-full col-span-2 justify-center">
                    <Printer className="w-4 h-4 mr-2" /> Print Display Card
                  </Button>
                </div>
              </div>

              {activeTab === 'store' && (
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Automatically print on footer of thermal invoices</span>
                  </label>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QRManagement;
