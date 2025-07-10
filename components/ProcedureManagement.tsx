
import React, { useState, useEffect } from 'react';
import { Procedure, User, RolePermissions, AppView } from '../types';
import { CloseIcon, EditIcon, DeleteIcon, UploadIcon } from './icons';
import { BulkUploadModal } from './BulkUploadModal';

// Props for the main component
interface ProcedureManagementProps {
  procedures: Procedure[];
  setProcedures: React.Dispatch<React.SetStateAction<Procedure[]>>;
  currentUser: User;
  rolePermissions: RolePermissions;
}

const initialProcedureState: Omit<Procedure, 'id'> = {
    name: '',
    cost: 0,
};

// Modal for Adding/Editing a Procedure
interface ProcedureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (procedure: Omit<Procedure, 'id'> | Procedure) => void;
  procedureToEdit: Procedure | null;
}

const ProcedureFormModal: React.FC<ProcedureFormModalProps> = ({ isOpen, onClose, onSave, procedureToEdit }) => {
    const [formData, setFormData] = useState(procedureToEdit || initialProcedureState);
    const [error, setError] = useState('');
    
    const mode = procedureToEdit ? 'Update' : 'Add';

    useEffect(() => {
        if (isOpen) {
            setFormData(procedureToEdit || initialProcedureState);
            setError('');
        }
    }, [procedureToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.cost <= 0) {
            setError('Procedure Name and a valid positive Amount are required.');
            return;
        }
        setError('');
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">{mode} Procedure</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Procedure Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Amount (GH₵)</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} required className="mt-1 input-field" min="0" step="0.01" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{mode} Procedure</button>
                    </div>
                </form>
                <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
            </div>
        </div>
    );
};

// Modal for Deleting Procedure
const DeleteConfirmationModal: React.FC<{ procedure: Procedure | null; onClose: () => void; onConfirm: (id: number) => void }> = ({ procedure, onClose, onConfirm }) => {
    if (!procedure) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-text-primary">Confirm Deletion</h2>
                <p className="my-4 text-text-secondary">Are you sure you want to delete the procedure <strong>{procedure.name}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { onConfirm(procedure.id); onClose(); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

const ProcedureManagement: React.FC<ProcedureManagementProps> = ({ procedures, setProcedures, currentUser, rolePermissions }) => {
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, procedure: Procedure | null }>({ type: null, procedure: null });
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const procedurePermissions = rolePermissions[currentUser.role]?.[AppView.PROCEDURES];
  const canAdd = rolePermissions[currentUser.role]?.[AppView.ADD_PROCEDURE]?.hasAccess ?? false;
  const canUpdate = procedurePermissions?.canUpdate ?? false;
  const canDelete = procedurePermissions?.canDelete ?? false;
  const canBulkUpload = rolePermissions[currentUser.role]?.[AppView.PERFORM_BULK_UPLOAD]?.hasAccess ?? false;

  const handleSaveProcedure = (procedureData: Omit<Procedure, 'id'> | Procedure) => {
    if ('id' in procedureData) { // Update existing
        setProcedures(prev => prev.map(p => p.id === procedureData.id ? procedureData : p));
    } else { // Add new
        const newId = procedures.length > 0 ? Math.max(...procedures.map(p => p.id)) + 1 : 1;
        const newProcedure: Procedure = { ...procedureData, id: newId };
        setProcedures(prev => [...prev, newProcedure]);
    }
  };

  const handleDeleteProcedure = (id: number) => {
    setProcedures(prev => prev.filter(p => p.id !== id));
  };
  
  const closeModal = () => setModalState({ type: null, procedure: null });

  const handleBulkUploadProcedures = (newProcedures: Omit<Procedure, 'id'>[]) => {
    let lastId = procedures.length > 0 ? Math.max(...procedures.map(p => p.id)) : 0;
    const proceduresWithIds = newProcedures.map(proc => ({
        ...proc,
        id: ++lastId,
    }));
    setProcedures(prev => [...prev, ...proceduresWithIds]);
  };

  const parseProcedureLine = (parts: string[]): Omit<Procedure, 'id'> | null => {
      const [name, costStr] = parts;
      const cost = parseFloat(costStr);
      if (!name || isNaN(cost) || cost < 0) return null;
      return { name, cost };
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Procedure Management</h1>
            <p className="text-text-secondary mt-1">Manage clinical procedures and associated data.</p>
        </div>
        <div className="flex items-center space-x-2">
            {canBulkUpload && (
                <button onClick={() => setIsBulkUploadOpen(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2">
                    <UploadIcon className="h-5 w-5" />
                    <span>Bulk Upload</span>
                </button>
            )}
            {canAdd && (
                <button onClick={() => setModalState({ type: 'add', procedure: null })} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Add New Procedure</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-text-secondary">Procedure Name</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Cost</th>
                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map(proc => (
                <tr key={proc.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-text-primary">{proc.name}</td>
                  <td className="p-3 text-text-secondary">GH₵{proc.cost.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center space-x-2">
                        {canUpdate && <button onClick={() => setModalState({ type: 'edit', procedure: proc })} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"><EditIcon className="w-5 h-5" /></button>}
                        {canDelete && <button onClick={() => setModalState({ type: 'delete', procedure: proc })} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition"><DeleteIcon className="w-5 h-5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ProcedureFormModal 
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={closeModal}
        onSave={handleSaveProcedure}
        procedureToEdit={modalState.type === 'edit' ? modalState.procedure : null}
      />
      <DeleteConfirmationModal 
        procedure={modalState.type === 'delete' ? modalState.procedure : null} 
        onClose={closeModal} 
        onConfirm={handleDeleteProcedure}
      />
      <BulkUploadModal<Omit<Procedure, 'id'>>
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUploadProcedures}
        title="Bulk Upload Procedures"
        sampleFileName="procedures_sample.csv"
        sampleHeaders={['name', 'cost']}
        parseLine={parseProcedureLine}
      />
    </div>
  );
};

export default ProcedureManagement;