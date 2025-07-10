

import React, { useState } from 'react';
import { UserRole, AppView, RolePermissions, ViewPermission } from '../types';

interface AccessPermissionProps {
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
}

export const viewLabels: Record<string, string> = {
  // Core
  [AppView.DASHBOARD]: 'Dashboard',
  [AppView.APPOINTMENT_CALENDAR]: 'Appointments',
  [AppView.PATIENT_RECORDS]: 'Patient Records',
  [AppView.AI_ASSISTANT]: 'AI Assistant',
  // Management
  [AppView.USER_MANAGEMENT]: 'User Management',
  [AppView.ACCESS_PERMISSION]: 'Access Permissions',
  [AppView.DRUGS]: 'Drugs Management',
  [AppView.PROCEDURES]: 'Procedure Management',
  [AppView.DRUG_FREQUENCY_RULES]: 'Drug Frequency Rules',
  // Accounts
  [AppView.PATIENT_BILLS]: 'Patient Bills',
  [AppView.FINANCIAL_RECORDS]: 'Financial Records',
  [AppView.UNPAID_BILLS]: 'Unpaid Bills',
  // Reports & Data
  [AppView.MIS]: 'MIS Reports',
  [AppView.PERFORM_BULK_UPLOAD]: 'Bulk Upload Data',
  [AppView.EXPORT_DATA]: 'Export Data',
  [AppView.VIEW_AUDIT_LOGS]: 'View Audit Logs',
  // Creation Actions
  [AppView.ADD_PATIENT]: 'Add New Patient',
  [AppView.ADD_DRUG]: 'Add New Drug',
  [AppView.ADD_APPOINTMENT]: 'Add New Appointment',
  [AppView.ADD_PROCEDURE]: 'Add New Procedure',
};

const permissionGroups = {
    'Core Modules': [AppView.DASHBOARD, AppView.APPOINTMENT_CALENDAR, AppView.PATIENT_RECORDS, AppView.AI_ASSISTANT],
    'Management Modules': [AppView.USER_MANAGEMENT, AppView.ACCESS_PERMISSION, AppView.DRUGS, AppView.PROCEDURES, AppView.DRUG_FREQUENCY_RULES],
    'Accounting': [AppView.PATIENT_BILLS, AppView.FINANCIAL_RECORDS, AppView.UNPAID_BILLS],
    'Creation & Data': [AppView.ADD_PATIENT, AppView.ADD_APPOINTMENT, AppView.ADD_DRUG, AppView.ADD_PROCEDURE, AppView.PERFORM_BULK_UPLOAD],
    'Reporting & Security': [AppView.MIS, AppView.EXPORT_DATA, AppView.VIEW_AUDIT_LOGS],
};

const granularPermissionViews: AppView[] = [
    AppView.PATIENT_RECORDS,
    AppView.DRUGS,
    AppView.PROCEDURES,
    AppView.PATIENT_BILLS,
    AppView.FINANCIAL_RECORDS,
    AppView.UNPAID_BILLS,
];

const AccessPermission: React.FC<AccessPermissionProps> = ({ rolePermissions, setRolePermissions }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.DOCTOR);

  const handlePermissionChange = (view: AppView, permissionType: keyof ViewPermission, isChecked: boolean) => {
    setRolePermissions(prev => {
        const newPermissions = { ...prev };
        const rolePerms = { ...(newPermissions[selectedRole] || {}) };
        const viewPerms = { 
            hasAccess: false, 
            canUpdate: false, 
            canDelete: false, 
            ...(rolePerms[view] || {}) 
        };

        viewPerms[permissionType] = isChecked;

        if (permissionType === 'hasAccess' && !isChecked) {
            viewPerms.canUpdate = false;
            viewPerms.canDelete = false;
        }

        if ((permissionType === 'canUpdate' || permissionType === 'canDelete') && isChecked) {
            viewPerms.hasAccess = true;
        }

        rolePerms[view] = viewPerms;
        newPermissions[selectedRole] = rolePerms;
        return newPermissions;
    });
  };

  const currentPermissions = rolePermissions[selectedRole] || {};

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Access Permissions</h1>
        <p className="text-text-secondary mt-1">Configure which roles can access different parts of the application.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-text-primary mb-4">Set Role Permissions</h2>
        <div className="mb-6">
          <label htmlFor="role-select" className="block text-sm font-medium text-text-secondary mb-2">Select a role to manage permissions:</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="bg-gray-50 border border-gray-300 text-text-primary text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full md:w-1/3 p-2.5"
          >
            {Object.values(UserRole).filter(role => role !== UserRole.ADMIN).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
             <option key={UserRole.ADMIN} value={UserRole.ADMIN}>Admin (Read-only)</option>
          </select>
        </div>

        <div className="space-y-6">
          {Object.entries(permissionGroups).map(([groupTitle, views]) => (
            <fieldset key={groupTitle} className="border border-gray-200 p-4 rounded-lg">
              <legend className="text-lg font-semibold text-brand-secondary px-2">{groupTitle}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {views.map(view => {
                  const viewLabel = viewLabels[view] || view;
                  const isGranular = granularPermissionViews.includes(view);
                  const viewPerms = currentPermissions[view] || { hasAccess: false, canUpdate: false, canDelete: false };
                  const isRoleAdmin = selectedRole === UserRole.ADMIN;

                  return (
                    <div key={view} className={`p-4 border rounded-lg ${isRoleAdmin ? 'bg-gray-100' : ''}`}>
                      <h4 className="font-semibold text-text-primary mb-2">{viewLabel}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`perm-${view}-access`} className="text-sm text-text-secondary">Access</label>
                            <input
                                type="checkbox"
                                id={`perm-${view}-access`}
                                checked={!!viewPerms.hasAccess}
                                onChange={(e) => handlePermissionChange(view, 'hasAccess', e.target.checked)}
                                disabled={isRoleAdmin}
                                className="w-5 h-5 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary"
                            />
                        </div>
                        {isGranular && (
                            <>
                                <div className={`flex items-center justify-between transition-opacity ${viewPerms.hasAccess ? 'opacity-100' : 'opacity-50'}`}>
                                    <label htmlFor={`perm-${view}-update`} className="text-sm text-text-secondary">Update</label>
                                    <input
                                        type="checkbox"
                                        id={`perm-${view}-update`}
                                        checked={!!viewPerms.canUpdate}
                                        onChange={(e) => handlePermissionChange(view, 'canUpdate', e.target.checked)}
                                        disabled={isRoleAdmin || !viewPerms.hasAccess}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className={`flex items-center justify-between transition-opacity ${viewPerms.hasAccess ? 'opacity-100' : 'opacity-50'}`}>
                                    <label htmlFor={`perm-${view}-delete`} className="text-sm text-text-secondary">Delete</label>
                                    <input
                                        type="checkbox"
                                        id={`perm-${view}-delete`}
                                        checked={!!viewPerms.canDelete}
                                        onChange={(e) => handlePermissionChange(view, 'canDelete', e.target.checked)}
                                        disabled={isRoleAdmin || !viewPerms.hasAccess}
                                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                    />
                                </div>
                            </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default AccessPermission;