

import React, { useState, useEffect } from 'react';
import { Drug, Formulation, User, RolePermissions, AppView } from '../types';
import { CloseIcon, EditIcon, DeleteIcon, UploadIcon } from './icons';
import { BulkUploadModal } from './BulkUploadModal';

// Props for the main component
interface DrugsManagementProps {
  drugs: Drug[];
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  currentUser: User;
  rolePermissions: RolePermissions;
}

const initialDrugState: Omit<Drug, 'id'> = {
    name: '',
    formulation: Formulation.TABLET,
    strength: '',
};

// Modal for Adding/Editing a Drug
interface DrugFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drug: Omit<Drug, 'id'> | Drug) => void;
  drugToEdit: Drug | null;
}

const DrugFormModal: React.FC<DrugFormModalProps> = ({ isOpen, onClose, onSave, drugToEdit }) => {
    const [formData, setFormData] = useState(drugToEdit || initialDrugState);
    const [error, setError] = useState('');
    
    const mode = drugToEdit ? 'Update' : 'Add';

    useEffect(() => {
        if (isOpen) {
            setFormData(drugToEdit || initialDrugState);
            setError('');
        }
    }, [drugToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.strength.trim()) {
            setError('Drug Name and Strength are required.');
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
                    <h2 className="text-xl font-bold text-text-primary">{mode} Drug</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Drug Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Formulation</label>
                            <select name="formulation" value={formData.formulation} onChange={handleChange} className="mt-1 input-field">
                                {Object.values(Formulation).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Strength</label>
                            <input type="text" name="strength" value={formData.strength} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{mode} Drug</button>
                    </div>
                </form>
                <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
            </div>
        </div>
    );
};

// Modal for Deleting Drug
const DeleteConfirmationModal: React.FC<{ drug: Drug | null; onClose: () => void; onConfirm: (id: number) => void }> = ({ drug, onClose, onConfirm }) => {
    if (!drug) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-text-primary">Confirm Deletion</h2>
                <p className="my-4 text-text-secondary">Are you sure you want to delete the drug <strong>{drug.name}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { onConfirm(drug.id); onClose(); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

const DrugsManagement: React.FC<DrugsManagementProps> = ({ drugs, setDrugs, currentUser, rolePermissions }) => {
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, drug: Drug | null }>({ type: null, drug: null });
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const drugPermissions = rolePermissions[currentUser.role]?.[AppView.DRUGS];
  const canAdd = rolePermissions[currentUser.role]?.[AppView.ADD_DRUG]?.hasAccess ?? false;
  const canUpdate = drugPermissions?.canUpdate ?? false;
  const canDelete = drugPermissions?.canDelete ?? false;
  const canBulkUpload = rolePermissions[currentUser.role]?.[AppView.PERFORM_BULK_UPLOAD]?.hasAccess ?? false;


  const handleSaveDrug = (drugData: Omit<Drug, 'id'> | Drug) => {
    if ('id' in drugData) { // Update existing drug
        setDrugs(prev => prev.map(d => d.id === drugData.id ? drugData : d));
    } else { // Add new drug
        const newId = drugs.length > 0 ? Math.max(...drugs.map(d => d.id)) + 1 : 1;
        const newDrug: Drug = { ...drugData, id: newId };
        setDrugs(prev => [...prev, newDrug]);
    }
  };

  const handleDeleteDrug = (id: number) => {
    setDrugs(prev => prev.filter(drug => drug.id !== id));
  };
  
  const closeModal = () => setModalState({ type: null, drug: null });

  const handleBulkUploadDrugs = (newDrugs: Omit<Drug, 'id'>[]) => {
    let lastId = drugs.length > 0 ? Math.max(...drugs.map(d => d.id)) : 0;
    const drugsWithIds = newDrugs.map(drug => ({
        ...drug,
        id: ++lastId,
    }));
    setDrugs(prev => [...prev, ...drugsWithIds]);
  };

  const parseDrugLine = (parts: string[]): Omit<Drug, 'id'> | null => {
      const [name, formulation, strength] = parts;
      if (!name || !formulation || !strength) return null;
      
      const isValidFormulation = Object.values(Formulation).map(f => f.toLowerCase()).includes(formulation.toLowerCase());
      if (!isValidFormulation) return null;

      // Find the correct case for the formulation
      const correctFormulation = Object.values(Formulation).find(f => f.toLowerCase() === formulation.toLowerCase());

      return { name, formulation: correctFormulation || Formulation.TABLET, strength };
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Drugs Management</h1>
            <p className="text-text-secondary mt-1">Manage pharmacy inventory and drug information.</p>
        </div>
        <div className="flex items-center space-x-2">
            {canBulkUpload && (
                <button onClick={() => setIsBulkUploadOpen(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2">
                    <UploadIcon className="h-5 w-5" />
                    <span>Bulk Upload</span>
                </button>
            )}
            {canAdd && (
                <button onClick={() => setModalState({ type: 'add', drug: null })} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Add New Drug</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-text-secondary">Drug Name</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Formulation</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Strength</th>
                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map(drug => (
                <tr key={drug.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-text-primary">{drug.name}</td>
                  <td className="p-3 text-text-secondary">{drug.formulation}</td>
                  <td className="p-3 text-text-secondary">{drug.strength}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center space-x-2">
                        {canUpdate && <button onClick={() => setModalState({ type: 'edit', drug: drug })} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"><EditIcon className="w-5 h-5" /></button>}
                        {canDelete && <button onClick={() => setModalState({ type: 'delete', drug: drug })} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition"><DeleteIcon className="w-5 h-5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <DrugFormModal 
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={closeModal}
        onSave={handleSaveDrug}
        drugToEdit={modalState.type === 'edit' ? modalState.drug : null}
      />
      <DeleteConfirmationModal 
        drug={modalState.type === 'delete' ? modalState.drug : null} 
        onClose={closeModal} 
        onConfirm={handleDeleteDrug}
      />
       <BulkUploadModal<Omit<Drug, 'id'>>
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUploadDrugs}
        title="Bulk Upload Drugs"
        sampleFileName="drugs_sample.csv"
        sampleHeaders={['name', 'formulation', 'strength']}
        parseLine={parseDrugLine}
      />
    </div>
  );
};

export default DrugsManagement;