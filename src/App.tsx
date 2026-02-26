import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Settings } from './pages/Settings';
import { Financial } from './pages/Financial';
import { ToastProvider } from './contexts/ToastContext';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [clinicName, setClinicName] = useState('ClinicFlow');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
        <Sidebar activePage={activePage} setPage={setActivePage} clinicName={clinicName} />
        
        <main className="flex-1 ml-64">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'pacientes' && <Patients />}
          {activePage === 'configuracoes' && <Settings clinicName={clinicName} setClinicName={setClinicName} />}
          {activePage === 'financeiro' && <Financial />}
        </main>
      </div>
    </ToastProvider>
  );
}
