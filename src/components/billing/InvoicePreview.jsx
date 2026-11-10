import { QrCode } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { resolveDocumentBranding } from '../../utils/documentBranding';

const InvoicePreview = ({ sale, medicines }) => {
  const { settings } = useSettings();
  if (!sale) return null;

  // Strict snapshot resolution: uses saved snapshot from sale; never overwrites from current settings
  const docBranding = resolveDocumentBranding(sale);
  const pharmacyName = docBranding.name;
  const pharmacyLogo = docBranding.logo;
  const showLogo = settings?.invoice?.showLogo !== false;
  const fullAddress = docBranding.fullAddress;
  const contactLine = docBranding.contactLine;

  const getMedicineName = (id) => {
    const med = medicines.find(m => m.id === id);
    return med ? med.name : 'Unknown Medicine';
  };

  return (
    <div className="bg-white text-black p-8 max-w-3xl mx-auto border border-gray-300 shadow-sm invoice-print">
      {/* Header */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          {showLogo && (pharmacyLogo || '/LOGO.jpeg') && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src={pharmacyLogo || '/LOGO.jpeg'} 
                alt={`${pharmacyName} Logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider">{pharmacyName}</h1>
            {fullAddress && <p className="text-sm">{fullAddress}</p>}
            {contactLine && <p className="text-sm">{contactLine}</p>}
          </div>
          {showLogo && (pharmacyLogo || '/LOGO.jpeg') && (
            <div className="w-16 sm:w-20 flex-shrink-0 hidden sm:block" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-xl font-bold mt-4 uppercase text-center">Tax Invoice</h2>
      </div>

      {/* Meta */}
      <div className="flex justify-between text-sm mb-6">
        <div>
          <p><span className="font-semibold">Invoice No:</span> {sale.invoiceNumber}</p>
          <p><span className="font-semibold">Date:</span> {new Date(sale.date).toLocaleString()}</p>
          <p><span className="font-semibold">Cashier:</span> {sale.cashier}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Customer:</span> {sale.customerName || 'Walk-in'}</p>
          <p><span className="font-semibold">Payment Mode:</span> {sale.paymentMethod}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="border-y border-gray-300 bg-gray-50">
            <th className="py-2 text-left font-semibold">Description</th>
            <th className="py-2 text-left font-semibold">Batch</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Rate</th>
            <th className="py-2 text-right font-semibold">Discount</th>
            <th className="py-2 text-right font-semibold">GST%</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-2">{getMedicineName(item.medicineId)}</td>
              <td className="py-2">{item.batchNumber || '-'}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{item.rate.toFixed(2)}</td>
              <td className="py-2 text-right">
                {item.discountType === 'fixed' 
                  ? `-₹${Number(item.discountValue || 0).toFixed(2)}`
                  : item.discountType === 'percentage' || item.discountType === 'manual'
                  ? `${item.discountValue || item.discount || 0}%`
                  : typeof item.discount === 'number' 
                  ? `${item.discount}%` 
                  : '-'}
              </td>
              <td className="py-2 text-right">{item.gst}</td>
              <td className="py-2 text-right">{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{sale.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Item Discount:</span>
            <span>-₹{sale.discount.toFixed(2)}</span>
          </div>
          {sale.overallDiscount > 0 && (
            <div className="flex justify-between text-orange-700">
              <span>
                Overall Discount
                {sale.overallDiscountType === 'percentage' && sale.overallDiscountValue
                  ? ` (${sale.overallDiscountValue}%)`
                  : ''}
                :
              </span>
              <span>-₹{sale.overallDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST:</span>
            <span>+₹{sale.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 mt-2">
            <span>Grand Total:</span>
            <span>₹{sale.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center justify-center text-center text-sm text-gray-500 border-t border-gray-300 pt-6 mt-8">
        <div className="mb-4">
          <QrCode className="w-20 h-20 text-black mx-auto" />
          <p className="text-xs font-bold mt-1 text-black">Scan to Review Us</p>
        </div>
        <p>Thank you for your business! Wishing you good health.</p>
        <p className="text-xs mt-1">Goods once sold will not be taken back without original receipt.</p>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print, .invoice-print * {
            visibility: visible;
          }
          .invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;
