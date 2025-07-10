


import React, { useState } from 'react';
import { AppView, UserRole, RolePermissions } from '../types';
import { DashboardIcon, PatientRecordIcon, AppointmentsIcon, AiAssistantIcon, LogoutIcon, AdminIcon, ChartBarIcon, BillingIcon, PillIcon, ProcedureIcon, UserManagementIcon, ChevronRightIcon, LockClosedIcon, ChevronLeftIcon, FrequencyIcon, UserGroupIcon, FolderOpenIcon } from './icons';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  userRole: UserRole;
  permissions: RolePermissions;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  isSubItem?: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed, isSubItem }) => (
  <li
    onClick={onClick}
    className={`relative flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 group ${
      isActive
        ? 'bg-brand-primary text-white shadow-md'
        : 'text-text-secondary hover:bg-brand-light hover:text-brand-primary'
    } ${isSubItem ? (isCollapsed ? 'pl-3' : 'pl-5') : ''}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{label}</span>
    {isCollapsed && !isSubItem && (
      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
        {label}
      </div>
    )}
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, userRole, permissions, isCollapsed, setIsCollapsed }) => {
  const isAdministratorActive = currentView === AppView.USER_MANAGEMENT || currentView === AppView.ACCESS_PERMISSION;
  const isAccountsActive = currentView === AppView.PATIENT_BILLS || currentView === AppView.FINANCIAL_RECORDS || currentView === AppView.UNPAID_BILLS;
  const isDrugsMenuActive = currentView === AppView.DRUGS || currentView === AppView.DRUG_FREQUENCY_RULES;
  const isProceduresMenuActive = currentView === AppView.PROCEDURES;

  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isAccountsMenuOpen, setIsAccountsMenuOpen] = useState(false);
  const [isDrugsMenuOpen, setIsDrugsMenuOpen] = useState(false);
  const [isProceduresMenuOpen, setIsProceduresMenuOpen] = useState(false);

  const userPermissions = permissions[userRole] || {};

  const hasAccess = (view: AppView): boolean => {
    return userPermissions[view]?.hasAccess === true;
  };

  const NavHeader: React.FC<{ label: string }> = ({ label }) => (
    <h3 className={`px-3 mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{label}</h3>
  );

  return (
    <aside className={`bg-white h-screen fixed top-0 left-0 shadow-lg flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center mb-8 transition-all duration-300 ${isCollapsed ? 'px-0 justify-center h-[96px]' : 'px-4 h-[96px]'}`}>
          <div className="bg-brand-primary p-2 rounded-lg">
            <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold text-brand-secondary ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>ClinicFlow</h1>
      </div>
      <nav className="flex-1 px-2 overflow-y-auto overflow-x-hidden">
        <ul>
          {hasAccess(AppView.DASHBOARD) && <NavHeader label="Main" />}
          {hasAccess(AppView.DASHBOARD) && <NavItem
            icon={<DashboardIcon className="w-6 h-6" />}
            label="Dashboard"
            isActive={currentView === AppView.DASHBOARD}
            onClick={() => setView(AppView.DASHBOARD)}
            isCollapsed={isCollapsed}
          />}
          {hasAccess(AppView.APPOINTMENT_CALENDAR) && <NavItem
            icon={<AppointmentsIcon className="w-6 h-6" />}
            label="Appointments"
            isActive={currentView === AppView.APPOINTMENT_CALENDAR}
            onClick={() => setView(AppView.APPOINTMENT_CALENDAR)}
            isCollapsed={isCollapsed}
          />}
          {hasAccess(AppView.PATIENT_RECORDS) && <NavItem
            icon={<PatientRecordIcon className="w-6 h-6" />}
            label="Patient Records"
            isActive={currentView === AppView.PATIENT_RECORDS}
            onClick={() => setView(AppView.PATIENT_RECORDS)}
            isCollapsed={isCollapsed}
          />}

          {(hasAccess(AppView.USER_MANAGEMENT) || hasAccess(AppView.ACCESS_PERMISSION) || hasAccess(AppView.PATIENT_BILLS) || hasAccess(AppView.DRUGS) || hasAccess(AppView.PROCEDURES) || hasAccess(AppView.DRUG_FREQUENCY_RULES)) && <NavHeader label="Management" />}
          
          {(hasAccess(AppView.USER_MANAGEMENT) || hasAccess(AppView.ACCESS_PERMISSION)) && (
            <li 
              className="relative group"
              onMouseEnter={() => setIsAdminMenuOpen(true)}
              onMouseLeave={() => setIsAdminMenuOpen(false)}
            >
              <div
                className={`flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                  isAdministratorActive
                    ? 'bg-brand-light text-brand-primary'
                    : 'text-text-secondary hover:bg-brand-light hover:text-brand-primary'
                }`}
              >
                <div className="flex items-center flex-shrink-0">
                  <AdminIcon className="w-6 h-6" />
                  <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Administrator</span>
                </div>
                <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isAdminMenuOpen && !isCollapsed ? 'rotate-90' : ''} ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} />
              </div>

               {isCollapsed && (
                <div className="absolute left-full ml-2 w-56 bg-white rounded-md shadow-lg py-2 px-2 ring-1 ring-black ring-opacity-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
                    <h3 className="px-2 py-1 text-sm font-semibold text-text-primary">Administrator</h3>
                    <div className="border-t my-1"></div>
                    <ul className="list-none p-0 space-y-1">
                      {hasAccess(AppView.USER_MANAGEMENT) && <NavItem icon={<UserManagementIcon className="w-5 h-5" />} label="User Management" isActive={currentView===AppView.USER_MANAGEMENT} onClick={()=>setView(AppView.USER_MANAGEMENT)} isCollapsed={false} isSubItem />}
                      {hasAccess(AppView.ACCESS_PERMISSION) && <NavItem icon={<LockClosedIcon className="w-5 h-5" />} label="Access Permissions" isActive={currentView===AppView.ACCESS_PERMISSION} onClick={()=>setView(AppView.ACCESS_PERMISSION)} isCollapsed={false} isSubItem />}
                    </ul>
                </div>
              )}
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isAdminMenuOpen && !isCollapsed ? 'max-h-40' : 'max-h-0'}`}>
                <ul className="pl-4 pt-1">
                  {hasAccess(AppView.USER_MANAGEMENT) && <NavItem icon={<UserManagementIcon className="w-5 h-5" />} label="User Management" isActive={currentView === AppView.USER_MANAGEMENT} onClick={() => setView(AppView.USER_MANAGEMENT)} isCollapsed={isCollapsed} isSubItem />}
                  {hasAccess(AppView.ACCESS_PERMISSION) && <NavItem icon={<LockClosedIcon className="w-5 h-5" />} label="Access Permissions" isActive={currentView === AppView.ACCESS_PERMISSION} onClick={() => setView(AppView.ACCESS_PERMISSION)} isCollapsed={isCollapsed} isSubItem />}
                </ul>
              </div>
            </li>
          )}

          {(hasAccess(AppView.PATIENT_BILLS) || hasAccess(AppView.FINANCIAL_RECORDS) || hasAccess(AppView.UNPAID_BILLS)) && (
             <li 
                className="relative group"
                onMouseEnter={() => setIsAccountsMenuOpen(true)}
                onMouseLeave={() => setIsAccountsMenuOpen(false)}
            >
                <div
                    className={`flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                    isAccountsActive
                        ? 'bg-brand-light text-brand-primary'
                        : 'text-text-secondary hover:bg-brand-light hover:text-brand-primary'
                    }`}
                >
                    <div className="flex items-center flex-shrink-0">
                    <BillingIcon className="w-6 h-6" />
                    <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Accounts</span>
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isAccountsMenuOpen && !isCollapsed ? 'rotate-90' : ''} ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} />
                </div>

                {isCollapsed && (
                     <div className="absolute left-full ml-2 w-56 bg-white rounded-md shadow-lg py-2 px-2 ring-1 ring-black ring-opacity-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
                        <h3 className="px-2 py-1 text-sm font-semibold text-text-primary">Accounts</h3>
                        <div className="border-t my-1"></div>
                        <ul className="list-none p-0 space-y-1">
                            {hasAccess(AppView.PATIENT_BILLS) && <NavItem icon={<UserGroupIcon className="w-5 h-5" />} label="Patient Bills" isActive={currentView===AppView.PATIENT_BILLS} onClick={()=>setView(AppView.PATIENT_BILLS)} isCollapsed={false} isSubItem />}
                            {hasAccess(AppView.FINANCIAL_RECORDS) && <NavItem icon={<FolderOpenIcon className="w-5 h-5" />} label="Financial Records" isActive={currentView===AppView.FINANCIAL_RECORDS} onClick={()=>setView(AppView.FINANCIAL_RECORDS)} isCollapsed={false} isSubItem />}
                            {hasAccess(AppView.UNPAID_BILLS) && <NavItem icon={<BillingIcon className="w-5 h-5" />} label="Unpaid Bills" isActive={currentView===AppView.UNPAID_BILLS} onClick={()=>setView(AppView.UNPAID_BILLS)} isCollapsed={false} isSubItem />}
                        </ul>
                    </div>
                )}
                
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isAccountsMenuOpen && !isCollapsed ? 'max-h-48' : 'max-h-0'}`}>
                    <ul className="pl-4 pt-1">
                        {hasAccess(AppView.PATIENT_BILLS) && <NavItem icon={<UserGroupIcon className="w-5 h-5" />} label="Patient Bills" isActive={currentView===AppView.PATIENT_BILLS} onClick={()=>setView(AppView.PATIENT_BILLS)} isCollapsed={isCollapsed} isSubItem />}
                        {hasAccess(AppView.FINANCIAL_RECORDS) && <NavItem icon={<FolderOpenIcon className="w-5 h-5" />} label="Financial Records" isActive={currentView===AppView.FINANCIAL_RECORDS} onClick={()=>setView(AppView.FINANCIAL_RECORDS)} isCollapsed={isCollapsed} isSubItem />}
                        {hasAccess(AppView.UNPAID_BILLS) && <NavItem icon={<BillingIcon className="w-5 h-5" />} label="Unpaid Bills" isActive={currentView===AppView.UNPAID_BILLS} onClick={()=>setView(AppView.UNPAID_BILLS)} isCollapsed={isCollapsed} isSubItem />}
                    </ul>
                </div>
            </li>
          )}

          {(hasAccess(AppView.DRUGS) || hasAccess(AppView.DRUG_FREQUENCY_RULES)) && (
            <li 
                className="relative group"
                onMouseEnter={() => setIsDrugsMenuOpen(true)}
                onMouseLeave={() => setIsDrugsMenuOpen(false)}
            >
              <div
                className={`flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                  isDrugsMenuActive
                    ? 'bg-brand-light text-brand-primary'
                    : 'text-text-secondary hover:bg-brand-light hover:text-brand-primary'
                }`}
              >
                <div className="flex items-center flex-shrink-0">
                  <PillIcon className="w-6 h-6" />
                  <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Drugs</span>
                </div>
                <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isDrugsMenuOpen && !isCollapsed ? 'rotate-90' : ''} ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} />
              </div>

              {isCollapsed && (
                <div className="absolute left-full ml-2 w-56 bg-white rounded-md shadow-lg py-2 px-2 ring-1 ring-black ring-opacity-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
                    <h3 className="px-2 py-1 text-sm font-semibold text-text-primary">Drugs</h3>
                    <div className="border-t my-1"></div>
                    <ul className="list-none p-0 space-y-1">
                       {hasAccess(AppView.DRUGS) && <NavItem icon={<PillIcon className="w-5 h-5" />} label="Drug List" isActive={currentView === AppView.DRUGS} onClick={() => setView(AppView.DRUGS)} isCollapsed={false} isSubItem />}
                       {hasAccess(AppView.DRUG_FREQUENCY_RULES) && <NavItem icon={<FrequencyIcon className="w-5 h-5" />} label="Frequency Rules" isActive={currentView === AppView.DRUG_FREQUENCY_RULES} onClick={() => setView(AppView.DRUG_FREQUENCY_RULES)} isCollapsed={false} isSubItem />}
                    </ul>
                </div>
              )}
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDrugsMenuOpen && !isCollapsed ? 'max-h-40' : 'max-h-0'}`}>
                <ul className="pl-4 pt-1">
                  {hasAccess(AppView.DRUGS) && <NavItem icon={<PillIcon className="w-5 h-5" />} label="Drug List" isActive={currentView === AppView.DRUGS} onClick={() => setView(AppView.DRUGS)} isCollapsed={isCollapsed} isSubItem />}
                  {hasAccess(AppView.DRUG_FREQUENCY_RULES) && <NavItem icon={<FrequencyIcon className="w-5 h-5" />} label="Frequency Rules" isActive={currentView === AppView.DRUG_FREQUENCY_RULES} onClick={() => setView(AppView.DRUG_FREQUENCY_RULES)} isCollapsed={isCollapsed} isSubItem />}
                </ul>
              </div>
            </li>
          )}

          {hasAccess(AppView.PROCEDURES) && (
            <li 
                className="relative group"
                onMouseEnter={() => setIsProceduresMenuOpen(true)}
                onMouseLeave={() => setIsProceduresMenuOpen(false)}
            >
              <div
                className={`flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                  isProceduresMenuActive
                    ? 'bg-brand-light text-brand-primary'
                    : 'text-text-secondary hover:bg-brand-light hover:text-brand-primary'
                }`}
              >
                <div className="flex items-center flex-shrink-0">
                  <ProcedureIcon className="w-6 h-6" />
                  <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Procedures</span>
                </div>
                <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isProceduresMenuOpen && !isCollapsed ? 'rotate-90' : ''} ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`} />
              </div>

              {isCollapsed && (
                <div className="absolute left-full ml-2 w-56 bg-white rounded-md shadow-lg py-2 px-2 ring-1 ring-black ring-opacity-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
                    <h3 className="px-2 py-1 text-sm font-semibold text-text-primary">Procedures</h3>
                    <div className="border-t my-1"></div>
                    <ul className="list-none p-0 space-y-1">
                      {hasAccess(AppView.PROCEDURES) && <NavItem icon={<ProcedureIcon className="w-5 h-5" />} label="Procedure List" isActive={currentView === AppView.PROCEDURES} onClick={() => setView(AppView.PROCEDURES)} isCollapsed={false} isSubItem />}
                    </ul>
                </div>
              )}
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isProceduresMenuOpen && !isCollapsed ? 'max-h-40' : 'max-h-0'}`}>
                <ul className="pl-4 pt-1">
                  {hasAccess(AppView.PROCEDURES) && <NavItem icon={<ProcedureIcon className="w-5 h-5" />} label="Procedure List" isActive={currentView === AppView.PROCEDURES} onClick={() => setView(AppView.PROCEDURES)} isCollapsed={isCollapsed} isSubItem />}
                </ul>
              </div>
            </li>
          )}
          
          {(hasAccess(AppView.MIS) || hasAccess(AppView.AI_ASSISTANT)) && <NavHeader label="Tools" />}
          {hasAccess(AppView.MIS) && <NavItem icon={<ChartBarIcon className="w-6 h-6"/>} label="MIS" isActive={currentView===AppView.MIS} onClick={()=>setView(AppView.MIS)} isCollapsed={isCollapsed}/>}
          {hasAccess(AppView.AI_ASSISTANT) && <NavItem icon={<AiAssistantIcon className="w-6 h-6"/>} label="AI Assistant" isActive={currentView===AppView.AI_ASSISTANT} onClick={()=>setView(AppView.AI_ASSISTANT)} isCollapsed={isCollapsed}/>}
        </ul>
      </nav>
      
      <div className="mt-auto p-2">
         <div className="relative group">
            <button
              onClick={onLogout}
              className="flex items-center p-3 my-1 w-full rounded-lg cursor-pointer transition-colors duration-200 text-text-secondary hover:bg-red-100 hover:text-red-700"
            >
              <LogoutIcon className="w-6 h-6 flex-shrink-0" />
              <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Logout</span>
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
                Logout
              </div>
            )}
        </div>

        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center p-3 mt-2 w-full rounded-lg cursor-pointer transition-colors duration-200 bg-brand-light text-brand-primary hover:bg-brand-secondary hover:text-white"
        >
          <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}/>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;