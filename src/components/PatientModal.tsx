import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (patient: any) => void;
  initialData?: any;
}

export function PatientModal({ isOpen, onClose, onSave, initialData }: PatientModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    plan: 'Particular',
    pathology: '',
    medication: '',
    secondaryPhone: '',
    relationship: '',
    appointmentDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        birthDate: initialData.birthDate || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        plan: initialData.plan || 'Particular',
        pathology: initialData.pathology || '',
        medication: initialData.medication || '',
        secondaryPhone: initialData.secondaryPhone || '',
        relationship: initialData.relationship || '',
        appointmentDate: initialData.appointmentDate || ''
      });
    } else {
      setFormData({
        name: '',
        birthDate: '',
        phone: '',
        email: '',
        plan: 'Particular',
        pathology: '',
        medication: '',
        secondaryPhone: '',
        relationship: '',
        appointmentDate: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      try {
        await onSave({
          ...formData,
          id: initialData?.id || Math.random().toString(36).substr(2, 9),
          lastVisit: initialData?.lastVisit || 'Novo',
          status: initialData?.status || 'Ativo'
        });
        // Toast is now handled by the parent or here if we want to be sure
        // But the parent handleSavePatient in Patients.tsx doesn't show success toast, 
        // it only shows error toast. Dashboard.tsx also doesn't show success toast.
        // Let's keep the success toast here but only if it succeeds.
        addToast(initialData ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!', 'success');
        onClose();
      } catch (error) {
        // Error is handled by the onSave implementation (it should throw)
        console.error('Form submission error:', error);
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const truncated = numbers.slice(0, 11);
    
    // Apply mask (XX) XXXXX-XXXX
    if (truncated.length <= 2) return truncated;
    if (truncated.length <= 7) return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'secondaryPhone') => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, [field]: formatted });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
              placeholder="Ex: João Silva" 
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
              <input 
                type="date" 
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e, 'phone')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                placeholder="(00) 90000-0000" 
                maxLength={15}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                placeholder="joao@email.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Próximo Agendamento</label>
              <input 
                type="datetime-local" 
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Plano</label>
            <select 
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
            >
              <option value="Particular">Particular</option>
              <option value="Unimed">Unimed</option>
              <option value="Bradesco Saúde">Bradesco Saúde</option>
              <option value="SulAmérica">SulAmérica</option>
              <option value="Amil">Amil</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Informações Clínicas (Para Agendamento de Mensagens)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patologia</label>
                <input 
                  type="text" 
                  value={formData.pathology}
                  onChange={(e) => setFormData({ ...formData, pathology: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                  placeholder="Ex: Diabetes, Hipertensão" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicação em Uso</label>
                <input 
                  type="text" 
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                  placeholder="Ex: Insulina, Losartana" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Segundo Contato (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Secundário</label>
                <input 
                  type="tel" 
                  value={formData.secondaryPhone}
                  onChange={(e) => handlePhoneChange(e, 'secondaryPhone')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                  placeholder="(00) 90000-0000" 
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parentesco/Descrição</label>
                <input 
                  type="text" 
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
                  placeholder="Ex: Pai, Esposa, Filho" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
            >
              {initialData ? 'Atualizar Paciente' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
