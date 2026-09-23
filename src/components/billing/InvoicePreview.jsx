import { QrCode } from 'lucide-react';

const InvoicePreview = ({ sale, medicines }) => {
  if (!sale) return null;

  const getMedicineName = (id) => {
    const med = medicines.find(m => m.id === id);
    return med ? med.name : 'Unknown Medicine';
  };

  return (
    <div className="bg-white text-black p-8 max-w-3xl mx-auto border border-gray-300 shadow-sm invoice-print">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Medical Shop ERP</h1>
        <p className="text-sm">123 Pharmacy Lane, Healthcare City, IN 400001</p>
        <p className="text-sm">Phone: +91 800 123 4567 | GSTIN: 27AADCP1234Q1Z5</p>
        <h2 className="text-xl font-bold mt-4 uppercase">Tax Invoice</h2>
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
            <span>Discount:</span>
            <span>-₹{sale.discount.toFixed(2)}</span>
          </div>
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
