


import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import PatientList from './PatientList';
import AIAssistant from './AIAssistant';
import { AppView, Patient, Appointment, User, Drug, Procedure, RolePermissions, Invoice, DrugFrequencyRule } from '../types';
import { AppointmentCalendar } from './AppointmentCalendar';
import MisReports from './MisReports';
import AccountsManagement from './AccountsManagement';
import DrugsManagement from './DrugsManagement';
import ProcedureManagement from './ProcedureManagement';
import UserManagement from './UserManagement';
import AccessPermission from './AccessPermission';
import DrugFrequencyRules from './DrugFrequencyRules';

interface AdminPortalProps {
  onLogout: () => void;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  drugs: Drug[];
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  procedures: Procedure[];
  setProcedures: React.Dispatch<React.SetStateAction<Procedure[]>>;
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  frequencyRules: DrugFrequencyRule[];
  setFrequencyRules: React.Dispatch<React.SetStateAction<DrugFrequencyRule[]>>;
}

const AdminPortal: React.FC<AdminPortalProps> = (props) => {
  const { 
    onLogout, 
    currentUser, 
    users, 
    setUsers, 
    drugs, 
    setDrugs, 
    procedures, 
    setProcedures,
    rolePermissions,
    setRolePermissions,
    invoices,
    setInvoices,
    patients,
    setPatients,
    appointments,
    setAppointments,
    frequencyRules,
    setFrequencyRules,
  } = props;
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard patients={patients} appointments={appointments} currentUser={currentUser} setView={setCurrentView} />;
      case AppView.PATIENT_RECORDS:
        return <PatientList patients={patients} setPatients={setPatients} currentUser={currentUser} rolePermissions={rolePermissions} />;
      case AppView.USER_MANAGEMENT:
        return <UserManagement users={users} setUsers={setUsers} />;
      case AppView.ACCESS_PERMISSION:
        return <AccessPermission rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />;
      case AppView.AI_ASSISTANT:
        return <AIAssistant />;
      case AppView.APPOINTMENT_CALENDAR:
        return <AppointmentCalendar 
            appointments={appointments} 
            setAppointments={setAppointments} 
            patients={patients} 
            setPatients={setPatients}
            drugs={drugs}
            procedures={procedures}
            frequencyRules={frequencyRules}
            currentUser={currentUser}
            rolePermissions={rolePermissions}
            invoices={invoices}
            setInvoices={setInvoices}
        />;
      case AppView.MIS:
        return <MisReports patients={patients} appointments={appointments} invoices={invoices} />;
      case AppView.PATIENT_BILLS:
      case AppView.FINANCIAL_RECORDS:
      case AppView.UNPAID_BILLS:
        return <AccountsManagement 
            invoices={invoices} 
            setInvoices={setInvoices} 
            patients={patients}
            users={users}
            currentUser={currentUser}
            currentView={currentView}
          />;
      case AppView.DRUGS:
        return <DrugsManagement drugs={drugs} setDrugs={setDrugs} currentUser={currentUser} rolePermissions={rolePermissions} />;
      case AppView.PROCEDURES:
        return <ProcedureManagement procedures={procedures} setProcedures={setProcedures} currentUser={currentUser} rolePermissions={rolePermissions} />;
      case AppView.DRUG_FREQUENCY_RULES:
        return <DrugFrequencyRules frequencyRules={frequencyRules} setFrequencyRules={setFrequencyRules} />;
      default:
        // Fallback to dashboard for admin
        return <Dashboard patients={patients} appointments={appointments} currentUser={currentUser} setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex bg-bg-light min-h-screen">
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        onLogout={onLogout}
        userRole={currentUser.role}
        permissions={rolePermissions}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPortal;
