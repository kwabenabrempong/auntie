


export enum AppView {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENT_CALENDAR = 'APPOINTPOINTMENT_CALENDAR',
  PATIENT_RECORDS = 'PATIENT_RECORDS',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ACCESS_PERMISSION = 'ACCESS_PERMISSION',
  MIS = 'MIS',
  ACCOUNTS = 'ACCOUNTS', // Deprecated, but kept for potential fallback
  DRUGS = 'DRUGS',
  PROCEDURES = 'PROCEDURES',
  DRUG_FREQUENCY_RULES = 'DRUG_FREQUENCY_RULES',
  AI_ASSISTANT = 'AI_ASSISTANT',
  PERFORM_BULK_UPLOAD = 'PERFORM_BULK_UPLOAD',
  EXPORT_DATA = 'EXPORT_DATA',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  ADD_PATIENT = 'ADD_PATIENT',
  ADD_DRUG = 'ADD_DRUG',
  ADD_APPOINTMENT = 'ADD_APPOINTMENT',
  ADD_PROCEDURE = 'ADD_PROCEDURE',

  // New Account Views
  PATIENT_BILLS = 'PATIENT_BILLS',
  FINANCIAL_RECORDS = 'FINANCIAL_RECORDS',
  UNPAID_BILLS = 'UNPAID_BILLS',
}

export interface Vitals {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
}

export enum Formulation {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INHALER = 'Inhaler',
  INJECTION = 'Injection',
  OINTMENT = 'Ointment',
}

export interface Drug {
  id: number;
  name: string;
  formulation: string;
  strength: string;
}

export interface Procedure {
  id: number;
  name: string;
  cost: number;
}

export interface Prescription {
  id: number;
  drugName: string;
  formulation: string;
  strength: string;
  dose: string;
  frequency: string;
  roa: string;
  startDate: string;
  endDate: string;
  days: number;
  quantity: number;
}

export interface Consultation {
    vitals: Vitals;
    notes: string;
    history: string;
    principalComplaints: string;
    treatmentPlan: string;
    prescriptions: Prescription[];
    diagnosis: Procedure[];
    totalBill: number;
}

export interface Visit extends Consultation {
  date: string;
}

export interface EmergencyContact {
    name: string;
    number: string;
    relation: string;
}

export interface Patient {
  id: number;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  emergencyContact: EmergencyContact;
  avatarUrl: string;
  visits: Visit[];
}

export interface Appointment {
  id: number;
  patientName: string;
  patientId: number;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Draft';
  consultation?: Consultation;
}

export enum Designation {
    MANAGER = 'Manager',
    EMPLOYEE = 'Employee',
    DIRECTOR = 'Director',
}

export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  RECEPTION = 'Reception',
  ACCOUNT = 'Accountant',
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  designation: Designation;
  gender: Gender;
  dob: string;
  email: string;
  professionalCode: string;
  mobileNumber: string;
  address: string;
  dateOfJoining: string;
  role: UserRole;
  avatarUrl: string;
}

export interface ExtractedMedicalInfo {
    vitals: Vitals;
    history: string;
    principalComplaints: string;
    treatmentPlan: string;
    prescriptions: { 
      drugName: string;
      formulation: string;
      strength: string;
      dose: string;
      frequency: string;
      roa: string;
    }[];
    diagnosis: { name: string }[];
}

export interface ViewPermission {
  hasAccess: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}
export type RolePermissions = Record<UserRole, Partial<Record<AppView, ViewPermission>>>;

export enum InvoiceStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g., INV-1001
  patientId: number;
  patientName: string;
  appointmentId: number;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  paidByUserId: number | null;
  paymentDate: string | null;
  notificationSent?: boolean;
}

export interface DrugFrequencyRule {
  id: number;
  code: string;
  description: string;
  multiplier: number;
}