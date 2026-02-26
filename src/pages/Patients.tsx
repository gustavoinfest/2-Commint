import React from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';

export function Patients() {
  const patients = [
    { id: 1, name: 'Ana Clara Souza', email: 'ana.souza@email.com', phone: '(11) 99999-1111', lastVisit: '10/02/2024', status: 'Ativo', plan: 'Particular' },
    { id: 2, name: 'Carlos Eduardo', email: 'carlos.edu@email.com', phone: '(11) 98888-2222', lastVisit: '05/02/2024', status: 'Inativo', plan: 'Unimed' },
    { id: 3, name: 'Mariana Lima', email: 'mari.lima@email.com', phone: '(11) 97777-3333', lastVisit: '12/02/2024', status: 'Ativo', plan: 'Bradesco' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie seus pacientes e históricos</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
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
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Visita</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{patient.name}</div>
                  <div className="text-xs text-slate-500">{patient.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{patient.plan}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{patient.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{patient.lastVisit}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
