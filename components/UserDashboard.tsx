


import React, { useState, useRef, useEffect } from 'react';
import { User, AppView, RolePermissions, Patient, Appointment, Drug, Procedure, Invoice, DrugFrequencyRule } from '../types';
import { LogoutIcon, CloseIcon, ChevronDownIcon, AppointmentsIcon, PatientRecordIcon, AiAssistantIcon, BillingIcon, PillIcon, ProcedureIcon, ChartBarIcon } from './icons';
import AIAssistant from './AIAssistant';
import { AppointmentCalendar } from './AppointmentCalendar';
import PatientList from './PatientList';
import AccountsManagement from './AccountsManagement';
import MisReports from './MisReports';
import DrugsManagement from './DrugsManagement';
import ProcedureManagement from './ProcedureManagement';
import { viewLabels } from './AccessPermission'; // Reuse viewLabels

// --- User Profile Modals ---
interface UpdateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (user: User) => void;
}

function UpdateProfileModal({ isOpen, onClose, user, onSave }: UpdateProfileModalProps) {
    const [formData, setFormData] = useState<Partial<User>>(user);

    useEffect(() => {
        if(isOpen) setFormData(user);
    }, [isOpen, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as User);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Update Profile</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label-form">First Name</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="input-field" /></div>
                        <div><label className="label-form">Last Name</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="input-field" /></div>
                        <div className="md:col-span-2"><label className="label-form">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" /></div>
                        <div className="md:col-span-2"><label className="label-form">Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} className="input-field" rows={3}/></div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (user: User) => void;
}

function ChangePasswordModal({ isOpen, onClose, user, onSave }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user.password !== currentPassword) {
            setError("Current password is not correct.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }
        onSave({ ...user, password: newPassword });
        onClose();
    };
    
    useEffect(() => {
        if (!isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Change Password</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div><label className="label-form">Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" /></div>
                        <div><label className="label-form">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" /></div>
                        <div><label className="label-form">Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" /></div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Dashboard Home Components ---

const viewIcons: Record<string, React.ReactNode> = {
  [AppView.APPOINTMENT_CALENDAR]: <AppointmentsIcon className="w-8 h-8" />,
  [AppView.PATIENT_RECORDS]: <PatientRecordIcon className="w-8 h-8" />,
  [AppView.AI_ASSISTANT]: <AiAssistantIcon className="w-8 h-8" />,
  [AppView.PATIENT_BILLS]: <BillingIcon className="w-8 h-8" />,
  [AppView.FINANCIAL_RECORDS]: <BillingIcon className="w-8 h-8" />,
  [AppView.UNPAID_BILLS]: <BillingIcon className="w-8 h-8" />,
  [AppView.DRUGS]: <PillIcon className="w-8 h-8" />,
  [AppView.PROCEDURES]: <ProcedureIcon className="w-8 h-8" />,
  [AppView.MIS]: <ChartBarIcon className="w-8 h-8" />,
};

function NavButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void; }) {
    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-brand-light group"
        >
            <div className="bg-brand-primary text-white p-4 rounded-full mb-3 transition-colors group-hover:bg-brand-secondary">
                {icon}
            </div>
            <p className="font-semibold text-text-primary">{label}</p>
        </button>
    );
}

interface UserDashboardHomeProps {
    currentUser: User;
    accessibleViews: AppView[];
    setView: (view: AppView) => void;
}

function UserDashboardHome({ currentUser, accessibleViews, setView }: UserDashboardHomeProps) {
    // Filter out the dashboard view itself from the buttons
    const viewsToShow = accessibleViews.filter(v => v !== AppView.DASHBOARD);
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {currentUser.firstName}!</h1>
            <p className="text-text-secondary mb-8">Select a module to get started.</p>
            {viewsToShow.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {viewsToShow.map(view => (
                        viewLabels[view] && viewIcons[view] && (
                            <NavButton
                                key={view}
                                icon={viewIcons[view]}
                                label={viewLabels[view]}
                                onClick={() => setView(view)}
                            />
                        )
                    ))}
                </div>
            ) : (
                <p className="text-text-secondary text-center py-8">You do not have access to any modules. Please contact an administrator.</p>
            )}
        </div>
    );
};


// --- Main User Dashboard ---
interface UserDashboardProps {
  onLogout: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  rolePermissions: RolePermissions;
  users: User[]; // Pass all users for Financial Records
  // Pass all data props needed by sub-components
  patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  drugs: Drug[]; setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  procedures: Procedure[]; setProcedures: React.Dispatch<React.SetStateAction<Procedure[]>>;
  invoices: Invoice[]; setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  frequencyRules: DrugFrequencyRule[]; setFrequencyRules: React.Dispatch<React.SetStateAction<DrugFrequencyRule[]>>;
}

const navigableViews: AppView[] = [
    AppView.DASHBOARD,
    AppView.APPOINTMENT_CALENDAR,
    AppView.PATIENT_RECORDS,
    AppView.AI_ASSISTANT,
    AppView.PATIENT_BILLS,
    AppView.FINANCIAL_RECORDS,
    AppView.UNPAID_BILLS,
    AppView.DRUGS,
    AppView.PROCEDURES,
    AppView.MIS,
];

export default function UserDashboard(props: UserDashboardProps) {
  const { onLogout, currentUser, onUpdateUser, rolePermissions } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userPermissions = rolePermissions[currentUser.role] || {};

  const accessibleViews = navigableViews.filter(
    (view) => userPermissions[view]?.hasAccess
  );
  
  const [currentView, setCurrentView] = useState<AppView>(accessibleViews.includes(AppView.DASHBOARD) ? AppView.DASHBOARD : accessibleViews[0] || AppView.DASHBOARD);

  const accountViews: AppView[] = [AppView.PATIENT_BILLS, AppView.FINANCIAL_RECORDS, AppView.UNPAID_BILLS];
  const hasAccountAccess = accessibleViews.some(v => accountViews.includes(v));
  const firstAccessibleAccountView = accessibleViews.find(v => accountViews.includes(v));

  useEffect(() => {
    // If the current view is not accessible, switch to the first available one.
    if (!accessibleViews.includes(currentView)) {
        setCurrentView(accessibleViews[0] || AppView.DASHBOARD);
    }
  }, [currentUser, rolePermissions, accessibleViews, currentView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
          return <UserDashboardHome currentUser={currentUser} accessibleViews={accessibleViews} setView={setCurrentView} />;
      case AppView.PATIENT_RECORDS: return <PatientList {...props} />;
      case AppView.AI_ASSISTANT: return <AIAssistant />;
      case AppView.APPOINTMENT_CALENDAR: return <AppointmentCalendar {...props} />;
      case AppView.MIS: return <MisReports {...props} />;
      case AppView.PATIENT_BILLS:
      case AppView.FINANCIAL_RECORDS:
      case AppView.UNPAID_BILLS:
          return <AccountsManagement {...props} currentView={currentView} />;
      case AppView.DRUGS: return <DrugsManagement {...props} />;
      case AppView.PROCEDURES: return <ProcedureManagement {...props} />;
      default:
        return <UserDashboardHome currentUser={currentUser} accessibleViews={accessibleViews} setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-light">
      <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .label-form { display: block; text-sm font-medium text-text-secondary mb-1; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
      <header className="bg-white shadow-md z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-brand-primary p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-brand-secondary ml-3">ClinicFlow</h1>
              <nav className="hidden md:flex ml-10 space-x-4">
                {accessibleViews
                  .filter(view => !accountViews.includes(view))
                  .map(view => {
                    const label = viewLabels[view];
                    if (!label) return null;
                    const isActive = currentView === view;
                    return (
                        <button key={view} onClick={() => setCurrentView(view)} className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-brand-light text-brand-primary' : 'text-text-secondary hover:bg-gray-100'}`}>
                            {label}
                        </button>
                    );
                })}
                {hasAccountAccess && firstAccessibleAccountView && (
                    <button
                        key="accounts-tab"
                        onClick={() => setCurrentView(firstAccessibleAccountView)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                            accountViews.includes(currentView)
                            ? 'bg-brand-light text-brand-primary'
                            : 'text-text-secondary hover:bg-gray-100'
                        }`}
                    >
                        Accounts
                    </button>
                )}
              </nav>
            </div>
            <div className="flex items-center" ref={dropdownRef}>
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                  <img className="h-8 w-8 rounded-full" src={currentUser.avatarUrl} alt="" />
                  <span className="text-sm font-medium text-text-primary hidden sm:block">{currentUser.firstName} {currentUser.lastName}</span>
                  <ChevronDownIcon className="w-5 h-5 text-text-secondary" />
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <button onClick={() => { setIsUpdateProfileOpen(true); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Update Profile</button>
                    <button onClick={() => { setIsChangePasswordOpen(true); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Change Password</button>
                    <div className="border-t my-1"></div>
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogoutIcon className="inline w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
      <UpdateProfileModal isOpen={isUpdateProfileOpen} onClose={() => setIsUpdateProfileOpen(false)} user={currentUser} onSave={onUpdateUser} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} user={currentUser} onSave={onUpdateUser} />
    </div>
  );
}
