import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Download, 
  Calendar,
  Search,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';

interface Transaction {
  id: string;
  patientName: string;
  type: 'entrada' | 'saida';
  status: 'concluido' | 'pendente';
  value: number;
  date: string;
  description: string;
}

export function Financial() {
  const { addToast } = useToast();
  const [filterDate, setFilterDate] = useState({ day: '', month: '', year: new Date().getFullYear().toString() });
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    patientName: '',
    value: '',
    status: 'pendente' as const,
    description: 'Consulta'
  });

  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactionsList(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      addToast('Erro ao carregar transações', 'error');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchPatients()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleValueChange = async (id: string, newValue: string) => {
    const val = parseFloat(newValue);
    if (!isNaN(val)) {
      try {
        await fetch(`/api/transactions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: val }),
        });
        setTransactionsList(transactionsList.map(t => t.id === id ? { ...t, value: val } : t));
      } catch (error) {
        console.error('Error updating transaction value:', error);
        addToast('Erro ao atualizar valor', 'error');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const transaction = transactionsList.find(t => t.id === id);
    if (!transaction) return;

    const newStatus = transaction.status === 'concluido' ? 'pendente' : 'concluido';
    
    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      setTransactionsList(transactionsList.map(t => {
        if (t.id === id) {
          addToast(`Status alterado para ${newStatus === 'concluido' ? 'Concluído' : 'Em Aberto'}`, 'info');
          return { ...t, status: newStatus };
        }
        return t;
      }));
    } catch (error) {
      console.error('Error updating transaction status:', error);
      addToast('Erro ao atualizar status', 'error');
    }
  };

  const handleLaunchTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const transaction = {
      patientName: newTransaction.patientName,
      type: 'entrada',
      status: newTransaction.status,
      value: parseFloat(newTransaction.value),
      date: new Date().toISOString().split('T')[0],
      description: newTransaction.description
    };

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      
      fetchTransactions();
      setShowLaunchModal(false);
      setNewTransaction({ patientName: '', value: '', status: 'pendente', description: 'Consulta' });
      addToast('Lançamento realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Error launching transaction:', error);
      addToast('Erro ao lançar transação', 'error');
    }
  };

  const handleGenerateReport = () => {
    addToast('Relatório gerado com sucesso!', 'success');
  };

  const stats = [
    { label: 'Entradas', value: 'R$ 680,00', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Saídas', value: 'R$ 1.200,00', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Em Aberto', value: 'R$ 180,00', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Concluído', value: 'R$ 500,00', icon: CheckCircle2, color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500 mt-1">Gestão de fluxo de caixa e pagamentos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLaunchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
          >
            <TrendingUp className="w-4 h-4" />
            Lançar Consulta
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Gerar Relatório PDF
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Reports */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros de Relatório
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Dia</label>
            <input 
              type="number" 
              placeholder="Ex: 20"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterDate.day}
              onChange={(e) => setFilterDate({...filterDate, day: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Mês</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterDate.month}
              onChange={(e) => setFilterDate({...filterDate, month: e.target.value})}
            >
              <option value="">Todos os meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Ano</label>
            <input 
              type="number" 
              placeholder="Ex: 2024"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterDate.year}
              onChange={(e) => setFilterDate({...filterDate, year: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Movimentações Recentes</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por paciente..." 
              className="pl-10 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionsList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{t.patientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {t.type === 'entrada' ? <TrendingUp className="w-3 h-3 text-sky-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                      <span className="text-sm text-slate-600">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.date}</td>
                  <td className="px-6 py-4">
                    {editingId === t.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          autoFocus
                          className="w-24 px-2 py-1 border border-sky-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                          value={t.value}
                          onChange={(e) => handleValueChange(t.id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingId(t.id)}
                        className={cn("font-semibold hover:bg-slate-100 px-2 py-1 rounded transition-colors", t.type === 'entrada' ? 'text-sky-600' : 'text-red-600')}
                      >
                        {t.type === 'entrada' ? '+' : '-'} R$ {t.value.toFixed(2)}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(t.id)}
                      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95", 
                        t.status === 'concluido' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {t.status === 'concluido' ? 'Concluído' : 'Em Aberto'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Launch Transaction Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Lançar Consulta</h2>
              <button onClick={() => setShowLaunchModal(false)} className="text-slate-400 hover:text-slate-600">
                <Search className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleLaunchTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  value={newTransaction.patientName}
                  onChange={(e) => setNewTransaction({...newTransaction, patientName: e.target.value})}
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="0,00"
                    value={newTransaction.value}
                    onChange={(e) => setNewTransaction({...newTransaction, value: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={newTransaction.status}
                    onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value as 'concluido' | 'pendente'})}
                  >
                    <option value="concluido">Pago (Concluído)</option>
                    <option value="pendente">Aberto (Pendente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Ex: Consulta Particular"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
