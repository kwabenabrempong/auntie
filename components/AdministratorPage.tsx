
import React, { useState } from 'react';
import UserManagement from './UserManagement';
import AccessPermission from './AccessPermission';
import { User, RolePermissions } from '../types';

interface AdministratorPageProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
}

type AdminTab = 'users' | 'permissions';

const AdministratorPage: React.FC<AdministratorPageProps> = ({ users, setUsers, rolePermissions, setRolePermissions }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const TabButton: React.FC<{ label: string; tabId: AdminTab; }> = ({ label, tabId }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`py-2 px-6 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
        activeTab === tabId
          ? 'bg-white border-t border-x border-gray-200 text-brand-primary'
          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Administrator</h1>
        <p className="text-text-secondary mt-1">Manage users and access permissions for the clinic.</p>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
          <TabButton label="User Management" tabId="users" />
          <TabButton label="Access Permissions" tabId="permissions" />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
        {activeTab === 'permissions' && <AccessPermission rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />}
      </div>
    </div>
  );
};

export default AdministratorPage;
