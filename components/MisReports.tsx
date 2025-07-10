import React, { useState, useMemo } from 'react';
import { Patient, Appointment, Invoice, InvoiceStatus } from '../types';
import { BillingIcon, PatientsIcon, TrendingUpIcon, AppointmentsIcon } from './icons';

// Helper to get date from N days ago
const getDateAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

// --- Reusable Components ---
const KPICard: React.FC<{ icon: React.ReactNode; title: string; value: string; colorClass: string; }> = ({ icon, title, value, colorClass }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center transition-transform transform hover:scale-105">
        <div className={`p-4 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-text-secondary text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-text-primary mb-4">{title}</h3>
        <div className="h-72">{children}</div>
    </div>
);

const NoData: React.FC<{ message?: string }> = ({ message = "No data available for this period."}) => (
    <div className="flex items-center justify-center h-full text-text-secondary">
        <p>{message}</p>
    </div>
);

// --- Custom Chart Components (No external libraries) ---

const BarChart: React.FC<{ data: { label: string; value: number }[]; color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="w-full h-full flex items-end justify-around gap-2 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end" title={`${d.label}: ${d.value}`}>
                    <div className="text-sm font-bold text-text-primary">
                        {d.value.toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-t-md" style={{ height: '100%' }}>
                        <div style={{ height: `${(d.value / maxValue) * 100}%`, backgroundColor: color }} className="w-full rounded-t-md transition-all duration-500 ease-out flex items-end justify-center">
                        </div>
                    </div>
                    <div className="text-xs text-text-secondary mt-1 truncate">{d.label}</div>
                </div>
            ))}
        </div>
    );
};

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return <NoData />;

    let cumulativePercent = 0;
    const slices = data.map(d => {
        const percent = d.value / total;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return { ...d, percent, start, end: cumulativePercent };
    });

    // Function to get coordinates for a pie slice path
    const getCoords = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="w-full h-full flex items-center justify-center gap-8">
            <svg viewBox="-1 -1 2 2" className="w-48 h-48 transform -rotate-90">
                {slices.map(slice => {
                    const [startX, startY] = getCoords(slice.start);
                    const [endX, endY] = getCoords(slice.end);
                    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
                    const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                    return <path key={slice.label} d={pathData} fill={slice.color} />;
                })}
            </svg>
            <div className="flex flex-col gap-2">
                {data.map(d => (
                    <div key={d.label} className="flex items-center">
                        <div style={{ backgroundColor: d.color }} className="w-4 h-4 rounded-sm mr-2"></div>
                        <span className="text-text-primary font-medium">{d.label}: </span>
                        <span className="text-text-secondary ml-1">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LineChart: React.FC<{ data: { label: string, value: number }[], color: string }> = ({ data, color }) => {
    if (data.length < 2) return <NoData message="Not enough data to draw a line chart." />;

    const maxValue = Math.max(...data.map(item => item.value), 1);
    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 95; // 95% to leave some top padding
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between text-xs text-text-secondary">
                <span>{data[0].label}</span>
                <span>{data[data.length - 1].label}</span>
            </div>
        </div>
    );
};


// --- Main Component ---
interface MisReportsProps {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
}

const MisReports: React.FC<MisReportsProps> = ({ patients, appointments, invoices }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  const filteredData = useMemo(() => {
    const startDate = timeRange === 'all' ? new Date(0) : getDateAgo(timeRange === '30d' ? 30 : 90);
    const now = new Date();
    
    return {
        appointments: appointments.filter(a => new Date(a.date) >= startDate && new Date(a.date) <= now),
        invoices: invoices.filter(i => new Date(i.issueDate) >= startDate && new Date(i.issueDate) <= now),
    };
  }, [appointments, invoices, timeRange]);

  const kpis = useMemo(() => {
    const totalRevenue = filteredData.invoices
        .filter(i => i.status === InvoiceStatus.PAID)
        .reduce((sum, i) => sum + i.totalAmount, 0);

    const outstandingRevenue = filteredData.invoices
        .filter(i => i.status === InvoiceStatus.UNPAID)
        .reduce((sum, i) => sum + i.totalAmount, 0);
    
    return {
        totalRevenue: `GH₵${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        outstandingRevenue: `GH₵${outstandingRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        appointmentsThisPeriod: filteredData.appointments.length.toLocaleString(),
        totalPatients: patients.length.toLocaleString(),
    };
  }, [filteredData, patients]);

  const chartData = useMemo(() => {
    // Monthly Revenue (Bar Chart)
    const revenueByMonth: { [key: string]: number } = {};
    invoices.filter(i => i.status === InvoiceStatus.PAID).forEach(i => {
        const month = new Date(i.issueDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + i.totalAmount;
    });
    const monthlyRevenueData = Object.entries(revenueByMonth).map(([label, value]) => ({ label, value })).slice(-6); // Last 6 months

    // Appointment Status (Pie Chart)
    const appointmentStatusData = [
        { label: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#3b82f6' },
        { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#22c55e' },
        { label: 'Draft', value: appointments.filter(a => a.status === 'Draft').length, color: '#f59e0b' },
        { label: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444' },
    ];

    // Patient Growth (Line Chart)
    // Using mock patient data creation date (approximated by index) for demo
    const patientGrowthData = patients.reduce((acc, patient, index) => {
        const month = `Month ${Math.floor(index/2) + 1}`; // Grouping by 2 for demo
        const last = acc[acc.length-1];
        if (last && last.label === month) {
            last.value += 1;
        } else {
            acc.push({ label: month, value: (last?.value || 0) + 1 });
        }
        return acc;
    }, [] as {label: string, value: number}[]);

    // Top Procedures (Bar Chart)
    const procedureCounts: { [key: string]: number } = {};
    appointments.filter(a => a.status === 'Completed' && a.consultation).forEach(a => {
        a.consultation!.diagnosis.forEach(d => {
            procedureCounts[d.name] = (procedureCounts[d.name] || 0) + 1;
        });
    });
    const topProceduresData = Object.entries(procedureCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({ label, value }));

    return { monthlyRevenueData, appointmentStatusData, patientGrowthData, topProceduresData };
  }, [invoices, appointments, patients]);

  const TimeRangeButton: React.FC<{label: string, value: '30d' | '90d' | 'all'}> = ({label, value}) => (
      <button 
        onClick={() => setTimeRange(value)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeRange === value ? 'bg-brand-primary text-white' : 'bg-gray-200 text-text-secondary hover:bg-gray-300'}`}
      >{label}</button>
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">MIS Dashboard</h1>
            <p className="text-text-secondary mt-1">Analytics and reporting for clinic performance.</p>
        </div>
        <div className="flex items-center gap-2">
            <TimeRangeButton label="Last 30 Days" value="30d" />
            <TimeRangeButton label="Last 90 Days" value="90d" />
            <TimeRangeButton label="All Time" value="all" />
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard icon={<BillingIcon className="w-8 h-8 text-green-500" />} title="Total Revenue" value={kpis.totalRevenue} colorClass="bg-green-100" />
        <KPICard icon={<BillingIcon className="w-8 h-8 text-yellow-500" />} title="Outstanding Payments" value={kpis.outstandingRevenue} colorClass="bg-yellow-100" />
        <KPICard icon={<AppointmentsIcon className="w-8 h-8 text-blue-500" />} title="Appointments This Period" value={kpis.appointmentsThisPeriod} colorClass="bg-blue-100" />
        <KPICard icon={<PatientsIcon className="w-8 h-8 text-purple-500" />} title="Total Patients" value={kpis.totalPatients} colorClass="bg-purple-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Monthly Revenue (Last 6 Months)">
           {chartData.monthlyRevenueData.length > 0 ? <BarChart data={chartData.monthlyRevenueData} color="#007A7A" /> : <NoData />}
        </ChartCard>
        <ChartCard title="Appointment Status">
            <PieChart data={chartData.appointmentStatusData} />
        </ChartCard>
        <ChartCard title="Patient Growth">
            {chartData.patientGrowthData.length > 1 ? <LineChart data={chartData.patientGrowthData} color="#005A5A" /> : <NoData message="Not enough patient data for a trend line." />}
        </ChartCard>
        <ChartCard title="Top 5 Procedures">
           {chartData.topProceduresData.length > 0 ? <BarChart data={chartData.topProceduresData} color="#FFB6C1" /> : <NoData />}
        </ChartCard>
      </div>
    </div>
  );
};

export default MisReports;