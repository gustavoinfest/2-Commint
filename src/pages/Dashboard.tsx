import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Plus, 
  Users, 
  CheckCircle2, 
  Cake, 
  Calendar, 
  Phone, 
  Star,
  MessageCircle
} from 'lucide-react';
import { cn, getWhatsAppLink } from '../lib/utils';
import { PatientModal } from '../components/PatientModal';
import { useToast } from '../contexts/ToastContext';

export function Dashboard() {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    patients: 0,
    actionsToday: 0,
    birthdays: 0,
    returns: 0,
    followups: 0
  });
  const [birthdayPatient, setBirthdayPatient] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, transactionsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/transactions')
      ]);
      
      const patients = await patientsRes.json();
      const transactions = await transactionsRes.json();

      // Calculate stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentDayMonth = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

      const birthdayCount = patients.filter((p: any) => {
        if (!p.birthDate) return false;
        // Check if birthDate matches DD/MM
        const [year, month, day] = p.birthDate.split('-');
        return `${day}/${month}` === currentDayMonth; // Assuming YYYY-MM-DD format from input
      }).length;

      // Find a birthday patient for display
      const bdayPatient = patients.find((p: any) => {
        if (!p.birthDate) return false;
        const [year, month, day] = p.birthDate.split('-');
        return `${day}/${month}` === currentDayMonth;
      });
      setBirthdayPatient(bdayPatient);

      setStats({
        patients: patients.length,
        actionsToday: 0, // Placeholder logic
        birthdays: birthdayCount,
        returns: 3, // Placeholder
        followups: 5 // Placeholder
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleBackup = async () => {
    try {
      addToast('Iniciando backup...', 'info');
      const response = await fetch('/api/backup');
      if (!response.ok) throw new Error('Backup failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addToast('Backup realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Backup error:', error);
      addToast('Erro ao realizar backup', 'error');
    }
  };

  const handleSendBirthdayMessage = (name: string, phone: string) => {
    const message = `Olá ${name}, a equipe da Clínica deseja um feliz aniversário! Muita saúde e paz! 🎂🎉`;
    const link = getWhatsAppLink(phone, message);
    window.open(link, '_blank');
    addToast(`Abrindo WhatsApp para ${name}...`, 'info');
  };

  const handleSavePatient = async (patientData: any) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error('Failed to create patient');
      
      // Refresh stats after saving
      await fetchStats();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      addToast('Erro ao salvar paciente', 'error');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePatient}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Bom dia!</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Backup
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Small Stats */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[160px]">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.patients}</p>
            <p className="text-xs text-slate-500 font-medium">Pacientes</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[160px]">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.actionsToday}</p>
            <p className="text-xs text-slate-500 font-medium">Ações Hoje</p>
          </div>
        </div>
      </div>

      {/* Large Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Cake} 
          iconColor="text-pink-500" 
          iconBg="bg-pink-50" 
          value={String(stats.birthdays)}
          label="Aniversariantes Hoje" 
        />
        <StatCard 
          icon={Calendar} 
          iconColor="text-emerald-500" 
          iconBg="bg-emerald-50" 
          value={String(stats.returns)}
          label="Retornos Atrasados" 
        />
        <StatCard 
          icon={Phone} 
          iconColor="text-purple-500" 
          iconBg="bg-purple-50" 
          value={String(stats.followups)}
          label="Follow-up Pendente" 
        />
        <StatCard 
          icon={Star} 
          iconColor="text-yellow-500" 
          iconBg="bg-yellow-50" 
          value="4.9" 
          label="Avaliação Google" 
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Lembretes e Ações</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1 bg-white rounded-md text-sm font-medium text-slate-800 shadow-sm">Todos</button>
            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700">Urgentes</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {birthdayPatient ? (
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{birthdayPatient.name}</div>
                    <div className="text-xs text-slate-500">Aniversariante do dia! 🎂</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      Aniversário
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">Hoje</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Aguardando Envio
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSendBirthdayMessage(birthdayPatient.name, birthdayPatient.phone)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors group relative"
                      title="Enviar mensagem via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5 fill-emerald-50 group-hover:fill-emerald-100" />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Nenhum lembrete ou ação pendente para hoje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, iconBg, value, label }: { icon: any, iconColor: string, iconBg: string, value: string, label: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
