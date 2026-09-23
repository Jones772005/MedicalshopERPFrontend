export const purchasesData = [
  {
    id: 1,
    purchaseOrderNumber: 'PO-2026-001',
    supplierId: 1,
    orderDate: '2026-09-01',
    expectedDeliveryDate: '2026-09-05',
    status: 'Received',
    paymentStatus: 'Paid',
    totalAmount: 14500.00,
    paidAmount: 14500.00,
    items: [
      { id: 1, medicineId: 1, quantity: 1000, purchasePrice: 12.50, mrp: 18.00, gst: 12, discount: 5, total: 12500 },
      { id: 2, medicineId: 3, quantity: 100, purchasePrice: 20.00, mrp: 30.00, gst: 12, discount: 0, total: 2000 }
    ],
    notes: 'Initial stock replenishment for September.'
  },
  {
    id: 2,
    purchaseOrderNumber: 'PO-2026-002',
    supplierId: 2,
    orderDate: '2026-09-10',
    expectedDeliveryDate: '2026-09-15',
    status: 'Partially Received',
    paymentStatus: 'Partial',
    totalAmount: 45000.00,
    paidAmount: 20000.00,
    items: [
      { id: 1, medicineId: 2, quantity: 1000, purchasePrice: 45.00, mrp: 60.00, gst: 12, discount: 0, total: 45000 }
    ],
    notes: 'Urgent order for antibiotics.'
  },
  {
    id: 3,
    purchaseOrderNumber: 'PO-2026-003',
    supplierId: 1,
    orderDate: '2026-09-15',
    expectedDeliveryDate: '2026-09-20',
    status: 'Ordered',
    paymentStatus: 'Pending',
    totalAmount: 3500.00,
    paidAmount: 0,
    items: [
      { id: 1, medicineId: 3, quantity: 159, purchasePrice: 22.00, mrp: 32.00, gst: 12, discount: 0, total: 3500 }
    ],
    notes: 'Low stock alert refill.'
  },
  {
    id: 4,
    purchaseOrderNumber: 'PO-2026-004',
    supplierId: 2,
    orderDate: '2026-08-15',
    expectedDeliveryDate: '2026-08-20',
    status: 'Received',
    paymentStatus: 'Paid',
    totalAmount: 18000.00,
    paidAmount: 18000.00,
    items: [
      { id: 1, medicineId: 1, quantity: 1000, purchasePrice: 12.00, mrp: 18.00, gst: 12, discount: 0, total: 12000 },
      { id: 2, medicineId: 2, quantity: 133, purchasePrice: 45.00, mrp: 60.00, gst: 12, discount: 0, total: 6000 }
    ],
    notes: 'August regular refill.'
  },
  {
    id: 5,
    purchaseOrderNumber: 'PO-2026-005',
    supplierId: 1,
    orderDate: '2026-07-05',
    expectedDeliveryDate: '2026-07-10',
    status: 'Received',
    paymentStatus: 'Paid',
    totalAmount: 8500.00,
    paidAmount: 8500.00,
    items: [
      { id: 1, medicineId: 3, quantity: 386, purchasePrice: 22.00, mrp: 32.00, gst: 12, discount: 0, total: 8500 }
    ],
    notes: 'Cetirizine order.'
  },
  {
    id: 6,
    purchaseOrderNumber: 'PO-2026-006',
    supplierId: 2,
    orderDate: '2026-09-12',
    expectedDeliveryDate: '2026-09-18',
    status: 'Draft',
    paymentStatus: 'Pending',
    totalAmount: 12000.00,
    paidAmount: 0,
    items: [
      { id: 1, medicineId: 2, quantity: 266, purchasePrice: 45.00, mrp: 60.00, gst: 12, discount: 0, total: 12000 }
    ],
    notes: 'Draft for upcoming season.'
  },
  {
    id: 7,
    purchaseOrderNumber: 'PO-2026-007',
    supplierId: 1,
    orderDate: '2026-09-14',
    expectedDeliveryDate: '2026-09-21',
    status: 'Ordered',
    paymentStatus: 'Pending',
    totalAmount: 22000.00,
    paidAmount: 0,
    items: [
      { id: 1, medicineId: 1, quantity: 1760, purchasePrice: 12.50, mrp: 18.00, gst: 12, discount: 0, total: 22000 }
    ],
    notes: 'Additional Paracetamol.'
  },
  {
    id: 8,
    purchaseOrderNumber: 'PO-2026-008',
    supplierId: 2,
    orderDate: '2026-05-20',
    expectedDeliveryDate: '2026-05-25',
    status: 'Received',
    paymentStatus: 'Paid',
    totalAmount: 50000.00,
    paidAmount: 50000.00,
    items: [
      { id: 1, medicineId: 2, quantity: 1111, purchasePrice: 45.00, mrp: 60.00, gst: 12, discount: 0, total: 50000 }
    ],
    notes: 'Large Amoxicillin restock.'
  },
  {
    id: 9,
    purchaseOrderNumber: 'PO-2026-009',
    supplierId: 1,
    orderDate: '2026-09-08',
    expectedDeliveryDate: '2026-09-12',
    status: 'Received',
    paymentStatus: 'Paid',
    totalAmount: 11000.00,
    paidAmount: 11000.00,
    items: [
      { id: 1, medicineId: 3, quantity: 500, purchasePrice: 22.00, mrp: 32.00, gst: 12, discount: 0, total: 11000 }
    ],
    notes: 'Quick refill.'
  },
  {
    id: 10,
    purchaseOrderNumber: 'PO-2026-010',
    supplierId: 2,
    orderDate: '2026-09-16',
    expectedDeliveryDate: '2026-09-20',
    status: 'Ordered',
    paymentStatus: 'Pending',
    totalAmount: 5400.00,
    paidAmount: 0,
    items: [
      { id: 1, medicineId: 2, quantity: 120, purchasePrice: 45.00, mrp: 60.00, gst: 12, discount: 0, total: 5400 }
    ],
    notes: 'Outstanding balance PO.'
  }
];
