import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import { User, Drug, Procedure, RolePermissions, Invoice, Patient, Appointment, DrugFrequencyRule, UserRole } from './types';
import { MOCK_USERS, MOCK_DRUGS, MOCK_PROCEDURES, INITIAL_ROLE_PERMISSIONS, MOCK_INVOICES, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_FREQUENCY_RULES } from './constants';
import UserDashboard from './components/UserDashboard';

// Custom hook for persistent state
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        // A simple migration strategy: if the structure is empty, re-seed from mocks.
        const parsed = JSON.parse(storedValue);
        if (Array.isArray(parsed) && parsed.length === 0) {
            return initialValue;
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = usePersistentState<User[]>('clinic_users', MOCK_USERS);
  const [drugs, setDrugs] = usePersistentState<Drug[]>('clinic_drugs', MOCK_DRUGS);
  const [procedures, setProcedures] = usePersistentState<Procedure[]>('clinic_procedures', MOCK_PROCEDURES);
  const [rolePermissions, setRolePermissions] = usePersistentState<RolePermissions>('clinic_rolePermissions', INITIAL_ROLE_PERMISSIONS);
  const [invoices, setInvoices] = usePersistentState<Invoice[]>('clinic_invoices', MOCK_INVOICES);
  const [patients, setPatients] = usePersistentState<Patient[]>('clinic_patients', MOCK_PATIENTS);
  const [appointments, setAppointments] = usePersistentState<Appointment[]>('clinic_appointments', MOCK_APPOINTMENTS);
  const [frequencyRules, setFrequencyRules] = usePersistentState<DrugFrequencyRule[]>('clinic_frequencyRules', MOCK_FREQUENCY_RULES);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const renderPortal = () => {
      if (!currentUser) return null;

      const portalProps = {
        onLogout: handleLogout, 
        currentUser: currentUser,
        users: users,
        setUsers: setUsers,
        drugs: drugs,
        setDrugs: setDrugs,
        procedures: procedures,
        setProcedures: setProcedures,
        rolePermissions: rolePermissions,
        setRolePermissions: setRolePermissions,
        invoices: invoices,
        setInvoices: setInvoices,
        patients: patients,
        setPatients: setPatients,
        appointments: appointments,
        setAppointments: setAppointments,
        frequencyRules: frequencyRules,
        setFrequencyRules: setFrequencyRules,
      };

      if (currentUser.role === UserRole.ADMIN) {
          return <AdminPortal {...portalProps} />;
      } else {
          return <UserDashboard {...portalProps} onUpdateUser={handleUpdateUser} />;
      }
  };

  return (
    <>
      {isAuthenticated && currentUser ? (
        renderPortal()
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} users={users} />
      )}
    </>
  );
};

export default App;
