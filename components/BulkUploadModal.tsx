import React, { useState, useCallback, useEffect } from 'react';
import { CloseIcon } from './icons';

interface BulkUploadModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: T[]) => void;
  title: string;
  sampleFileName: string;
  sampleHeaders: string[];
  parseLine: (parts: string[]) => T | null;
}

export const BulkUploadModal = <T extends {}>({
  isOpen,
  onClose,
  onUpload,
  title,
  sampleFileName,
  sampleHeaders,
  parseLine,
}: BulkUploadModalProps<T>) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid .csv file.');
        setFile(null);
      }
    }
  };

  const handleDownloadSample = () => {
    const csvContent = sampleHeaders.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', sampleFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = useCallback(() => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setError('File is empty or could not be read.');
        return;
      }
      
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) { // Header + at least one data row
          setError('CSV file must contain a header and at least one row of data.');
          return;
      }
      
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeader = sampleHeaders.map(h => h.toLowerCase());

      if (header.length !== expectedHeader.length || !expectedHeader.every((h, i) => h === header[i])) {
        setError(`Invalid CSV header. Expected: ${sampleHeaders.join(',')}`);
        return;
      }
      
      const data: T[] = [];
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length !== sampleHeaders.length) {
          errors.push(`Row ${i + 1}: Incorrect number of columns.`);
          continue;
        }
        
        const parsedObject = parseLine(parts);
        if (parsedObject) {
          data.push(parsedObject);
        } else {
          errors.push(`Row ${i + 1}: Invalid data format or content.`);
        }
      }
      
      if (errors.length > 0) {
        setError(errors.slice(0, 5).join('\n'));
      } else {
        onUpload(data);
        onClose();
      }
    };
    
    reader.onerror = () => {
        setError('Error reading file.');
    }
    
    reader.readAsText(file);
  }, [file, onUpload, onClose, parseLine, sampleHeaders]);
  
  useEffect(() => {
      if (!isOpen) {
          setFile(null);
          setError('');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <CloseIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-text-secondary">
            Upload a CSV file with the following columns: <code className="bg-gray-100 p-1 rounded text-sm">{sampleHeaders.join(', ')}</code>. The header is case-insensitive.
          </p>
          <button onClick={handleDownloadSample} className="text-brand-primary hover:underline text-sm font-medium">
            Download Sample CSV File
          </button>
          
          <div className="mt-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload File</label>
            <input 
              id="file-upload"
              type="file" 
              accept=".csv,text/csv"
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-brand-primary hover:file:text-white"
            />
          </div>
          {file && <p className="text-sm text-text-secondary">Selected file: {file.name}</p>}
          {error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm whitespace-pre-wrap">{error}</div>}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="button" onClick={handleUpload} disabled={!file} className="btn-primary">Upload and Process</button>
        </div>
        <style>{`.btn-primary { background-color: #007A7A; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-primary:hover:not(:disabled) { background-color: #005A5A; } .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; } .btn-secondary { background-color: #e5e7eb; color: #4a5568; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; } .btn-secondary:hover { background-color: #d1d5db; }`}</style>
      </div>
    </div>
  );
};
