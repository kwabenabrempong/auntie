
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Patient, Visit, EmergencyContact, User, RolePermissions, AppView } from '../types';
import { CloseIcon, ViewIcon, EditIcon, DeleteIcon, ChevronDownIcon, PlusIcon, UserGroupIcon, SearchIcon } from './icons';
import { generatePatientSummary } from '../services/geminiService';

interface PatientListProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  currentUser: User;
  rolePermissions: RolePermissions;
}

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patientToEdit: Patient | null;
}

const initialPatientState: Omit<Patient, 'id' | 'avatarUrl' | 'visits'> = {
    name: '',
    contact: '',
    dob: '',
    gender: 'Other',
    address: '',
    emergencyContact: { name: '', number: '', relation: '' },
};

const PatientFormModal: React.FC<PatientFormModalProps> = ({ isOpen, onClose, onSave, patientToEdit }) => {
    const [formData, setFormData] = useState<Partial<Patient>>(patientToEdit || initialPatientState);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mode = patientToEdit ? 'Update' : 'Add';

    useEffect(() => {
        if (isOpen) {
            const initialData = patientToEdit || initialPatientState;
            setFormData(initialData);
            setPhotoPreview(patientToEdit?.avatarUrl || null);
        }
    }, [patientToEdit, isOpen]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPhotoPreview(dataUrl);
                setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('emergencyContact.')) {
            const field = name.split('.')[1] as keyof EmergencyContact;
            setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact!, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation can be added here
        onSave(formData as Patient);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">{mode} Patient</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6 text-text-secondary" /></button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto">
                     <div className="p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 flex items-center justify-center overflow-hidden border">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Patient" className="w-full h-full object-cover" />
                                ) : (
                                    <UserGroupIcon className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} ref={fileInputRef} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-brand-primary hover:underline">
                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="md:col-span-2"><label className="label-form">Full Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="input-field" /></div>
                            <div><label className="label-form">Telephone Number</label><input type="tel" name="contact" value={formData.contact || ''} onChange={handleChange} required className="input-field" /></div>
                            <div><label className="label-form">Date of Birth</label><input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required className="input-field" /></div>
                            <div><label className="label-form">Gender</label><select name="gender" value={formData.gender || 'Other'} onChange={handleChange} className="input-field"><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div className="md:col-span-2"><label className="label-form">Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} rows={2} className="input-field" /></div>

                            <div className="md:col-span-2 text-lg font-semibold text-brand-secondary pt-4 pb-2 border-b">Emergency Contact</div>
                            <div><label className="label-form">Contact Person</label><input type="text" name="emergencyContact.name" value={formData.emergencyContact?.name || ''} onChange={handleChange} required className="input-field" /></div>
                            <div><label className="label-form">Contact Number</label><input type="tel" name="emergencyContact.number" value={formData.emergencyContact?.number || ''} onChange={handleChange} required className="input-field" /></div>
                            <div><label className="label-form">Relation</label><input type="text" name="emergencyContact.relation" value={formData.emergencyContact?.relation || ''} onChange={handleChange} required className="input-field" /></div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{mode} Patient</button>
                    </div>
                </form>
                <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-field:focus { ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .label-form { display: block; text-sm font-medium text-text-secondary mb-1; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ patient: Patient | null; onClose: () => void; onConfirm: (id: number) => void }> = ({ patient, onClose, onConfirm }) => {
    if (!patient) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-text-primary">Confirm Deletion</h2>
                <p className="my-4 text-text-secondary">Are you sure you want to delete patient <strong>{patient.name}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { onConfirm(patient.id); onClose(); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'visits'>('details');
  const [expandedVisitDates, setExpandedVisitDates] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const handleGenerateSummary = useCallback(async (notes: string) => {
      if (!notes) return;
      setIsLoadingSummary(true);
      setSummaryError('');
      setSummary('');
      try {
        const result = await generatePatientSummary(notes);
        setSummary(result);
      } catch (error) {
        setSummaryError(error instanceof Error ? error.message : 'An unknown error occurred.');
      } finally {
        setIsLoadingSummary(false);
      }
  }, []);

  useEffect(() => {
    if (!patient) {
        setExpandedVisitDates([]);
    }
  }, [patient]);

  if (!patient) return null;

  const toggleVisit = (date: string) => {
    setExpandedVisitDates(prev =>
        prev.includes(date)
            ? prev.filter(d => d !== date)
            : [...prev, date]
    );
    setSummary('');
    setSummaryError('');
  };
  
  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className="text-md text-text-primary">{value || '-'}</p>
    </div>
  );

  const renderVisitDetails = (visit: Visit) => (
      <div className="p-4 bg-gray-50 space-y-4">
        <div>
            <h5 className="font-semibold text-text-primary mb-2">Vitals</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>BP:</strong> {visit.vitals.bloodPressure}</p>
              <p><strong>Heart Rate:</strong> {visit.vitals.heartRate}</p>
              <p><strong>Temp:</strong> {visit.vitals.temperature}</p>
              <p><strong>Resp. Rate:</strong> {visit.vitals.respiratoryRate}</p>
            </div>
        </div>

        <div><h5 className="font-semibold text-text-primary mb-1">History</h5><p className="text-sm text-text-secondary bg-white p-2 rounded">{visit.history || 'N/A'}</p></div>
        <div><h5 className="font-semibold text-text-primary mb-1">Principal Complaints</h5><p className="text-sm text-text-secondary bg-white p-2 rounded">{visit.principalComplaints || 'N/A'}</p></div>
        <div><h5 className="font-semibold text-text-primary mb-1">Treatment Plan</h5><p className="text-sm text-text-secondary bg-white p-2 rounded">{visit.treatmentPlan || 'N/A'}</p></div>

        <div>
            <h5 className="font-semibold text-text-primary mb-2">Prescriptions</h5>
            {visit.prescriptions?.length > 0 ? (
                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-200"><tr><th className="p-2">Drug</th><th className="p-2">Dose</th><th className="p-2">Frequency</th><th className="p-2">Duration</th></tr></thead><tbody>
                    {visit.prescriptions.map(p => (<tr key={p.id} className="border-b"><td className="p-2">{p.drugName} {p.strength}</td><td className="p-2">{p.dose}</td><td className="p-2">{p.frequency}</td><td className="p-2">{p.days} days</td></tr>))}
                </tbody></table></div>
            ) : <p className="text-sm text-text-secondary">No prescriptions issued.</p>}
        </div>
        
        <div>
            <h5 className="font-semibold text-text-primary mb-2">Diagnosis & Bill</h5>
            <ul className="text-sm text-text-secondary space-y-1">
                {visit.diagnosis.map(d => (<li key={d.id} className="flex justify-between"><span>{d.name}</span><span>GH₵{d.cost.toFixed(2)}</span></li>))}
            </ul>
            <div className="flex justify-between font-bold text-text-primary mt-2 pt-2 border-t"><span>Total Bill</span><span>GH₵{visit.totalBill.toFixed(2)}</span></div>
        </div>

        <div><h5 className="font-semibold text-text-primary mb-2">Doctor's Notes</h5><p className="text-sm text-text-secondary bg-white p-3 rounded">{visit.notes}</p></div>
        <div>
            <button onClick={() => handleGenerateSummary(visit.notes)} disabled={isLoadingSummary} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 disabled:bg-gray-400">
              {isLoadingSummary ? 'Generating...' : '✨ Generate AI Summary'}
            </button>
             {summaryError && <p className="text-red-500 text-sm mt-2">{summaryError}</p>}
             {summary && (
                <div className="mt-4 p-3 bg-brand-light rounded-lg"><h5 className="font-semibold text-brand-secondary mb-2">AI Summary</h5><div className="text-sm text-text-secondary whitespace-pre-wrap">{summary}</div></div>
             )}
        </div>
      </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center"><img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-full" /><div className="ml-4"><h2 className="text-2xl font-bold text-text-primary">{patient.name}</h2><p className="text-sm text-text-secondary">Patient ID: P-00{patient.id}</p></div></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <div className="overflow-y-auto">
          <div className="border-b"><nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs"><button onClick={() => setActiveTab('details')} className={`py-3 px-1 font-medium text-sm border-b-2 ${activeTab === 'details' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-gray-700'}`}>Patient Details</button><button onClick={() => setActiveTab('visits')} className={`py-3 px-1 font-medium text-sm border-b-2 ${activeTab === 'visits' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-gray-700'}`}>Visit History ({patient.visits.length})</button></nav></div>
          {activeTab === 'details' && (<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8"><DetailItem label="Date of Birth" value={patient.dob} /><DetailItem label="Gender" value={patient.gender} /><DetailItem label="Contact" value={patient.contact} /><DetailItem label="Address" value={patient.address} /><div className="md:col-span-2 pt-4 border-t"><h3 className="font-semibold text-brand-secondary mb-2">Emergency Contact</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8"><DetailItem label="Name" value={patient.emergencyContact.name} /><DetailItem label="Number" value={patient.emergencyContact.number} /><DetailItem label="Relation" value={patient.emergencyContact.relation} /></div></div></div>)}
          {activeTab === 'visits' && (<div className="p-6 space-y-4">{patient.visits.length > 0 ? [...patient.visits].reverse().map(visit => (<div key={visit.date} className="border rounded-lg overflow-hidden"><button onClick={() => toggleVisit(visit.date)} className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"><span className="font-semibold text-text-primary">Visit on {new Date(visit.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span><ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedVisitDates.includes(visit.date) ? 'rotate-180' : ''}`} /></button>{expandedVisitDates.includes(visit.date) && renderVisitDetails(visit)}</div>)) : <p className="text-text-secondary text-center py-8">No visit history found.</p>}</div>)}
        </div>
        <div className="p-4 mt-auto border-t bg-gray-50 flex justify-end"><button onClick={onClose} className="btn-secondary">Close</button></div>
      </div>
    </div>
  );
};

const PatientList: React.FC<PatientListProps> = ({ patients, setPatients, currentUser, rolePermissions }) => {
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | 'view' | null, patient: Patient | null }>({ type: null, patient: null });
  const [searchTerm, setSearchTerm] = useState('');
  
  const canAdd = rolePermissions[currentUser.role]?.[AppView.ADD_PATIENT]?.hasAccess ?? false;
  const canUpdate = rolePermissions[currentUser.role]?.[AppView.PATIENT_RECORDS]?.canUpdate ?? false;
  const canDelete = rolePermissions[currentUser.role]?.[AppView.PATIENT_RECORDS]?.canDelete ?? false;

  const closeModal = () => setModalState({ type: null, patient: null });

  const onSavePatient = (patientData: Patient) => {
    if (patientData.id) { // Update
      setPatients(prev => prev.map(p => (p.id === patientData.id ? {...p, ...patientData} : p)));
    } else { // Add
      const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
      const avatarSeed = (patientData.name).toLowerCase().replace(/\s/g, '');
      const newPatient: Patient = {
        ...initialPatientState,
        ...patientData,
        id: newId,
        avatarUrl: patientData.avatarUrl || `https://picsum.photos/seed/${avatarSeed}/100/100`,
        visits: [],
      };
      setPatients(prev => [...prev, newPatient]);
    }
    closeModal();
  };

  const onDeletePatient = (id: number) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    closeModal();
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Patient Records</h1>
          <p className="text-text-secondary mt-1">Search, view, and manage patient information.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-grow md:flex-grow-0">
            <input type="text" placeholder="Search by name or contact..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"/>
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {canAdd && (
            <button onClick={() => setModalState({ type: 'add', patient: null })} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2">
              <PlusIcon className="w-5 h-5"/>
              <span>Add Patient</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <ul className="divide-y divide-gray-200">
          {filteredPatients.length > 0 ? filteredPatients.map(patient => (
            <li key={patient.id} onClick={() => setModalState({ type: 'view', patient })} className="p-4 hover:bg-brand-light cursor-pointer flex justify-between items-center transition-colors">
              <div className="flex items-center">
                <img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-full" />
                <div className="ml-4">
                  <p className="font-bold text-text-primary">{patient.name}</p>
                  <p className="text-sm text-text-secondary">{patient.contact}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {canUpdate && <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'edit', patient }); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-white transition"><EditIcon className="w-5 h-5" /></button>}
                {canDelete && <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'delete', patient }); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-white transition"><DeleteIcon className="w-5 h-5" /></button>}
              </div>
            </li>
          )) : (
            <li className="p-8 text-center text-text-secondary">No patients found.</li>
          )}
        </ul>
      </div>

      <PatientFormModal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={closeModal} onSave={onSavePatient} patientToEdit={modalState.type === 'edit' ? modalState.patient : null} />
      <PatientDetailModal patient={modalState.type === 'view' ? modalState.patient : null} onClose={closeModal} />
      <DeleteConfirmationModal patient={modalState.type === 'delete' ? modalState.patient : null} onClose={closeModal} onConfirm={onDeletePatient} />
    </div>
  );
};

export default PatientList;
