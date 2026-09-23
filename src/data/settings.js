export const mockSettings = {
  pharmacy: {
    name: 'MediShop Pharmacy ERP',
    owner: 'Dr. Rahul Sharma',
    registrationNo: 'REG-2024-987654',
    drugLicenseNo: 'DL-MH-2024-12345',
    gstin: '27AADCP1234Q1Z5',
    phone: '+91 800 123 4567',
    email: 'contact@medierp.shop',
    address: '123 Pharmacy Lane, Healthcare City',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    website: 'https://medierp.shop'
  },
  invoice: {
    prefix: 'INV',
    startingNumber: 1001,
    format: 'PREFIX-YEAR-NUMBER',
    showLogo: true,
    showCustomerInfo: true,
    showHsnSac: true,
    showGstBreakdown: true,
    showTerms: true,
    showQrCode: true,
    footerText: 'Thank you for your business! Wishing you good health.\nGoods once sold will not be taken back without original receipt.'
  },
  tax: {
    gstEnabled: true,
    defaultGstRate: 12,
    taxInclusivePricing: false,
    roundOff: true
  },
  notifications: {
    lowStock: true,
    outOfStock: true,
    nearExpiry: true,
    expiredMedicines: true,
    purchaseDue: true,
    supplierPaymentDue: true,
    largeDiscountAlert: true,
    pendingVerification: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  },
  printer: {
    name: 'EPSON TM-T82 Thermal Printer',
    type: 'Thermal',
    paperSize: '80mm',
    copies: 1,
    autoPrintInvoice: true,
    autoPrintReceipt: true,
    printPreview: true
  },
  barcode: {
    enabled: true,
    autoFocus: true,
    searchByBarcode: true,
    autoAddScanned: true,
    showOnInvoice: true,
    format: 'CODE-128'
  },
  qr: {
    enableInvoiceQr: true,
    enableReviewQr: true,
    enableUpiQr: true,
    enableWebsiteQr: true,
    upiId: 'medierp@okhdfcbank',
    websiteUrl: 'https://medierp.shop',
    reviewUrl: 'https://medierp.shop/review',
    displaySize: 'Medium'
  },
  security: {
    minPasswordLength: 8,
    passwordExpiryDays: 90,
    requireStrongPassword: true,
    sessionTimeoutMinutes: 60,
    rememberMe: true,
    maxConcurrentSessions: 3,
    autoLogout: true,
    maxFailedAttempts: 5,
    lockDurationMinutes: 15,
    requireRxVerification: true,
    requireManagerForDiscount: true,
    requireManagerForStockAdjust: false
  },
  backup: {
    autoBackup: true,
    frequency: 'Daily',
    retentionDays: 30,
    lastBackup: '2024-03-15T02:00:00Z',
    backupSize: '45.2 MB'
  }
};
