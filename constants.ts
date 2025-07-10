


import { Patient, Appointment, User, UserRole, Designation, Gender, Drug, Procedure, AppView, RolePermissions, Invoice, InvoiceStatus, InvoiceItem, DrugFrequencyRule } from './types';

export const MOCK_DRUGS: Drug[] = [
  { id: 1, name: 'Paracetamol', formulation: 'Tablet', strength: '500mg' },
  { id: 2, name: 'Amoxicillin', formulation: 'Capsule', strength: '250mg' },
  { id: 3, name: 'Ibuprofen', formulation: 'Tablet', strength: '200mg' },
  { id: 4, name: 'Azithromycin', formulation: 'Tablet', strength: '500mg' },
  { id: 5, name: 'Cough Syrup', formulation: 'Syrup', strength: '100ml' },
  { id: 6, name: 'Salbutamol', formulation: 'Inhaler', strength: '100mcg' },
];

export const MOCK_PROCEDURES: Procedure[] = [
    { id: 1, name: 'General Consultation', cost: 50 },
    { id: 2, name: 'Tension Headache Treatment', cost: 75 },
    { id: 3, name: 'Allergic Rhinitis Follow-up', cost: 60 },
    { id: 4, name: 'Acute Bronchitis Management', cost: 120 },
    { id: 5, name: 'Routine Physical Exam', cost: 150 },
    { id: 6, name: 'Blood Test Panel', cost: 80 },
    { id: 7, name: 'Community-Acquired Pneumonia Treatment', cost: 200 },
];

export const MOCK_FREQUENCY_RULES: DrugFrequencyRule[] = [
  { id: 1, code: 'OD', description: 'Once a day', multiplier: 1 },
  { id: 2, code: 'Daily', description: 'Once a day', multiplier: 1 },
  { id: 3, code: 'BID', description: 'Twice a day', multiplier: 2 },
  { id: 4, code: 'BD', description: 'Twice a day', multiplier: 2 },
  { id: 5, code: 'TID', description: 'Three times a day', multiplier: 3 },
  { id: 6, code: 'TDS', description: 'Three times a day', multiplier: 3 },
  { id: 7, code: 'QID', description: 'Four times a day', multiplier: 4 },
  { id: 8, code: 'QDS', description: 'Four times a day', multiplier: 4 },
  { id: 9, code: 'HS', description: 'At bedtime', multiplier: 1 },
  { id: 10, code: 'SOS', description: 'If necessary', multiplier: 0 },
];


export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    name: 'John Doe',
    dob: '1985-05-15',
    gender: 'Male',
    contact: '555-0101',
    address: '123 Health St, Medville',
    emergencyContact: { name: 'Mary Doe', number: '555-0111', relation: 'Wife' },
    avatarUrl: 'https://picsum.photos/seed/johndoe/100/100',
    visits: [
      {
        date: '2024-07-10',
        vitals: { bloodPressure: '120/80 mmHg', heartRate: '72 bpm', temperature: '37.0°C', respiratoryRate: '16 bpm' },
        notes: 'Patient reports mild headache and fatigue for the past 2 days. No fever or cough. General check-up performed. BP is normal. Heart rate is stable. Temperature is 98.6F. Advised to rest and hydrate.',
        history: 'No significant past medical history.',
        principalComplaints: 'Mild headache and fatigue.',
        treatmentPlan: 'Advised rest and hydration. Follow up if symptoms worsen.',
        prescriptions: [],
        diagnosis: [{ id: 2, name: 'Tension Headache Treatment', cost: 75 }],
        totalBill: 75,
      },
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    dob: '1992-08-22',
    gender: 'Female',
    contact: '555-0102',
    address: '456 Wellness Ave, Medville',
    emergencyContact: { name: 'Mike Smith', number: '555-0112', relation: 'Husband' },
    avatarUrl: 'https://picsum.photos/seed/janesmith/100/100',
    visits: [
      {
        date: '2024-07-18',
        vitals: { bloodPressure: '110/70 mmHg', heartRate: '68 bpm', temperature: '37.1°C', respiratoryRate: '18 bpm' },
        notes: 'Follow-up for seasonal allergies. Patient is responding well to prescribed antihistamines. Lungs clear. BP: 110/70, HR: 68. Temp: 37.1 Celsius. RR: 18.',
        history: 'History of seasonal allergies.',
        principalComplaints: 'Nasal congestion and sneezing.',
        treatmentPlan: 'Continue with current antihistamines.',
        prescriptions: [],
        diagnosis: [{id: 3, name: 'Allergic Rhinitis Follow-up', cost: 60}],
        totalBill: 60,
      },
       {
        date: '2024-06-05',
        vitals: { bloodPressure: '112/72 mmHg', heartRate: '70 bpm', temperature: '37.0°C', respiratoryRate: '18 bpm' },
        notes: 'Initial consultation for seasonal allergies. Patient presents with classic symptoms. Prescribed Loratadine 10mg daily.',
        history: 'History of seasonal allergies.',
        principalComplaints: 'Itchy eyes, runny nose.',
        treatmentPlan: 'Start Loratadine 10mg daily. Follow-up in 6 weeks.',
        prescriptions: [],
        diagnosis: [{id: 1, name: 'General Consultation', cost: 50}],
        totalBill: 50,
      }
    ]
  },
  {
    id: 3,
    name: 'Robert Brown',
    dob: '1970-01-30',
    gender: 'Male',
    contact: '555-0103',
    address: '789 Care Rd, Medville',
    emergencyContact: { name: 'Susan Brown', number: '555-0113', relation: 'Sister' },
    avatarUrl: 'https://picsum.photos/seed/robertbrown/100/100',
    visits: []
  },
    {
    id: 4,
    name: 'Emily White',
    dob: '2001-04-12',
    gender: 'Female',
    contact: '555-0104',
    address: '101 Life Ln, Medville',
    emergencyContact: { name: 'David White', number: '555-0114', relation: 'Father' },
    avatarUrl: 'https://picsum.photos/seed/emilywhite/100/100',
    visits: []
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, patientName: 'Jane Smith', patientId: 2, date: '2024-08-05', time: '10:00 AM', reason: 'Follow-up', status: 'Scheduled' },
  { id: 2, patientName: 'Robert Brown', patientId: 3, date: '2024-08-05', time: '11:30 AM', reason: 'New Complaint', status: 'Scheduled' },
  { id: 3, patientName: 'John Doe', patientId: 1, date: '2024-08-06', time: '02:00 PM', reason: 'Annual Physical', status: 'Scheduled' },
  { 
    id: 4, 
    patientName: 'John Doe', 
    patientId: 1, 
    date: '2024-07-10', 
    time: '09:00 AM', 
    reason: 'Headache', 
    status: 'Completed',
    consultation: {
        vitals: { bloodPressure: '120/80 mmHg', heartRate: '72 bpm', temperature: '37.0°C', respiratoryRate: '16 bpm' },
        notes: 'Patient reports mild headache and fatigue for the past 2 days. No fever or cough. General check-up performed. BP is normal. Heart rate is stable. Temperature is 98.6F. Advised to rest and hydrate.',
        history: 'No significant past medical history.',
        principalComplaints: 'Mild headache and fatigue.',
        treatmentPlan: 'Advised rest and hydration. Follow up if symptoms worsen.',
        prescriptions: [],
        diagnosis: [{ id: 2, name: 'Tension Headache Treatment', cost: 75 }],
        totalBill: 75,
    }
  },
  { id: 5, patientName: 'Jane Smith', patientId: 2, date: '2024-07-18', time: '03:00 PM', reason: 'Allergy Follow-up', status: 'Completed', consultation: MOCK_PATIENTS.find(p => p.id === 2)?.visits[0] },
];

export const MOCK_USERS: User[] = [
  { 
    id: 1, 
    username: 'ereed',
    password: 'password123',
    firstName: 'Evelyn',
    lastName: 'Reed',
    designation: Designation.DIRECTOR,
    gender: 'Female',
    dob: '1980-03-22',
    email: 'e.reed@clinicflow.com', 
    professionalCode: 'DOC-001',
    mobileNumber: '555-0101',
    address: '123 Health St, Medville',
    dateOfJoining: '2015-08-01',
    role: UserRole.DOCTOR, 
    avatarUrl: 'https://picsum.photos/seed/evelynreed/100/100' 
  },
  { 
    id: 2, 
    username: 'admin',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    designation: Designation.MANAGER,
    gender: 'Male',
    dob: '1985-11-10',
    email: 'admin@clinicflow.com', 
    professionalCode: 'ADM-001',
    mobileNumber: '555-0102',
    address: '456 Admin Ave, Medville',
    dateOfJoining: '2018-02-15',
    role: UserRole.ADMIN, 
    avatarUrl: 'https://picsum.photos/seed/adminuser/100/100' 
  },
  { 
    id: 3, 
    username: 'cbennett',
    password: 'password123',
    firstName: 'Chloe',
    lastName: 'Bennett',
    designation: Designation.EMPLOYEE,
    gender: 'Female',
    dob: '1992-06-01',
    email: 'c.bennett@clinicflow.com', 
    professionalCode: 'NUR-001',
    mobileNumber: '555-0103',
    address: '789 Care Rd, Medville',
    dateOfJoining: '2021-09-01',
    role: UserRole.NURSE, 
    avatarUrl: 'https://picsum.photos/seed/chloebennett/100/100' 
  },
  { 
    id: 4, 
    username: 'sgreen',
    password: 'password123',
    firstName: 'Samuel',
    lastName: 'Green',
    designation: Designation.EMPLOYEE,
    gender: 'Male',
    dob: '1995-02-18',
    email: 's.green@clinicflow.com', 
    professionalCode: 'REC-001',
    mobileNumber: '555-0104',
    address: '101 Welcome Ln, Medville',
    dateOfJoining: '2022-05-20',
    role: UserRole.RECEPTION, 
    avatarUrl: 'https://picsum.photos/seed/samuelgreen/100/100' 
  },
  { 
    id: 5, 
    username: 'dchen',
    password: 'password123',
    firstName: 'David',
    middleName: 'J.',
    lastName: 'Chen',
    designation: Designation.EMPLOYEE,
    gender: 'Male',
    dob: '1988-09-30',
    email: 'd.chen@clinicflow.com', 
    professionalCode: 'ACC-001',
    mobileNumber: '555-0105',
    address: '212 Finance Blvd, Medville',
    dateOfJoining: '2020-11-01',
    role: UserRole.ACCOUNT, 
    avatarUrl: 'https://picsum.photos/seed/davidchen/100/100' 
  },
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: {
    [AppView.DASHBOARD]: { hasAccess: true },
    [AppView.APPOINTMENT_CALENDAR]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.PATIENT_RECORDS]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.USER_MANAGEMENT]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.ACCESS_PERMISSION]: { hasAccess: true, canUpdate: true },
    [AppView.MIS]: { hasAccess: true },
    [AppView.PATIENT_BILLS]: { hasAccess: true, canUpdate: true },
    [AppView.FINANCIAL_RECORDS]: { hasAccess: true, canUpdate: true },
    [AppView.UNPAID_BILLS]: { hasAccess: true, canUpdate: true },
    [AppView.DRUGS]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.PROCEDURES]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.DRUG_FREQUENCY_RULES]: { hasAccess: true, canUpdate: true, canDelete: true },
    [AppView.AI_ASSISTANT]: { hasAccess: true },
    [AppView.PERFORM_BULK_UPLOAD]: { hasAccess: true },
    [AppView.EXPORT_DATA]: { hasAccess: true },
    [AppView.VIEW_AUDIT_LOGS]: { hasAccess: true },
    [AppView.ADD_PATIENT]: { hasAccess: true },
    [AppView.ADD_DRUG]: { hasAccess: true },
    [AppView.ADD_APPOINTMENT]: { hasAccess: true },
    [AppView.ADD_PROCEDURE]: { hasAccess: true },
  },
  [UserRole.DOCTOR]: {
    [AppView.DASHBOARD]: { hasAccess: true },
    [AppView.APPOINTMENT_CALENDAR]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.PATIENT_RECORDS]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.DRUGS]: { hasAccess: true, canUpdate: false, canDelete: false },
    [AppView.PROCEDURES]: { hasAccess: true, canUpdate: false, canDelete: false },
    [AppView.AI_ASSISTANT]: { hasAccess: true },
    [AppView.ADD_PATIENT]: { hasAccess: true },
    [AppView.ADD_APPOINTMENT]: { hasAccess: true },
    [AppView.ADD_PROCEDURE]: { hasAccess: true },
  },
  [UserRole.NURSE]: {
    [AppView.DASHBOARD]: { hasAccess: true },
    [AppView.APPOINTMENT_CALENDAR]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.PATIENT_RECORDS]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.DRUGS]: { hasAccess: true, canUpdate: false, canDelete: false },
    [AppView.ADD_PATIENT]: { hasAccess: true },
    [AppView.ADD_APPOINTMENT]: { hasAccess: true },
  },
  [UserRole.RECEPTION]: {
    [AppView.DASHBOARD]: { hasAccess: true },
    [AppView.APPOINTMENT_CALENDAR]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.PATIENT_RECORDS]: { hasAccess: true, canUpdate: true, canDelete: false },
    [AppView.ADD_PATIENT]: { hasAccess: true },
    [AppView.ADD_APPOINTMENT]: { hasAccess: true },
  },
  [UserRole.ACCOUNT]: {
    [AppView.DASHBOARD]: { hasAccess: true },
    [AppView.PATIENT_BILLS]: { hasAccess: true, canUpdate: true },
    [AppView.FINANCIAL_RECORDS]: { hasAccess: true, canUpdate: true },
    [AppView.UNPAID_BILLS]: { hasAccess: true, canUpdate: true },
    [AppView.MIS]: { hasAccess: true },
    [AppView.EXPORT_DATA]: { hasAccess: true },
  },
};

// Generate Invoices from Completed Appointments
export const MOCK_INVOICES: Invoice[] = MOCK_APPOINTMENTS
  .filter(app => app.status === 'Completed' && app.consultation)
  .map((app, index) => {
    const consultation = app.consultation!;
    const issueDate = new Date(app.date);
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 1); // Due in 1 day (24 hours)

    const items: InvoiceItem[] = consultation.diagnosis.map(proc => ({
        id: `proc-${proc.id}-${app.id}`,
        description: proc.name,
        quantity: 1,
        unitPrice: proc.cost,
        total: proc.cost,
    }));

    const isPaid = index % 2 === 0;
    const paymentDate = new Date(issueDate);
    paymentDate.setDate(issueDate.getDate() + 3);

    return {
      id: `INV-${String(1001 + index)}`,
      patientId: app.patientId,
      patientName: app.patientName,
      appointmentId: app.id,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      items: items,
      totalAmount: consultation.totalBill,
      status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
      paidByUserId: isPaid ? 5 : null, // Mock accountant David Chen
      paymentDate: isPaid ? paymentDate.toISOString() : null,
      notificationSent: false,
    };
  });