


import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, InvoiceStatus, Patient, AppView, User, UserRole } from '../types';
import { CloseIcon, SearchIcon, ViewIcon, CheckCircleIcon, ClockIcon, BillingIcon, PrinterIcon, UserGroupIcon, FolderOpenIcon } from './icons';

// --- Reusable Invoice Detail Modal ---
interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  patient: Patient | null;
  onClose: () => void;
  onMarkAsPaid: (invoiceId: string, userId: number) => void;
  currentUserId: number;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, patient, onClose, onMarkAsPaid, currentUserId }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (!invoice) {
      setShowSuccessMessage(false);
    }
  }, [invoice]);

  const handlePrint = (type: 'receipt' | 'invoice') => {
    if (!invoice || !patient) return;
    const clinicName = "Auntie Dental Clinic";
    const paymentDate = invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleString() : new Date().toLocaleString();
    const receiptContent = `<div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 280px; margin: 0 auto;"><h2 style="text-align: center; margin: 0;">${clinicName}</h2><h3 style="text-align: center; margin-top: 5px; font-weight: normal;">Payment Receipt</h3><hr style="border: 0; border-top: 1px dashed #000;"><p><strong>Receipt No:</strong> ${invoice.id}</p><p><strong>Date:</strong> ${paymentDate}</p><p><strong>Patient:</strong> ${patient.name}</p><hr style="border: 0; border-top: 1px dashed #000;"><p style="font-size: 12pt; text-align: right; margin: 5px 0;"><strong>Amount Paid:</strong></p><p style="font-size: 14pt; text-align: right; margin: 5px 0;"><strong>GH₵${invoice.totalAmount.toFixed(2)}</strong></p><hr style="border: 0; border-top: 1px dashed #000;"><p style="text-align: center; margin-top: 10px;">Thank you!</p></div>`;
    const invoiceContent = `<div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 280px; margin: 0 auto;"><h2 style="text-align: center; margin: 0;">${clinicName}</h2><h3 style="text-align: center; margin-top: 5px; font-weight: normal;">Invoice</h3><hr style="border: 0; border-top: 1px dashed #000;"><p><strong>To:</strong> ${patient.name}</p><p><strong>Invoice ID:</strong> ${invoice.id}</p><p><strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p><hr style="border: 0; border-top: 1px dashed #000;"><table style="width: 100%; border-collapse: collapse; font-size: 9pt;"><thead><tr><th style="text-align: left; padding: 2px 0;">Item</th><th style="text-align: right; padding: 2px 0;">Total</th></tr></thead><tbody>${invoice.items.map(item => `<tr><td style="padding: 2px 0;">${item.description} (x${item.quantity})</td><td style="text-align: right; padding: 2px 0;">${item.total.toFixed(2)}</td></tr>`).join('')}</tbody></table><hr style="border: 0; border-top: 1px dashed #000;"><p style="font-size: 12pt; text-align: right; margin: 5px 0;"><strong>Total: GH₵${invoice.totalAmount.toFixed(2)}</strong></p><p style="text-align: center; font-weight: bold; margin-top: 10px;">STATUS: PAID</p><p style="text-align: center; font-size: 8pt;">Paid on ${paymentDate}</p></div>`;
    const printHtml = type === 'receipt' ? receiptContent : invoiceContent;
    const printWindow = window.open('', '_blank', 'width=320,height=500');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleMarkPaidClick = () => {
    if (!invoice) return;
    onMarkAsPaid(invoice.id, currentUserId);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  if (!invoice || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><h2 className="text-xl font-bold text-text-primary">Invoice Details: {invoice.id}</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon className="w-6 h-6 text-text-secondary" /></button></div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div><h3 className="font-semibold text-brand-secondary mb-2">Billed To</h3><p className="text-lg font-bold text-text-primary">{patient.name}</p><p className="text-text-secondary">Patient ID: P-00{patient.id}</p><p className="text-text-secondary">{patient.contact}</p></div>
            <div className="text-left md:text-right"><h3 className="font-semibold text-brand-secondary mb-2">Invoice Information</h3><p className="text-text-secondary"><strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}</p><p className="text-text-secondary"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p><div className="mt-2">{invoice.status === InvoiceStatus.PAID ? <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 inline-flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Paid</span> : <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 inline-flex items-center gap-2"><ClockIcon className="w-5 h-5" /> Unpaid</span>}</div></div>
          </div>
          <div className="overflow-x-auto border rounded-lg"><table className="w-full text-left"><thead className="bg-gray-50"><tr className="border-b"><th className="p-3 text-sm font-semibold text-text-secondary">Description</th><th className="p-3 text-sm font-semibold text-text-secondary text-center">Quantity</th><th className="p-3 text-sm font-semibold text-text-secondary text-right">Unit Price</th><th className="p-3 text-sm font-semibold text-text-secondary text-right">Total</th></tr></thead><tbody>{invoice.items.map(item => (<tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50"><td className="p-3 font-medium text-text-primary">{item.description}</td><td className="p-3 text-text-secondary text-center">{item.quantity}</td><td className="p-3 text-text-secondary text-right">GH₵{item.unitPrice.toFixed(2)}</td><td className="p-3 text-text-primary font-medium text-right">GH₵{item.total.toFixed(2)}</td></tr>))}</tbody></table></div>
          <div className="flex justify-end mt-6"><div className="w-full md:w-1/2"><div className="flex justify-between items-center p-4 bg-brand-light rounded-lg"><p className="text-lg font-bold text-brand-secondary">Total Amount</p><p className="text-2xl font-bold text-brand-primary">GH₵{invoice.totalAmount.toFixed(2)}</p></div></div></div>
          {showSuccessMessage && invoice.status === InvoiceStatus.PAID && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-semibold transition-opacity duration-300">Invoice marked as paid successfully!</div>}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
          <div>{invoice.status === InvoiceStatus.PAID && <div className="flex items-center gap-2"><button onClick={() => handlePrint('receipt')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"><PrinterIcon className="w-5 h-5"/> Print Receipt</button><button onClick={() => handlePrint('invoice')} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"><PrinterIcon className="w-5 h-5"/> Print Invoice</button></div>}</div>
          <div className="flex items-center space-x-2"><button type="button" onClick={onClose} className="bg-gray-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200">Close</button>{invoice.status === InvoiceStatus.UNPAID && <button onClick={handleMarkPaidClick} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Mark as Paid</button>}</div>
        </div>
      </div>
    </div>
  );
};

// --- Common Components for Account Views ---
const StatusPill: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const Icon = status === InvoiceStatus.PAID ? CheckCircleIcon : ClockIcon;
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  );
};

// --- Patient Bills View ---
const PatientBillsView: React.FC<AccountsManagementProps> = ({ invoices, setInvoices, patients, currentUser }) => {
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchParam, setSearchParam] = useState<'name' | 'contact'>('name');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredInvoices = useMemo(() => {
    let results = invoices;
    
    // Primary filter: by date range
    if (startDate || endDate) {
        results = results.filter(inv => {
            const issueDate = inv.issueDate;
            if (startDate && issueDate < startDate) return false;
            if (endDate && issueDate > endDate) return false;
            return true;
        });
    }

    // Secondary filter: by patient search term
    if (patientSearchTerm.trim()) {
      const term = patientSearchTerm.toLowerCase();
      results = results.filter(inv => {
        const patient = patients.find(p => p.id === inv.patientId);
        if (!patient) return false;
        
        if (searchParam === 'name') {
          return patient.name.toLowerCase().includes(term);
        } else { // contact
          return patient.contact.toLowerCase().includes(term);
        }
      });
    }

    return results.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [invoices, patients, startDate, endDate, patientSearchTerm, searchParam]);
  

  const handleMarkAsPaid = (invoiceId: string, userId: number) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: InvoiceStatus.PAID, paidByUserId: userId, paymentDate: new Date().toISOString() } : inv));
    setSelectedInvoice(prev => prev ? { ...prev, status: InvoiceStatus.PAID, paidByUserId: userId, paymentDate: new Date().toISOString() } : null);
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Patient Bills</h1>
      <p className="text-text-secondary mb-8">Filter bills by date and optionally by patient details.</p>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">Date From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">Date To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">Filter by Patient</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input type="text" placeholder={`By ${searchParam === 'name' ? 'Name' : 'Telephone'}`} value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <select value={searchParam} onChange={(e) => setSearchParam(e.target.value as any)} className="bg-gray-50 border border-gray-300 rounded-lg p-2">
                <option value="name">Name</option>
                <option value="contact">Telephone</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{inv.id}</td>
                    <td className="p-3 font-medium">{inv.patientName}</td>
                    <td className="p-3">{new Date(inv.issueDate).toLocaleDateString()}</td>
                    <td className="p-3 font-medium">GH₵{inv.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-center"><StatusPill status={inv.status} /></td>
                    <td className="p-3 text-center"><button onClick={() => setSelectedInvoice(inv)} className="btn-primary text-sm">Details</button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-text-secondary">
                    <BillingIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold">No Bills Found</h3>
                    <p>Adjust the date range or search criteria to find bills.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <InvoiceDetailModal invoice={selectedInvoice} patient={patients.find(p => p.id === selectedInvoice?.patientId) || null} onClose={() => setSelectedInvoice(null)} onMarkAsPaid={handleMarkAsPaid} currentUserId={currentUser.id} />
    </div>
  );
};

// --- Financial Records View ---
const FinancialRecordsView: React.FC<AccountsManagementProps> = ({ invoices, users }) => {
  const paidInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status === InvoiceStatus.PAID).sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime());
  }, [invoices]);

  const getUserName = (userId: number | null) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  return (
    <div className="p-8"><h1 className="text-3xl font-bold text-text-primary mb-2">Financial Records</h1><p className="text-text-secondary mb-8">A log of all paid invoices and financial transactions.</p>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b bg-gray-50"><th className="p-3">Invoice ID</th><th className="p-3">Patient</th><th className="p-3">Payment Date</th><th className="p-3">Amount</th><th className="p-3">Received By</th></tr></thead>
            <tbody>
              {paidInvoices.length > 0 ? paidInvoices.map(inv => (<tr key={inv.id} className="border-b hover:bg-gray-50"><td className="p-3 font-mono text-sm">{inv.id}</td><td className="p-3 font-medium">{inv.patientName}</td><td className="p-3">{inv.paymentDate ? new Date(inv.paymentDate).toLocaleString() : 'N/A'}</td><td className="p-3 font-medium">GH₵{inv.totalAmount.toFixed(2)}</td><td className="p-3">{getUserName(inv.paidByUserId)}</td></tr>)) : (<tr><td colSpan={5} className="text-center py-10 text-text-secondary"><FolderOpenIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold">No Financial Records Found</h3><p>No invoices have been marked as paid yet.</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Unpaid Bills View ---
const UnpaidBillsView: React.FC<AccountsManagementProps> = ({ invoices, setInvoices, patients, currentUser, users }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchParam, setSearchParam] = useState<'name' | 'contact'>('name');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Effect for automatic notifications on mount
  useEffect(() => {
    const today = new Date();
    const overdueInvoices = invoices.filter(
      inv => inv.status === InvoiceStatus.UNPAID && !inv.notificationSent && new Date(inv.dueDate) < today
    );

    if (overdueInvoices.length > 0) {
      const patientNames = [...new Set(overdueInvoices.map(inv => inv.patientName))].join(', ');
      const adminPhoneNumbers = users.filter(u => u.role === UserRole.ADMIN).map(u => u.mobileNumber).join(', ');
      
      alert(`Automatic overdue payment reminders sent to:\n- Patients: ${patientNames}\n- Admins: ${adminPhoneNumbers}`);

      const updatedInvoiceIds = new Set(overdueInvoices.map(inv => inv.id));

      setInvoices(currentInvoices =>
        currentInvoices.map(inv =>
          updatedInvoiceIds.has(inv.id) ? { ...inv, notificationSent: true } : inv
        )
      );
    }
  }, []); // Run only on component mount

  const handleMarkAsPaid = (invoiceId: string, userId: number) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: InvoiceStatus.PAID, paidByUserId: userId, paymentDate: new Date().toISOString() } : inv));
    setSelectedInvoice(prev => prev ? { ...prev, status: InvoiceStatus.PAID, paidByUserId: userId, paymentDate: new Date().toISOString() } : null);
  };

  const filteredUnpaidInvoices = useMemo(() => {
    let results = invoices.filter(inv => inv.status === InvoiceStatus.UNPAID);

    if (startDate || endDate) {
        results = results.filter(inv => {
            const issueDate = inv.issueDate;
            if (startDate && issueDate < startDate) return false;
            if (endDate && issueDate > endDate) return false;
            return true;
        });
    }

    if (patientSearchTerm.trim()) {
      const term = patientSearchTerm.toLowerCase();
      results = results.filter(inv => {
        const patient = patients.find(p => p.id === inv.patientId);
        if (!patient) return false;
        if (searchParam === 'name') {
            return patient.name.toLowerCase().includes(term);
        } else {
            return patient.contact.includes(term);
        }
      });
    }

    return results.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
  }, [invoices, patients, startDate, endDate, patientSearchTerm, searchParam]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Unpaid Bills</h1>
      <p className="text-text-secondary mb-8">A list of all outstanding invoices. Overdue reminders are sent automatically.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1"><label className="block text-sm font-medium text-text-secondary mb-1">Date From</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
          <div className="md:col-span-1"><label className="block text-sm font-medium text-text-secondary mb-1">Date To</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
          <div className="md:col-span-1"><label className="block text-sm font-medium text-text-secondary mb-1">Filter by Patient</label><div className="flex gap-2"><div className="relative flex-grow"><input type="text" placeholder={`By ${searchParam === 'name' ? 'Name' : 'Telephone'}`} value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /><SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /></div><select value={searchParam} onChange={(e) => setSearchParam(e.target.value as any)} className="bg-gray-50 border border-gray-300 rounded-lg p-2"><option value="name">Name</option><option value="contact">Telephone</option></select></div></div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-center">Notification Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnpaidInvoices.length > 0 ? filteredUnpaidInvoices.map(inv => {
                const isOverdue = new Date(inv.dueDate) < new Date();
                return (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{inv.id}</td>
                    <td className="p-3 font-medium">{inv.patientName}</td>
                    <td className={`p-3 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="p-3 font-medium">GH₵{inv.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-center">
                        {inv.notificationSent && isOverdue ? 
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded-full"><CheckCircleIcon className="w-4 h-4"/> Sent</span> :
                          isOverdue ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 bg-red-100 px-2 py-1 rounded-full"><ClockIcon className="w-4 h-4"/> Overdue</span> :
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">Pending</span>
                        }
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => setSelectedInvoice(inv)} className="btn-primary text-sm !px-3 !py-1.5">View & Pay</button>
                    </td>
                  </tr>
                )
              }) : (<tr><td colSpan={6} className="text-center py-10 text-text-secondary"><CheckCircleIcon className="w-16 h-16 mx-auto text-green-300 mb-4" /><h3 className="text-lg font-semibold">All Bills Are Settled!</h3><p>There are no outstanding invoices at this time.</p></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <InvoiceDetailModal invoice={selectedInvoice} patient={patients.find(p => p.id === selectedInvoice?.patientId) || null} onClose={() => setSelectedInvoice(null)} onMarkAsPaid={handleMarkAsPaid} currentUserId={currentUser.id} />
    </div>
  );
};


// --- Main Component Router ---
interface AccountsManagementProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  patients: Patient[];
  users: User[];
  currentUser: User;
  currentView: AppView;
}

const AccountsManagement: React.FC<AccountsManagementProps> = (props) => {
  const { currentView } = props;

  const renderView = () => {
    switch(currentView) {
      case AppView.PATIENT_BILLS:
        return <PatientBillsView {...props} />;
      case AppView.FINANCIAL_RECORDS:
        return <FinancialRecordsView {...props} />;
      case AppView.UNPAID_BILLS:
        return <UnpaidBillsView {...props} />;
      default:
        // Fallback to Patient Bills for any other account-related view
        return <PatientBillsView {...props} />;
    }
  };

  return (
    <>
      <style>{`.btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; } .btn-primary:hover:not(:disabled) { background-color: #005A5A; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; } .btn-secondary:hover:not(:disabled) { background-color: #d1d5db; } .btn-primary:disabled, .btn-secondary:disabled { opacity: 0.7; cursor: not-allowed; }`}</style>
      {renderView()}
    </>
  );
};

export default AccountsManagement;