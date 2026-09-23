export const prescriptionsData = [
  {
    id: 1,
    prescriptionId: "RX-1001",
    customerId: 1,
    customerName: "Rahul Sharma",
    doctorName: "Dr. Ananya Gupta",
    doctorContact: "+91 9876543211",
    prescriptionDate: "2023-11-10T10:30:00Z",
    verificationStatus: "Verified",
    verifiedBy: "Admin",
    verifiedAt: "2023-11-10T11:00:00Z",
    notes: "Regular monthly refill.",
    documentName: "rx_rahul_nov.pdf",
    medicines: [
      {
        medicineId: 1,
        medicineName: "Amoxicillin 500mg",
        quantity: 10,
        dosage: "500mg",
        frequency: "Twice a day",
        duration: "5 days",
        instructions: "Take after meals"
      }
    ]
  },
  {
    id: 2,
    prescriptionId: "RX-1002",
    customerId: 2,
    customerName: "Priya Patel",
    doctorName: "Dr. Vikram Singh",
    doctorContact: "+91 9876543212",
    prescriptionDate: "2023-11-15T14:45:00Z",
    verificationStatus: "Pending Verification",
    verifiedBy: null,
    verifiedAt: null,
    notes: "Requires checking alternate brand due to allergy.",
    documentName: "scan_priya.jpg",
    medicines: [
      {
        medicineId: 5,
        medicineName: "Azithromycin 250mg",
        quantity: 6,
        dosage: "250mg",
        frequency: "Once a day",
        duration: "3 days",
        instructions: "Take after breakfast"
      }
    ]
  },
  {
    id: 3,
    prescriptionId: "RX-1003",
    customerId: 3,
    customerName: "Amit Kumar",
    doctorName: "Dr. Sunita Reddy",
    doctorContact: "+91 9876543213",
    prescriptionDate: "2023-11-20T09:15:00Z",
    verificationStatus: "Needs Review",
    verifiedBy: "Admin",
    verifiedAt: "2023-11-20T10:00:00Z",
    notes: "Handwriting unclear on frequency of second medicine.",
    documentName: "amit_rx_nov20.pdf",
    medicines: [
      {
        medicineId: 11,
        medicineName: "Omeprazole 20mg",
        quantity: 30,
        dosage: "20mg",
        frequency: "Once a day",
        duration: "30 days",
        instructions: "Take empty stomach in the morning"
      }
    ]
  }
];
