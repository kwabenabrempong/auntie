
import React from 'react';
import { Appointment } from '../types';

const AppointmentList: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {

  const getStatusColor = (status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Draft') => {
    switch(status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Appointments</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-text-secondary">Patient Name</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Date</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Time</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Reason</th>
                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-text-primary">{app.patientName}</td>
                  <td className="p-3 text-text-secondary">{new Date(app.date).toLocaleDateString()}</td>
                  <td className="p-3 text-text-secondary">{app.time}</td>
                  <td className="p-3 text-text-secondary">{app.reason}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
