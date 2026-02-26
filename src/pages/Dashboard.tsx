import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Users, 
  CheckCircle2, 
  Cake, 
  Calendar, 
  Phone, 
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PatientModal } from '../components/PatientModal';

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Bom dia!</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Backup
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Small Stats */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[160px]">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-500 font-medium">Pacientes</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[160px]">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">0</p>
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
          value="0" 
          label="Aniversariantes Hoje" 
        />
        <StatCard 
          icon={Calendar} 
          iconColor="text-blue-500" 
          iconBg="bg-blue-50" 
          value="0" 
          label="Retornos Atrasados" 
        />
        <StatCard 
          icon={Phone} 
          iconColor="text-purple-500" 
          iconBg="bg-purple-50" 
          value="0" 
          label="Follow-up Pendente" 
        />
        <StatCard 
          icon={Star} 
          iconColor="text-yellow-500" 
          iconBg="bg-yellow-50" 
          value="0" 
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
              {/* Empty state for now to match screenshot, or we can add sample data */}
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Nenhum lembrete ou ação pendente para hoje.
                </td>
              </tr>
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
