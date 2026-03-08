import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Edit2, Trash2, UserPlus, MessageCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PatientModal } from '../components/PatientModal';
import { getWhatsAppLink, cn } from '../lib/utils';

export function Patients() {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{ id: number | string, top: number, left: number } | null>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPatientsList(data);
      } else {
        console.error('Expected array of patients, got:', data);
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      addToast('Erro ao carregar pacientes', 'error');
      throw error; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id: number | string) => {
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      setPatientsList(patientsList.filter(p => p.id !== id));
      addToast('Paciente excluído com sucesso', 'success');
      setActiveMenu(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
      addToast('Erro ao excluir paciente', 'error');
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSavePatient = async (patientData: any) => {
    try {
      if (editingPatient) {
        const response = await fetch(`/api/patients/${patientData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao atualizar paciente');
        }
        setPatientsList(patientsList.map(p => p.id === patientData.id ? patientData : p));
      } else {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao criar paciente');
        }
        await fetchPatients();
      }
      setIsModalOpen(false);
      setEditingPatient(null);
    } catch (error: any) {
      console.error('Error saving patient:', error);
      addToast(error.message || 'Erro ao salvar paciente', 'error');
      throw error; // Re-throw to prevent modal from closing in handleSubmit
    }
  };

  const handleToggleAttendance = async (patient: any) => {
    const newStatus = patient.attendanceStatus === 'Compareceu' ? 'Faltou' : 
                     patient.attendanceStatus === 'Faltou' ? 'Pendente' : 'Compareceu';
    
    try {
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patient, attendanceStatus: newStatus }),
      });
      setPatientsList(patientsList.map(p => p.id === patient.id ? { ...p, attendanceStatus: newStatus } : p));
      addToast(`Status de presença alterado para: ${newStatus}`, 'info');
    } catch (error) {
      console.error('Error toggling attendance:', error);
      addToast('Erro ao atualizar presença', 'error');
    }
  };

  const openNewPatientModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie seus pacientes e históricos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openNewPatientModal}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
          >
            <UserPlus className="w-4 h-4" />
            Novo Paciente
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plano</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agendamento</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Presença</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patientsList.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{patient.name}</div>
                  <div className="text-xs text-slate-500">{patient.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{patient.plan}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    {patient.phone}
                    <button 
                      onClick={() => {
                        const link = getWhatsAppLink(patient.phone, `Olá ${patient.name}, tudo bem?`);
                        window.open(link, '_blank');
                      }}
                      className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                      title="Conversar no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {patient.appointmentDate ? new Date(patient.appointmentDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Não agendado'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleAttendance(patient)}
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105",
                      patient.attendanceStatus === 'Compareceu' ? 'bg-sky-100 text-sky-800' : 
                      patient.attendanceStatus === 'Faltou' ? 'bg-red-100 text-red-800' : 
                      'bg-slate-100 text-slate-800'
                    )}
                  >
                    {patient.attendanceStatus || 'Pendente'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'Ativo' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveMenu(activeMenu?.id === patient.id ? null : { 
                        id: patient.id, 
                        top: rect.bottom + window.scrollY, 
                        left: rect.left + window.scrollX - 100 // Adjust to align left
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setActiveMenu(null)}
          />
          <div 
            className="fixed z-50 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: activeMenu.top, left: activeMenu.left }}
          >
            <button 
              onClick={() => {
                const patient = patientsList.find(p => p.id === activeMenu.id);
                if (patient) handleEdit(patient);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar
            </button>
            <button 
              onClick={() => handleDelete(activeMenu.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          </div>
        </>
      )}

      <PatientModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }} 
        onSave={handleSavePatient}
        initialData={editingPatient}
      />
    </div>
  );
}
