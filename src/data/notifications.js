export const notificationsData = [
  {
    id: 1,
    type: "Expired Medicines",
    priority: "critical",
    title: "Critical: Medicines Expired",
    message: "2 batches of Paracetamol have expired. Please remove from stock.",
    createdAt: "2023-11-20T08:00:00Z",
    read: false,
    module: "inventory",
    referenceId: null,
    actionUrl: "/inventory/expiry"
  },
  {
    id: 2,
    type: "Low-stock Medicines",
    priority: "high",
    title: "Low Stock Alert: Amoxicillin",
    message: "Amoxicillin 500mg stock is below minimum threshold (15 strips left).",
    createdAt: "2023-11-21T09:30:00Z",
    read: false,
    module: "inventory",
    referenceId: 1,
    actionUrl: "/inventory/low-stock"
  },
  {
    id: 3,
    type: "Prescription Verification Required",
    priority: "medium",
    title: "Pending Prescription: RX-1002",
    message: "New prescription uploaded for Priya Patel requires pharmacist verification.",
    createdAt: "2023-11-21T10:15:00Z",
    read: false,
    module: "prescriptions",
    referenceId: 2,
    actionUrl: "/prescriptions/2"
  },
  {
    id: 4,
    type: "Purchase Completion",
    priority: "info",
    title: "Goods Received: PO-1002",
    message: "Order PO-1002 from MedLife Distributors has been fully received.",
    createdAt: "2023-11-19T14:20:00Z",
    read: true,
    module: "purchases",
    referenceId: 2,
    actionUrl: "/purchases/2"
  }
];
