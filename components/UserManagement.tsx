
import React, { useState, useEffect } from 'react';
import { User, UserRole, Designation, Gender } from '../types';
import { CloseIcon, ViewIcon, EditIcon, DeleteIcon } from './icons';

// Props for the main component
interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

// Helper to get full name
const getFullName = (user: { firstName: string, middleName?: string, lastName: string }) => {
    return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
}

// Role color styling
const getRoleColor = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'bg-red-100 text-red-800';
    case UserRole.DOCTOR: return 'bg-blue-100 text-blue-800';
    case UserRole.NURSE: return 'bg-green-100 text-green-800';
    case UserRole.RECEPTION: return 'bg-yellow-100 text-yellow-800';
    case UserRole.ACCOUNT: return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

type UserFormData = Omit<User, 'id' | 'avatarUrl' | 'username' | 'password'>;

const initialUserState: UserFormData = {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    role: UserRole.RECEPTION,
    designation: Designation.EMPLOYEE,
    gender: 'Other',
    dob: '',
    professionalCode: '',
    mobileNumber: '',
    address: '',
    dateOfJoining: '',
};

// Modal for Adding/Editing a User
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [formData, setFormData] = useState<Partial<User>>(userToEdit || initialUserState);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const mode = userToEdit ? 'Update' : 'Add';

    useEffect(() => {
        if (isOpen) {
            setFormData(userToEdit || initialUserState);
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'Update' && newPassword && newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');

        const finalData = { ...formData } as User;
        if(userToEdit) {
            finalData.id = userToEdit.id;
            finalData.username = userToEdit.username;
            finalData.avatarUrl = userToEdit.avatarUrl;
        }
        
        if (mode === 'Update' && newPassword) {
            finalData.password = newPassword;
        } else if (userToEdit) {
            finalData.password = userToEdit.password;
        }

        onSave(finalData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">{mode} User</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2 text-lg font-semibold text-brand-secondary pb-2 border-b">Personal Information</div>
                        <div><label className="block text-sm font-medium text-text-secondary">First Name</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Middle Name</label><input type="text" name="middleName" value={formData.middleName || ''} onChange={handleChange} className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Last Name</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Gender</label><select name="gender" value={formData.gender || 'Other'} onChange={handleChange} className="mt-1 input-field"><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Date of Birth</label><input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Mobile Number</label><input type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-text-secondary">Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} rows={2} className="mt-1 input-field" /></div>
                        
                        <div className="md:col-span-2 text-lg font-semibold text-brand-secondary pt-4 pb-2 border-b">Professional Information</div>
                        <div><label className="block text-sm font-medium text-text-secondary">Email Address</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Date of Joining</label><input type="date" name="dateOfJoining" value={formData.dateOfJoining || ''} onChange={handleChange} required className="mt-1 input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary">Designation</label><select name="designation" value={formData.designation || Designation.EMPLOYEE} onChange={handleChange} className="mt-1 input-field">{Object.values(Designation).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-text-secondary">User Role</label><select name="role" value={formData.role || UserRole.RECEPTION} onChange={handleChange} className="mt-1 input-field">{Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-text-secondary">Professional Code</label><input type="text" name="professionalCode" value={formData.professionalCode || ''} onChange={handleChange} required className="mt-1 input-field" /></div>

                        {mode === 'Update' && (
                            <>
                                <div className="md:col-span-2 text-lg font-semibold text-brand-secondary pt-4 pb-2 border-b">Update Password <span className="text-sm font-normal">(Optional)</span></div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary">New Password</label>
                                    <input type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 input-field" autoComplete="new-password"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary">Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 input-field" />
                                </div>
                            </>
                        )}
                        {error && <p className="text-red-500 text-sm md:col-span-2">{error}</p>}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{mode} User</button>
                    </div>
                </form>
                <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
            </div>
        </div>
    );
};

// Modal for Viewing User Details
const UserDetailModal: React.FC<{ user: User | null; onClose: () => void; }> = ({ user, onClose }) => {
    if (!user) return null;
    const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div>
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <p className="text-md text-text-primary">{value || '-'}</p>
        </div>
    );
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={user.avatarUrl} alt={getFullName(user)} className="w-16 h-16 rounded-full" />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-text-primary">{getFullName(user)}</h2>
                            <p className="text-md text-text-secondary">{user.role} - {user.designation}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6 text-text-secondary" /></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto">
                    <DetailItem label="Username" value={user.username} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Mobile Number" value={user.mobileNumber} />
                    <DetailItem label="Date of Birth" value={user.dob} />
                    <DetailItem label="Gender" value={user.gender} />
                    <DetailItem label="Date of Joining" value={user.dateOfJoining} />
                    <DetailItem label="Professional Code" value={user.professionalCode} />
                    <div className="md:col-span-2"><DetailItem label="Address" value={user.address} /></div>
                </div>
                <div className="p-4 mt-auto border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200">Close</button>
                </div>
            </div>
        </div>
    );
};

// Modal for Deleting User
const DeleteConfirmationModal: React.FC<{ user: User | null; onClose: () => void; onConfirm: (id: number) => void }> = ({ user, onClose, onConfirm }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-text-primary">Confirm Deletion</h2>
                <p className="my-4 text-text-secondary">Are you sure you want to delete user <strong>{getFullName(user)}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { onConfirm(user.id); onClose(); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};


const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const [modalState, setModalState] = useState<{ type: 'view' | 'add' | 'edit' | 'delete' | null, user: User | null }>({ type: null, user: null });

  const handleSaveUser = (user: User) => {
    if (user.id) { // Update existing user
        setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else { // Add new user
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const avatarSeed = (user.firstName + user.lastName).toLowerCase().replace(/\s/g, '');
        
        const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
        const middleInitial = user.middleName ? user.middleName.charAt(0) : '';
        const lastName = user.lastName || '';
        const username = `${firstInitial}${middleInitial}${lastName}`.toLowerCase().replace(/\s/g, '');
        
        const newUserWithId: User = {
            ...user,
            id: newId,
            username: username,
            password: 'password@123', // Default password for new users
            avatarUrl: `https://picsum.photos/seed/${avatarSeed}/100/100`,
        };
        setUsers(prev => [...prev, newUserWithId]);
    }
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };
  
  const closeModal = () => setModalState({ type: null, user: null });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
            <p className="text-text-secondary mt-1">Manage staff accounts for the clinic.</p>
        </div>
        <button onClick={() => setModalState({ type: 'add', user: null })} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <ul className="divide-y divide-gray-200">
            {users.map(user => (
              <li 
                key={user.id} 
                onClick={() => setModalState({ type: 'view', user: user })} 
                className="p-4 hover:bg-brand-light cursor-pointer flex justify-between items-center transition-colors"
              >
                <div className="flex items-center">
                  <img src={user.avatarUrl} alt={getFullName(user)} className="w-12 h-12 rounded-full" />
                  <div className="ml-4">
                    <p className="font-bold text-text-primary">{getFullName(user)}</p>
                    <p className="text-sm text-text-secondary">{user.designation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`hidden sm:inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <div className="flex items-center space-x-1">
                      <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'edit', user }); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-white transition"><EditIcon className="w-5 h-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'delete', user }); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-white transition"><DeleteIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
      
      <UserFormModal 
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={closeModal}
        onSave={handleSaveUser}
        userToEdit={modalState.type === 'edit' ? modalState.user : null}
      />
      <UserDetailModal user={modalState.type === 'view' ? modalState.user : null} onClose={closeModal} />
      <DeleteConfirmationModal 
        user={modalState.type === 'delete' ? modalState.user : null} 
        onClose={closeModal} 
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default UserManagement;
