export const inventoryData = [
  {
    id: 1,
    medicineId: 1,
    medicineName: 'Paracetamol 500mg',
    batch: 'B-10023',
    quantity: 1450,
    purchasePrice: 12.50,
    sellingPrice: 15.00,
    mrp: 18.00,
    expiryDate: '2026-01-14',
    rack: 'R-A1',
    supplier: 'PharmaCorp India',
    status: 'Available'
  },
  {
    id: 5,
    medicineId: 2,
    medicineName: 'Amoxicillin 250mg',
    batch: 'B-44021',
    quantity: 320,
    purchasePrice: 45.00,
    sellingPrice: 55.00,
    mrp: 60.00,
    expiryDate: '2025-06-09',
    rack: 'R-B3',
    supplier: 'Pfizer',
    status: 'Available'
  },
  {
    id: 2,
    medicineId: 3,
    medicineName: 'Cetirizine 10mg',
    batch: 'B-99302',
    quantity: 15,
    purchasePrice: 22.00,
    sellingPrice: 28.00,
    mrp: 32.00,
    expiryDate: '2027-02-19',
    rack: 'R-A4',
    supplier: 'PharmaCorp India',
    status: 'Low Stock'
  },
  {
    id: 3,
    medicineId: 4,
    medicineName: 'Ibuprofen 400mg',
    batch: 'B-11200',
    quantity: 450,
    purchasePrice: 20.00,
    sellingPrice: 25.00,
    mrp: 28.00,
    expiryDate: '2024-10-15',
    rack: 'R-C2',
    supplier: 'MediSupply Co.',
    status: 'Near Expiry'
  },
  {
    id: 4,
    medicineId: 5,
    medicineName: 'Vitamin C 500mg',
    batch: 'B-88211',
    quantity: 0,
    purchasePrice: 30.00,
    sellingPrice: 40.00,
    mrp: 45.00,
    expiryDate: '2025-12-01',
    rack: 'R-D1',
    supplier: 'HealthCare Inc.',
    status: 'Out of Stock'
  }
];

export const inventoryTransactions = [
  {
    id: 1,
    date: '2026-09-16T09:15:00',
    medicine: 'Paracetamol 500mg',
    batch: 'B-10023',
    type: 'Sale',
    quantity: -5,
    previousStock: 1455,
    newStock: 1450,
    reference: 'INV-2024-001',
    user: 'Admin'
  },
  {
    id: 2,
    date: '2026-09-15T14:30:00',
    medicine: 'Cetirizine 10mg',
    batch: 'B-99302',
    type: 'Purchase',
    quantity: 10,
    previousStock: 5,
    newStock: 15,
    reference: 'PO-2026-085',
    user: 'Admin'
  },
  {
    id: 3,
    date: '2026-09-14T11:00:00',
    medicine: 'Vitamin C 500mg',
    batch: 'B-88211',
    type: 'Damage',
    quantity: -2,
    previousStock: 2,
    newStock: 0,
    reference: 'ADJ-102',
    user: 'Manager'
  }
];
