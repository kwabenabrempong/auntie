import React, { useState, useEffect } from 'react';
import { DrugFrequencyRule } from '../types';
import { CloseIcon, EditIcon, DeleteIcon } from './icons';

// Props for the main component
interface DrugFrequencyRulesProps {
  frequencyRules: DrugFrequencyRule[];
  setFrequencyRules: React.Dispatch<React.SetStateAction<DrugFrequencyRule[]>>;
}

const initialRuleState: Omit<DrugFrequencyRule, 'id'> = {
    code: '',
    description: '',
    multiplier: 0,
};

// Modal for Adding/Editing a Rule
interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<DrugFrequencyRule, 'id'> | DrugFrequencyRule) => void;
  ruleToEdit: DrugFrequencyRule | null;
}

const RuleFormModal: React.FC<RuleFormModalProps> = ({ isOpen, onClose, onSave, ruleToEdit }) => {
    const [formData, setFormData] = useState(ruleToEdit || initialRuleState);
    const [error, setError] = useState('');
    
    const mode = ruleToEdit ? 'Update' : 'Add';

    useEffect(() => {
        if (isOpen) {
            setFormData(ruleToEdit || initialRuleState);
            setError('');
        }
    }, [ruleToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code.trim() || !formData.description.trim()) {
            setError('Code and Description are required.');
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
                    <h2 className="text-xl font-bold text-text-primary">{mode} Frequency Rule</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Code (e.g., BID)</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Description (e.g., Twice a day)</label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Multiplier (e.g., 2)</label>
                            <input type="number" name="multiplier" value={formData.multiplier} onChange={handleChange} required className="mt-1 input-field" min="0" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{mode} Rule</button>
                    </div>
                </form>
                <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
            </div>
        </div>
    );
};

// Modal for Deleting Rule
const DeleteConfirmationModal: React.FC<{ rule: DrugFrequencyRule | null; onClose: () => void; onConfirm: (id: number) => void }> = ({ rule, onClose, onConfirm }) => {
    if (!rule) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-text-primary">Confirm Deletion</h2>
                <p className="my-4 text-text-secondary">Are you sure you want to delete the rule for <strong>{rule.code}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { onConfirm(rule.id); onClose(); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

const DrugFrequencyRules: React.FC<DrugFrequencyRulesProps> = ({ frequencyRules, setFrequencyRules }) => {
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, rule: DrugFrequencyRule | null }>({ type: null, rule: null });

  const handleSaveRule = (ruleData: Omit<DrugFrequencyRule, 'id'> | DrugFrequencyRule) => {
    if ('id' in ruleData) { // Update existing
        setFrequencyRules(prev => prev.map(r => r.id === ruleData.id ? ruleData : r));
    } else { // Add new
        const newId = frequencyRules.length > 0 ? Math.max(...frequencyRules.map(r => r.id)) + 1 : 1;
        const newRule: DrugFrequencyRule = { ...ruleData, id: newId };
        setFrequencyRules(prev => [...prev, newRule]);
    }
  };

  const handleDeleteRule = (id: number) => {
    setFrequencyRules(prev => prev.filter(r => r.id !== id));
  };
  
  const closeModal = () => setModalState({ type: null, rule: null });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Drug Frequency Rules</h1>
            <p className="text-text-secondary mt-1">Manage rules for calculating prescription quantities.</p>
        </div>
        <button onClick={() => setModalState({ type: 'add', rule: null })} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span>Add New Rule</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-text-secondary">Code</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Description</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Multiplier</th>
                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frequencyRules.map(rule => (
                <tr key={rule.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm text-brand-secondary">{rule.code}</td>
                  <td className="p-3 text-text-primary">{rule.description}</td>
                  <td className="p-3 font-medium text-text-primary">{rule.multiplier}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => setModalState({ type: 'edit', rule: rule })} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={() => setModalState({ type: 'delete', rule: rule })} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition"><DeleteIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <RuleFormModal 
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={closeModal}
        onSave={handleSaveRule}
        ruleToEdit={modalState.type === 'edit' ? modalState.rule : null}
      />
      <DeleteConfirmationModal 
        rule={modalState.type === 'delete' ? modalState.rule : null} 
        onClose={closeModal} 
        onConfirm={handleDeleteRule}
      />
    </div>
  );
};

export default DrugFrequencyRules;
