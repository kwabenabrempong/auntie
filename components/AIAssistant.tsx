import React, { useState, useCallback } from 'react';
import { analyzeMedicalNotes } from '../services/geminiService';
import { ExtractedMedicalInfo } from '../types';

const SAMPLE_NOTE = `Patient Name: Maria Garcia, 45 F.
Chief Complaint: Patient presents with a persistent dry cough and shortness of breath, which has worsened over the last week. Reports feeling tired and has a low-grade fever.
Vitals: BP 130/85 mmHg, HR 90 bpm, Temp 37.8 C, RR 22 bpm.
Examination: Lungs show crackles on auscultation. No other significant findings.
Assessment: Suspected community-acquired pneumonia.
Plan: Prescribe Azithromycin 500mg once daily for 5 days. Advised patient to rest, hydrate, and monitor symptoms. Schedule a follow-up appointment in 1 week to check progress.`;

const ResultCard: React.FC<{ label: string; value: React.ReactNode;}> = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-brand-secondary mb-2">{label}</h3>
        <div className="text-text-primary text-sm">{value}</div>
    </div>
);

const AIAssistant: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<ExtractedMedicalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!notes.trim()) {
      setError('Please enter some medical notes to analyze.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const extractedData = await analyzeMedicalNotes(notes);
      setResult(extractedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [notes]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">AI Clinical Note Assistant</h1>
      <p className="text-text-secondary mb-8">Paste unstructured clinical notes below to automatically extract structured data.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <label htmlFor="notes" className="block text-lg font-bold text-text-primary">
                Clinical Notes
                </label>
                <button onClick={() => setNotes(SAMPLE_NOTE)} className="text-sm text-brand-primary hover:underline">Load Sample</button>
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste or type clinical notes here..."
              className="w-full h-80 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              disabled={isLoading}
            ></textarea>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full mt-4 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition duration-200 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isLoading ? 'Analyzing...' : 'Analyze Notes'}
            </button>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">Extracted Information</h2>
          <div className="space-y-4">
            {isLoading && (
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                  <p className="text-text-secondary">AI is processing the notes...</p>
              </div>
            )}
            {result ? (
              <>
                <ResultCard label="Principal Complaints" value={<p>{result.principalComplaints}</p>} />
                <ResultCard label="Vitals" value={
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span><strong>BP:</strong> {result.vitals.bloodPressure}</span>
                        <span><strong>Heart Rate:</strong> {result.vitals.heartRate}</span>
                        <span><strong>Temp:</strong> {result.vitals.temperature}</span>
                        <span><strong>Resp. Rate:</strong> {result.vitals.respiratoryRate}</span>
                    </div>
                }/>
                <ResultCard label="Diagnosis" value={
                    result.diagnosis.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                            {result.diagnosis.map((d, i) => <li key={i}>{d.name}</li>)}
                        </ul>
                    ) : <p>N/A</p>
                } />
                 <ResultCard label="Prescriptions" value={
                    result.prescriptions && result.prescriptions.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                           {result.prescriptions.map((p, i) => <li key={i}>{`${p.drugName} ${p.strength || ''} ${p.formulation || ''}`.trim()}: {p.dose}, {p.frequency}, {p.roa}</li>)}
                        </ul>
                    ) : <p>N/A</p>
                }/>
                <ResultCard label="History" value={<p>{result.history}</p>} />
                <ResultCard label="Treatment Plan" value={<p>{result.treatmentPlan}</p>} />
              </>
            ) : (
                !isLoading && <div className="bg-white p-6 rounded-xl shadow-md text-center text-text-secondary">Results will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;