
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Appointment, Patient, Consultation, Vitals, Visit, Prescription, Drug, Procedure, ExtractedMedicalInfo, DrugFrequencyRule, User, RolePermissions, AppView, Invoice, InvoiceStatus, InvoiceItem } from '../types';
import { CloseIcon, DeleteIcon, PlusIcon, ClockIcon, CheckCircleIcon } from './icons';
import { analyzeMedicalNotes } from '../services/geminiService';

const getStatusColor = (status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Draft') => {
    switch(status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
    }
};

const getStatusBorderColor = (status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Draft') => {
    switch(status) {
        case 'Scheduled': return 'border-l-4 border-blue-500';
        case 'Completed': return 'border-l-4 border-green-500';
        case 'Draft': return 'border-l-4 border-yellow-500';
        default: return 'border-l-4 border-transparent';
    }
};


const emptyVitals: Vitals = { bloodPressure: '', heartRate: '', temperature: '', respiratoryRate: '' };
const emptyConsultation: Consultation = { 
    vitals: emptyVitals, 
    diagnosis: [], 
    notes: '',
    history: '',
    principalComplaints: '',
    treatmentPlan: '',
    prescriptions: [],
    totalBill: 0,
};

interface ConsultationModalProps {
    appointment: Appointment | null;
    mode: 'view' | 'edit';
    isOpen: boolean;
    onClose: () => void;
    onSaveDraft: (appointmentId: number, consultation: Consultation) => void;
    onSaveFinalize: (appointmentId: number, consultation: Consultation) => void;
    drugs: Drug[];
    procedures: Procedure[];
    frequencyRules: DrugFrequencyRule[];
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ appointment, mode, isOpen, onClose, onSaveDraft, onSaveFinalize, drugs, procedures, frequencyRules }) => {
    const [formData, setFormData] = useState<Consultation>(emptyConsultation);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('notes');
    const [saveMessage, setSaveMessage] = useState('');
    
    useEffect(() => {
        if (appointment) {
            setFormData(appointment.consultation || emptyConsultation);
        }
        if (!isOpen) {
            setFormData(emptyConsultation);
            setError('');
            setIsAnalyzing(false);
            setActiveTab('notes');
            setSaveMessage('');
        }
    }, [appointment, isOpen]);

    useEffect(() => {
      const total = formData.diagnosis.reduce((sum, proc) => sum + proc.cost, 0);
      setFormData(p => ({ ...p, totalBill: total }));
    }, [formData.diagnosis]);

    const handleAIUpdate = (aiResult: ExtractedMedicalInfo) => {
        setFormData(prev => {
            const newDiagnoses = aiResult.diagnosis
                .map(d => procedures.find(p => p.name.toLowerCase() === d.name.toLowerCase()))
                .filter((p): p is Procedure => p !== undefined);

            const newPrescriptions: Prescription[] = aiResult.prescriptions.map((p, index) => {
                const today = new Date().toISOString().split('T')[0];
                return {
                    id: Date.now() + index,
                    drugName: p.drugName,
                    formulation: p.formulation,
                    strength: p.strength,
                    dose: p.dose,
                    frequency: p.frequency,
                    roa: p.roa,
                    startDate: today,
                    endDate: '',
                    days: 0,
                    quantity: 0,
                };
            });

            return {
                ...prev,
                vitals: aiResult.vitals,
                history: aiResult.history,
                principalComplaints: aiResult.principalComplaints,
                treatmentPlan: aiResult.treatmentPlan,
                diagnosis: Array.from(new Set([...prev.diagnosis, ...newDiagnoses])),
                prescriptions: Array.from(new Set([...prev.prescriptions, ...newPrescriptions])),
            }
        });
    };
    
    const handleAnalyzeNotes = async () => {
        if (!formData.notes) {
            setError('Please enter some notes to analyze.');
            return;
        }
        setIsAnalyzing(true);
        setError('');
        try {
            const result = await analyzeMedicalNotes(formData.notes);
            handleAIUpdate(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze notes.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFinalize = () => {
        if (formData.diagnosis.length === 0) {
            setError('At least one diagnosis is required to finalize.');
            setActiveTab('diagnosis');
            return;
        }
        if (appointment) {
            onSaveFinalize(appointment.id, formData);
        }
    };
    
    const handleDraft = () => {
        if(appointment) {
            onSaveDraft(appointment.id, formData);
            setSaveMessage('Draft saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000); // Hide message after 3 seconds
        }
    }

    const parseNumeric = (str: string): number => parseInt(str.match(/\d+/)?.[0] || '0', 10);
    
    const getFrequencyMultiplier = (code: string): number => {
      if (!code) return 0;
      const rule = frequencyRules.find(r => r.code.toLowerCase() === code.toLowerCase());
      return rule ? rule.multiplier : 0;
    };

    // Prescription handlers
    const addPrescription = () => {
      const newPrescription: Prescription = { id: Date.now(), drugName: '', formulation: '', strength: '', dose: '', frequency: '', roa: '', startDate: new Date().toISOString().split('T')[0], endDate: '', days: 0, quantity: 0 };
      setFormData(p => ({ ...p, prescriptions: [...p.prescriptions, newPrescription] }));
    };

    const updatePrescription = (id: number, field: keyof Prescription, value: any) => {
        setFormData(p => ({
            ...p,
            prescriptions: p.prescriptions.map(pr => {
                if (pr.id !== id) return pr;
                const updatedPr = { ...pr, [field]: value };
                if (field === 'drugName') {
                    const drugDetails = drugs.find(d => d.name.toLowerCase() === (value as string).toLowerCase());
                    if (drugDetails) {
                        updatedPr.formulation = drugDetails.formulation;
                        updatedPr.strength = drugDetails.strength;
                    }
                }
                if (['dose', 'frequency', 'days'].includes(field as string)) {
                    const dose = parseNumeric(updatedPr.dose);
                    const freqMultiplier = getFrequencyMultiplier(updatedPr.frequency);
                    const days = updatedPr.days;
                    if (dose > 0 && freqMultiplier > 0 && days > 0) {
                        updatedPr.quantity = dose * freqMultiplier * days;
                    } else {
                        updatedPr.quantity = 0;
                    }
                }
                return updatedPr;
            })
        }));
    };

    const removePrescription = (id: number) => {
      setFormData(p => ({ ...p, prescriptions: p.prescriptions.filter(pr => pr.id !== id) }));
    };

    // Diagnosis handlers
    const addDiagnosis = (procedureId: string) => {
      const procedure = procedures.find(p => p.id === parseInt(procedureId));
      if (procedure && !formData.diagnosis.find(d => d.id === procedure.id)) {
        setFormData(p => ({ ...p, diagnosis: [...p.diagnosis, procedure] }));
      }
    };
    const removeDiagnosis = (id: number) => {
      setFormData(p => ({ ...p, diagnosis: p.diagnosis.filter(d => d.id !== id) }));
    };
    
    if (!isOpen || !appointment) return null;
    
    const TabButton = ({ id, label }: { id: string, label: string }) => (
        <button onClick={() => setActiveTab(id)} className={`py-2 px-4 font-medium text-sm rounded-t-lg ${activeTab === id ? 'bg-white border-b-0 border-t border-x' : 'bg-gray-100 hover:bg-gray-200'}`}>{label}</button>
    );

    const isFinalizeDisabled = mode === 'edit' && formData.diagnosis.length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-text-primary">{mode === 'edit' ? 'Start Consultation' : 'View Consultation'} for {appointment.patientName}</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6 text-text-secondary" /></button></div>
                <div className="border-b px-4 bg-gray-50"><nav className="-mb-px flex space-x-2" aria-label="Tabs"><TabButton id="notes" label="Notes & Vitals" /><TabButton id="history" label="History & Plan" /><TabButton id="prescriptions" label="Prescriptions" /><TabButton id="diagnosis" label="Diagnosis & Bill" /></nav></div>
                <div className="p-6 overflow-y-auto space-y-6 bg-white flex-1">{activeTab === 'notes' && (<div><h3 className="text-lg font-semibold text-brand-secondary mb-2">Clinical Notes</h3><textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Enter unstructured clinical notes here..." className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" readOnly={mode==='view'}/><h3 className="text-lg font-semibold text-brand-secondary mt-4 mb-2">Vitals</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label className="label-form">Blood Pressure</label><input type="text" value={formData.vitals.bloodPressure} onChange={e => setFormData(p => ({...p, vitals: {...p.vitals, bloodPressure: e.target.value}}))} className="input-field" readOnly={mode==='view'} /></div><div><label className="label-form">Heart Rate</label><input type="text" value={formData.vitals.heartRate} onChange={e => setFormData(p => ({...p, vitals: {...p.vitals, heartRate: e.target.value}}))} className="input-field" readOnly={mode==='view'} /></div><div><label className="label-form">Temperature</label><input type="text" value={formData.vitals.temperature} onChange={e => setFormData(p => ({...p, vitals: {...p.vitals, temperature: e.target.value}}))} className="input-field" readOnly={mode==='view'} /></div><div><label className="label-form">Respiratory Rate</label><input type="text" value={formData.vitals.respiratoryRate} onChange={e => setFormData(p => ({...p, vitals: {...p.vitals, respiratoryRate: e.target.value}}))} className="input-field" readOnly={mode==='view'} /></div></div></div>)}{activeTab === 'history' && (<div className="space-y-4"><div><label className="label-form">History</label><textarea value={formData.history} onChange={e => setFormData(p => ({ ...p, history: e.target.value }))} className="w-full h-24 p-3 border border-gray-300 rounded-lg" readOnly={mode==='view'}/></div><div><label className="label-form">Principal Complaints</label><textarea value={formData.principalComplaints} onChange={e => setFormData(p => ({ ...p, principalComplaints: e.target.value }))} className="w-full h-24 p-3 border border-gray-300 rounded-lg" readOnly={mode==='view'}/></div><div><label className="label-form">Treatment Plan</label><textarea value={formData.treatmentPlan} onChange={e => setFormData(p => ({ ...p, treatmentPlan: e.target.value }))} className="w-full h-24 p-3 border border-gray-300 rounded-lg" readOnly={mode==='view'}/></div></div>)}{activeTab === 'prescriptions' && (<div><div className="flex justify-between items-center mb-2"><h3 className="text-lg font-semibold text-brand-secondary">Prescriptions</h3>{mode === 'edit' && <button onClick={addPrescription} className="btn-primary text-sm">Add Prescription</button>}</div><div className="space-y-4 max-h-80 overflow-y-auto pr-2">{formData.prescriptions.length > 0 ? formData.prescriptions.map((pr) => (<div key={pr.id} className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-6 gap-3 relative"><div className="col-span-2 md:col-span-3"><label className="label-form">Drug Name</label><input list="drug-list" value={pr.drugName} onChange={e => updatePrescription(pr.id, 'drugName', e.target.value)} className="input-field" readOnly={mode==='view'}/></div><div><label className="label-form">Formulation</label><input type="text" value={pr.formulation} onChange={e => updatePrescription(pr.id, 'formulation', e.target.value)} className="input-field" readOnly={mode==='view' || !!pr.drugName} /></div><div className="col-span-2"><label className="label-form">Strength</label><input type="text" value={pr.strength} onChange={e => updatePrescription(pr.id, 'strength', e.target.value)} className="input-field" readOnly={mode==='view' || !!pr.drugName}/></div><div><label className="label-form">Dose</label><input type="text" value={pr.dose} onChange={e => updatePrescription(pr.id, 'dose', e.target.value)} className="input-field" readOnly={mode==='view'} placeholder="e.g., 1 tablet" /></div><div><label className="label-form">Frequency</label><input list="frequency-list" type="text" value={pr.frequency} onChange={e => updatePrescription(pr.id, 'frequency', e.target.value)} className="input-field" readOnly={mode==='view'} placeholder="e.g., BID"/></div><div><label className="label-form">ROA</label><input type="text" value={pr.roa} onChange={e => updatePrescription(pr.id, 'roa', e.target.value)} className="input-field" readOnly={mode==='view'} placeholder="e.g., Oral"/></div><div><label className="label-form">Days</label><input type="number" value={pr.days} onChange={e => updatePrescription(pr.id, 'days', parseInt(e.target.value))} className="input-field" readOnly={mode==='view'}/></div><div className="col-span-2"><label className="label-form">Quantity</label><input type="number" value={pr.quantity} onChange={e => updatePrescription(pr.id, 'quantity', parseInt(e.target.value))} className="input-field" readOnly={mode==='view' || pr.quantity > 0} /></div>{mode === 'edit' && <button onClick={() => removePrescription(pr.id)} className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700"><DeleteIcon className="w-5 h-5"/></button>}</div>)) : <p className="text-text-secondary text-center py-4">No prescriptions added.</p>}</div><datalist id="drug-list">{drugs.map(d => <option key={d.id} value={d.name} />)}</datalist><datalist id="frequency-list">{frequencyRules.map(fr => <option key={fr.id} value={fr.code}>{fr.description}</option>)}</datalist></div>)}{activeTab === 'diagnosis' && (<div><h3 className="text-lg font-semibold text-brand-secondary mb-2">Diagnosis & Billing</h3>{mode === 'edit' && <div className="flex gap-2 mb-4"><select className="input-field flex-grow" onChange={e => addDiagnosis(e.target.value)} value=""><option value="" disabled>Select a procedure...</option>{procedures.filter(p => !formData.diagnosis.some(d => d.id === p.id)).map(p => <option key={p.id} value={p.id}>{p.name} (GH₵{p.cost.toFixed(2)})</option>)}</select></div>}<div className="space-y-2">{formData.diagnosis.length > 0 ? formData.diagnosis.map(d => (<div key={d.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span>{d.name}</span><div className="flex items-center gap-4"><span>GH₵{d.cost.toFixed(2)}</span>{mode === 'edit' && <button onClick={() => removeDiagnosis(d.id)} className="p-1 text-red-500 hover:text-red-700"><DeleteIcon className="w-5 h-5"/></button>}</div></div>)) : <p className="text-text-secondary text-center py-4">No diagnosis added.</p>}</div><div className="mt-4 pt-4 border-t flex justify-end"><p className="text-xl font-bold">Total Bill: <span className="text-brand-primary">GH₵{formData.totalBill.toFixed(2)}</span></p></div></div>)}{error && <p className="text-red-500 text-sm mt-2">{error}</p>}</div>
                <div className="p-4 mt-auto border-t bg-gray-50 flex justify-between items-center"><div>{saveMessage && <span className="text-green-600 font-semibold text-sm">{saveMessage}</span>}</div><div className="flex space-x-2"><button onClick={onClose} className="btn-secondary">Close</button>{mode === 'edit' && (<><button onClick={handleDraft} className="btn-secondary">Save Draft</button><button onClick={handleFinalize} disabled={isFinalizeDisabled} className="btn-primary" title={isFinalizeDisabled ? 'A diagnosis is required to finalize.' : ''}>Save & Finalize</button></>)}</div></div>
            </div><style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; } .input-field:focus { outline: none; ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .input-field:read-only { background-color: #f3f4f6; cursor: not-allowed; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; } .btn-secondary:hover { background-color: #d1d5db; } .label-form { display: block; text-sm font-medium text-text-secondary mb-1; } `}</style>
        </div>
    );
};

interface NewAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newAppointmentData: { patientId: number; patientName: string; date: string; time: string; reason: string; }) => void;
    patients: Patient[];
    initialDate: string;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSave, patients, initialDate }) => {
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState('09:00');
    const [reason, setReason] = useState('');
    const [showPatientList, setShowPatientList] = useState(false);
    const [error, setError] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowPatientList(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [searchRef]);

    useEffect(() => {
        if (isOpen) {
            setDate(initialDate);
        } else {
            setPatientSearch('');
            setSelectedPatient(null);
            setTime('09:00');
            setReason('');
            setShowPatientList(false);
            setError('');
        }
    }, [isOpen, initialDate]);

    const filteredPatients = useMemo(() => {
        if (!patientSearch || selectedPatient) return [];
        const searchTerm = patientSearch.toLowerCase();
        return patients.filter(p => p.name.toLowerCase().includes(searchTerm) || p.contact.toLowerCase().includes(searchTerm));
    }, [patientSearch, patients, selectedPatient]);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setPatientSearch(`${patient.name} (${patient.contact})`);
        setShowPatientList(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) {
            setError('Please select a patient from the list.');
            return;
        }
        if (!date || !time) {
            setError('Please provide a valid date and time.');
            return;
        }
        setError('');
        onSave({ patientId: selectedPatient.id, patientName: selectedPatient.name, date, time, reason });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-text-primary">New Appointment</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6 text-text-secondary" /></button></div>
                <form onSubmit={handleSubmit}><div className="p-6 space-y-4"><div className="relative" ref={searchRef}><label className="label-form">Patient</label><input type="text" className="input-field" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); if (e.target.value) setShowPatientList(true); }} onFocus={() => { if(patientSearch && !selectedPatient) setShowPatientList(true) }} placeholder="Search by Name or Telephone Number"/>{showPatientList && filteredPatients.length > 0 && (<ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">{filteredPatients.map(p => (<li key={p.id} onClick={() => handlePatientSelect(p)} className="p-2 hover:bg-brand-light cursor-pointer">{p.name} <span className="text-sm text-text-secondary">({p.contact})</span></li>))}</ul>)}</div><div className="grid grid-cols-2 gap-4"><div><label className="label-form">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" required/></div><div><label className="label-form">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" required/></div></div><div><label className="label-form">Reason for Visit</label><textarea value={reason} onChange={e => setReason(e.target.value)} className="input-field" rows={3} placeholder="e.g., Follow-up, Annual Physical, New Complaint"></textarea></div>{error && <p className="text-red-500 text-sm">{error}</p>}</div><div className="p-4 border-t bg-gray-50 flex justify-end space-x-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Appointment</button></div></form>
            </div><style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; } .input-field:focus { outline: none; ring-width: 2px; ring-color: #007A7A; border-color: #007A7A; } .btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; } .btn-primary:hover { background-color: #005A5A; } .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; } .btn-secondary:hover { background-color: #d1d5db; } .label-form { display: block; text-sm font-medium text-text-secondary mb-1; } `}</style>
        </div>
    );
};

interface AppointmentCalendarProps { appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>; drugs: Drug[]; procedures: Procedure[]; frequencyRules: DrugFrequencyRule[]; currentUser: User; rolePermissions: RolePermissions; invoices: Invoice[]; setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;}

const AppointmentAction: React.FC<{ appointment: Appointment, onOpenModal: (app: Appointment, mode: 'view' | 'edit') => void }> = ({ appointment, onOpenModal }) => {
    switch (appointment.status) {
        case 'Scheduled': return (<button onClick={() => onOpenModal(appointment, 'edit')} className="w-full text-center text-sm font-bold py-2 px-3 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors">Start Consultation</button>);
        case 'Draft': return (<button onClick={() => onOpenModal(appointment, 'edit')} className="w-full text-center text-sm font-bold py-2 px-3 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors">Continue Draft</button>);
        case 'Completed': return (<button onClick={() => onOpenModal(appointment, 'view')} className="w-full text-center text-sm font-bold py-2 px-3 rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors">View Finalized</button>);
        default: return null;
    }
};

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, setAppointments, patients, setPatients, drugs, procedures, frequencyRules, currentUser, rolePermissions, invoices, setInvoices }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; appointment: Appointment | null; mode: 'view' | 'edit' }>({ isOpen: false, appointment: null, mode: 'view' });
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const canAddAppointment = rolePermissions[currentUser.role]?.[AppView.ADD_APPOINTMENT]?.hasAccess ?? false;

    const handleSaveDraft = (appointmentId: number, consultation: Consultation) => {
        setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: 'Draft', consultation } : app));
    };

    const handleFinalizeConsultation = (appointmentId: number, consultation: Consultation) => {
        let updatedAppointment: Appointment | undefined;
        setAppointments(prev => prev.map(app => { if (app.id === appointmentId) { updatedAppointment = { ...app, status: 'Completed', consultation }; return updatedAppointment; } return app; }));
        if (updatedAppointment) {
            const newVisit: Visit = { date: updatedAppointment.date, ...consultation };
            setPatients(prev => prev.map(patient => { if (patient.id === (updatedAppointment as Appointment).patientId) { const existingVisitIndex = patient.visits.findIndex(v => v.date === newVisit.date); if (existingVisitIndex > -1) { const updatedVisits = [...patient.visits]; updatedVisits[existingVisitIndex] = newVisit; return { ...patient, visits: updatedVisits }; } return { ...patient, visits: [...patient.visits, newVisit] }; } return patient; }));
            const issueDate = new Date();
            const dueDate = new Date(issueDate);
            dueDate.setDate(issueDate.getDate() + 1); // Due in 1 day
            const newInvoice: Invoice = { id: `INV-${Date.now()}`, patientId: updatedAppointment.patientId, patientName: updatedAppointment.patientName, appointmentId: updatedAppointment.id, issueDate: issueDate.toISOString().split('T')[0], dueDate: dueDate.toISOString().split('T')[0], items: consultation.diagnosis.map((proc, index) => ({ id: `item-${Date.now()}-${index}`, description: proc.name, quantity: 1, unitPrice: proc.cost, total: proc.cost, })), totalAmount: consultation.totalBill, status: InvoiceStatus.UNPAID, paidByUserId: null, paymentDate: null, notificationSent: false, };
            setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
        }
        handleCloseModal();
    };

    const handleAddNewAppointment = (newAppointmentData: { patientId: number; patientName: string; date: string; time: string; reason: string; }) => {
        const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
        const finalAppointment: Appointment = { ...newAppointmentData, id: newId, status: 'Scheduled' };
        setAppointments(prev => [...prev, finalAppointment].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
        setIsNewAppointmentModalOpen(false);
    };

    const handleOpenModal = (appointment: Appointment, mode: 'view' | 'edit') => setModalState({ isOpen: true, appointment, mode });
    const handleCloseModal = () => setModalState({ isOpen: false, appointment: null, mode: 'view' });
    
    const appointmentsForSelectedDay = useMemo(() => {
        return appointments
            .filter(app => app.date === selectedDate && app.status !== 'Cancelled')
            .map(app => {
                const patient = patients.find(p => p.id === app.patientId);
                return {
                    ...app,
                    patientAvatarUrl: patient?.avatarUrl || `https://i.pravatar.cc/150?u=${app.patientId}`
                };
            })
            .sort((a,b) => a.time.localeCompare(b.time));
    }, [selectedDate, appointments, patients]);

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold text-text-primary">Appointments</h1><p className="text-text-secondary mt-1">View and manage appointments for a specific day.</p></div>{canAddAppointment && (<button onClick={() => setIsNewAppointmentModalOpen(true)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 flex items-center space-x-2"><PlusIcon className="w-5 h-5"/><span>New Appointment</span></button>)}</div>
            <div className="mb-6"><label htmlFor="appointment-date" className="block text-sm font-medium text-text-secondary mb-1">Select Date</label><input type="date" id="appointment-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg w-full sm:w-auto"/></div>
            
            <div className="flex-grow overflow-y-auto">
                <h2 className="text-xl font-bold text-text-primary mb-4">Appointments for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                {appointmentsForSelectedDay.length > 0 ? (
                    <div className="relative">
                        {/* The timeline line */}
                        <div className="absolute left-10 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                        {appointmentsForSelectedDay.map((app) => (
                            <div key={app.id} className="flex items-start gap-4 mb-6">
                                <div className="w-16 text-right font-mono text-sm text-text-secondary pt-1">{app.time}</div>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary border-4 border-bg-light flex items-center justify-center ring-4 ring-brand-light">
                                        <ClockIcon className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <div className={`bg-white p-4 rounded-xl shadow-md transition hover:shadow-lg ${getStatusBorderColor(app.status)}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <img src={app.patientAvatarUrl} alt={app.patientName} className="w-12 h-12 rounded-full" />
                                                <div>
                                                    <p className="font-bold text-text-primary">{app.patientName}</p>
                                                    <p className="text-sm text-text-secondary">{app.reason}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                        </div>
                                        <div className="mt-4">
                                            <AppointmentAction appointment={app} onOpenModal={handleOpenModal} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary py-16 bg-white rounded-xl shadow-md">
                        <ClockIcon className="w-16 h-16 text-gray-300 mb-4"/>
                        <h3 className="text-lg font-semibold">No Appointments</h3>
                        <p>There are no appointments scheduled for this day.</p>
                    </div>
                )}
            </div>

            <ConsultationModal isOpen={modalState.isOpen} onClose={handleCloseModal} appointment={modalState.appointment} mode={modalState.mode} onSaveDraft={handleSaveDraft} onSaveFinalize={handleFinalizeConsultation} drugs={drugs} procedures={procedures} frequencyRules={frequencyRules} />
            <NewAppointmentModal isOpen={isNewAppointmentModalOpen} onClose={() => setIsNewAppointmentModalOpen(false)} onSave={handleAddNewAppointment} patients={patients} initialDate={selectedDate} />
        </div>
    );
};
