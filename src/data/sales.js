export const salesData = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    customerId: 1,
    date: '2026-09-10T10:30:00Z',
    cashier: 'Admin',
    subtotal: 500.00,
    discount: 0,
    tax: 60.00,
    grandTotal: 560.00,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 1, batchNumber: 'B-10023', quantity: 20, rate: 15.00, mrp: 18.00, discount: 0, gst: 12, amount: 300.00 },
      { medicineId: 3, batchNumber: 'B-99302', quantity: 10, rate: 20.00, mrp: 28.00, discount: 0, gst: 12, amount: 200.00 }
    ]
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    customerId: 2,
    date: '2026-09-11T11:15:00Z',
    cashier: 'Admin',
    subtotal: 1100.00,
    discount: 50.00,
    tax: 126.00,
    grandTotal: 1176.00,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 20, rate: 55.00, mrp: 60.00, discount: 50.00, gst: 12, amount: 1050.00 }
    ]
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    customerId: 3,
    date: '2026-09-11T14:20:00Z',
    cashier: 'Admin',
    subtotal: 150.00,
    discount: 0,
    tax: 18.00,
    grandTotal: 168.00,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 1, batchNumber: 'B-10023', quantity: 10, rate: 15.00, mrp: 18.00, discount: 0, gst: 12, amount: 150.00 }
    ]
  },
  {
    id: 4,
    invoiceNumber: 'INV-2026-004',
    customerId: 1,
    date: '2026-09-12T09:05:00Z',
    cashier: 'Admin',
    subtotal: 55.00,
    discount: 0,
    tax: 6.60,
    grandTotal: 61.60,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 1, rate: 55.00, mrp: 60.00, discount: 0, gst: 12, amount: 55.00 }
    ]
  },
  {
    id: 5,
    invoiceNumber: 'INV-2026-005',
    customerId: null,
    customerName: 'Walk-in',
    date: '2026-09-12T16:45:00Z',
    cashier: 'Admin',
    subtotal: 140.00,
    discount: 0,
    tax: 16.80,
    grandTotal: 156.80,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 3, batchNumber: 'B-99302', quantity: 5, rate: 28.00, mrp: 32.00, discount: 0, gst: 12, amount: 140.00 }
    ]
  },
  {
    id: 6,
    invoiceNumber: 'INV-2026-006',
    customerId: 2,
    date: '2026-09-13T10:10:00Z',
    cashier: 'Admin',
    subtotal: 220.00,
    discount: 10.00,
    tax: 25.20,
    grandTotal: 235.20,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 4, rate: 55.00, mrp: 60.00, discount: 10, gst: 12, amount: 210.00 }
    ]
  },
  {
    id: 7,
    invoiceNumber: 'INV-2026-007',
    customerId: null,
    customerName: 'Walk-in',
    date: '2026-09-13T12:30:00Z',
    cashier: 'Admin',
    subtotal: 30.00,
    discount: 0,
    tax: 3.60,
    grandTotal: 33.60,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 1, batchNumber: 'B-10023', quantity: 2, rate: 15.00, mrp: 18.00, discount: 0, gst: 12, amount: 30.00 }
    ]
  },
  {
    id: 8,
    invoiceNumber: 'INV-2026-008',
    customerId: 3,
    date: '2026-09-14T11:00:00Z',
    cashier: 'Admin',
    subtotal: 330.00,
    discount: 0,
    tax: 39.60,
    grandTotal: 369.60,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 6, rate: 55.00, mrp: 60.00, discount: 0, gst: 12, amount: 330.00 }
    ]
  },
  {
    id: 9,
    invoiceNumber: 'INV-2026-009',
    customerId: null,
    customerName: 'Walk-in',
    date: '2026-09-14T15:20:00Z',
    cashier: 'Admin',
    subtotal: 56.00,
    discount: 0,
    tax: 6.72,
    grandTotal: 62.72,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 3, batchNumber: 'B-99302', quantity: 2, rate: 28.00, mrp: 32.00, discount: 0, gst: 12, amount: 56.00 }
    ]
  },
  {
    id: 10,
    invoiceNumber: 'INV-2026-010',
    customerId: 1,
    date: '2026-09-15T09:45:00Z',
    cashier: 'Admin',
    subtotal: 150.00,
    discount: 0,
    tax: 18.00,
    grandTotal: 168.00,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 1, batchNumber: 'B-10023', quantity: 10, rate: 15.00, mrp: 18.00, discount: 0, gst: 12, amount: 150.00 }
    ]
  },
  {
    id: 11,
    invoiceNumber: 'INV-2026-011',
    customerId: null,
    customerName: 'Walk-in',
    date: '2026-09-15T13:10:00Z',
    cashier: 'Admin',
    subtotal: 110.00,
    discount: 0,
    tax: 13.20,
    grandTotal: 123.20,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 2, rate: 55.00, mrp: 60.00, discount: 0, gst: 12, amount: 110.00 }
    ]
  },
  {
    id: 12,
    invoiceNumber: 'INV-2026-012',
    customerId: 2,
    date: '2026-09-15T16:00:00Z',
    cashier: 'Admin',
    subtotal: 140.00,
    discount: 0,
    tax: 16.80,
    grandTotal: 156.80,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 3, batchNumber: 'B-99302', quantity: 5, rate: 28.00, mrp: 32.00, discount: 0, gst: 12, amount: 140.00 }
    ]
  },
  {
    id: 13,
    invoiceNumber: 'INV-2026-013',
    customerId: 3,
    date: '2026-09-16T10:15:00Z',
    cashier: 'Admin',
    subtotal: 75.00,
    discount: 0,
    tax: 9.00,
    grandTotal: 84.00,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 1, batchNumber: 'B-10023', quantity: 5, rate: 15.00, mrp: 18.00, discount: 0, gst: 12, amount: 75.00 }
    ]
  },
  {
    id: 14,
    invoiceNumber: 'INV-2026-014',
    customerId: null,
    customerName: 'Walk-in',
    date: '2026-09-16T12:45:00Z',
    cashier: 'Admin',
    subtotal: 275.00,
    discount: 0,
    tax: 33.00,
    grandTotal: 308.00,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 2, batchNumber: 'B-44021', quantity: 5, rate: 55.00, mrp: 60.00, discount: 0, gst: 12, amount: 275.00 }
    ]
  },
  {
    id: 15,
    invoiceNumber: 'INV-2026-015',
    customerId: 1,
    date: '2026-09-16T14:30:00Z',
    cashier: 'Admin',
    subtotal: 84.00,
    discount: 0,
    tax: 10.08,
    grandTotal: 94.08,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Generated',
    items: [
      { medicineId: 3, batchNumber: 'B-99302', quantity: 3, rate: 28.00, mrp: 32.00, discount: 0, gst: 12, amount: 84.00 }
    ]
  }
];
