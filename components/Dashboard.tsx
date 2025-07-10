

import React from 'react';
import { Patient, Appointment, User, AppView } from '../types';
import { PatientsIcon, AppointmentsIcon, CalendarIcon, PatientRecordIcon, AdminIcon, ChartBarIcon, BillingIcon, PillIcon, ProcedureIcon, FrequencyIcon } from './icons';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  currentUser: User;
  setView: (view: AppView) => void;
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    color: string;
    onClick?: () => void;
}

function StatCard({ icon, title, value, color, onClick }: StatCardProps) {
    return (
      <div 
        className="bg-white p-6 rounded-xl shadow-md flex items-center transition-transform transform hover:scale-105 cursor-pointer"
        onClick={onClick}
      >
          <div className={`p-4 rounded-full ${color}`}>
              {icon}
          </div>
          <div className="ml-4">
              <p className="text-text-secondary text-sm font-medium">{title}</p>
              <p className="text-3xl font-bold text-text-primary">{value}</p>
          </div>
      </div>
    );
}


interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

function NavButton({ icon, label, onClick }: NavButtonProps) {
    return (
        <button onClick={onClick} className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-brand-light">
            <div className="bg-brand-primary text-white p-4 rounded-full mb-3">
                {icon}
            </div>
            <p className="font-semibold text-text-primary">{label}</p>
        </button>
    );
}


export default function Dashboard({ patients, appointments, currentUser, setView }: DashboardProps) {
  const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled' && new Date(a.date) >= new Date());

  const quickActions = [
      { label: 'Appointment Calendar', icon: <CalendarIcon className="w-7 h-7" />, view: AppView.APPOINTMENT_CALENDAR },
      { label: 'Patient Record', icon: <PatientRecordIcon className="w-7 h-7" />, view: AppView.PATIENT_RECORDS },
      { label: 'User Management', icon: <AdminIcon className="w-7 h-7" />, view: AppView.USER_MANAGEMENT },
      { label: 'MIS', icon: <ChartBarIcon className="w-7 h-7" />, view: AppView.MIS },
      { label: 'Accounts Management', icon: <BillingIcon className="w-7 h-7" />, view: AppView.PATIENT_BILLS },
      { label: 'Drugs Management', icon: <PillIcon className="w-7 h-7" />, view: AppView.DRUGS },
      { label: 'Procedure Management', icon: <ProcedureIcon className="w-7 h-7" />, view: AppView.PROCEDURES },
      { label: 'Frequency Rules', icon: <FrequencyIcon className="w-7 h-7" />, view: AppView.DRUG_FREQUENCY_RULES },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
      <p className="text-text-secondary mb-8">Welcome back, {currentUser.firstName}! Here's an overview of your clinic's activity.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<PatientsIcon className="w-8 h-8 text-blue-500" />} 
            title="Total Patients" 
            value={patients.length} 
            color="bg-blue-100"
            onClick={() => setView(AppView.PATIENT_RECORDS)}
          />
          <StatCard 
            icon={<AppointmentsIcon className="w-8 h-8 text-green-500" />} 
            title="Upcoming Appointments" 
            value={upcomingAppointments.length} 
            color="bg-green-100"
            onClick={() => setView(AppView.APPOINTMENT_CALENDAR)}
          />
           <StatCard 
            icon={<div className="w-8 h-8 text-purple-500 flex items-center justify-center text-3xl">🩺</div>} 
            title="Appointments Today" 
            value={appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length} 
            color="bg-purple-100"
            onClick={() => setView(AppView.APPOINTMENT_CALENDAR)}
          />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map(action => (
                <NavButton key={action.label} icon={action.icon} label={action.label} onClick={() => setView(action.view)} />
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-text-primary mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-text-secondary">Patient</th>
                  <th className="p-3 text-sm font-semibold text-text-secondary">Date</th>
                  <th className="p-3 text-sm font-semibold text-text-secondary">Time</th>
                  <th className="p-3 text-sm font-semibold text-text-secondary">Reason</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.slice(0, 5).map(app => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-text-primary font-medium">{app.patientName}</td>
                    <td className="p-3 text-text-secondary">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="p-3 text-text-secondary">{app.time}</td>
                    <td className="p-3 text-text-secondary">{app.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">No upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};