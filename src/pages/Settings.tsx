import React, { useState, useEffect } from 'react';
import { Save, Upload, FileJson, FileSpreadsheet, FileText, FileCode, Clock, Calendar as CalendarIcon, Pill, Activity } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

interface SettingsProps {
  clinicName: string;
  setClinicName: (name: string) => void;
}

export function Settings({ clinicName, setClinicName }: SettingsProps) {
  const { addToast } = useToast();
  const [birthdayMessage, setBirthdayMessage] = useState("Olá {nome}, feliz aniversário! Desejamos muita saúde e paz.");
  const [reminderMessage, setReminderMessage] = useState("Olá {nome}, lembrete de sua consulta amanhã às {horario}.");
  
  // New scheduling states
  const [autoBirthday, setAutoBirthday] = useState(true);
  const [birthdayTime, setBirthdayTime] = useState("09:00");
  const [autoReminder, setAutoReminder] = useState(true);
  const [daysAfter, setDaysAfter] = useState("1");
  const [scheduledTime, setScheduledTime] = useState("09:00");

  const [importFormat, setImportFormat] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Scheduling Rules
  const [schedulingRules, setSchedulingRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ criteria: 'Patologia', value: '', patientName: '', daysAfter: '' });
  const [allPatients, setAllPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchRules();
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        const text = await response.text();
        console.error('API Error:', response.status, text);
        return;
      }
      const data = await response.json();
      setAllPatients(data);
    } catch (error) {
      console.error('Error fetching all patients:', error);
    }
  };

  const getCriteriaOptions = () => {
    const options = new Set<string>();
    allPatients.forEach(p => {
      if (newRule.criteria === 'Patologia' && p.pathology) {
        p.pathology.split(',').forEach((val: string) => options.add(val.trim()));
      } else if (newRule.criteria === 'Medicação' && p.medication) {
        p.medication.split(',').forEach((val: string) => options.add(val.trim()));
      } else if (newRule.criteria === 'Tipo de Consulta' && p.plan) {
        options.add(p.plan.trim());
      }
    });
    return Array.from(options).filter(Boolean).sort();
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.clinicName) setClinicName(data.clinicName);
      if (data.birthdayMessage) setBirthdayMessage(data.birthdayMessage);
      if (data.reminderMessage) setReminderMessage(data.reminderMessage);
      if (data.autoBirthday) setAutoBirthday(data.autoBirthday === 'true');
      if (data.birthdayTime) setBirthdayTime(data.birthdayTime);
      if (data.autoReminder) setAutoReminder(data.autoReminder === 'true');
      if (data.daysAfter) setDaysAfter(data.daysAfter);
      if (data.scheduledTime) setScheduledTime(data.scheduledTime);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/scheduling-rules');
      const data = await response.json();
      setSchedulingRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleSave = async () => {
    const settings = {
      clinicName,
      birthdayMessage,
      reminderMessage,
      autoBirthday: String(autoBirthday),
      birthdayTime,
      autoReminder: String(autoReminder),
      daysAfter,
      scheduledTime
    };

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      addToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('Erro ao salvar configurações', 'error');
    }
  };

  const handleAddRule = async () => {
    if (!newRule.value || !newRule.patientName || !newRule.daysAfter) {
      addToast('Preencha todos os campos da regra', 'error');
      return;
    }

    try {
      await fetch('/api/scheduling-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });
      fetchRules();
      setNewRule({ criteria: 'Patologia', value: '', patientName: '', daysAfter: '' });
      addToast('Nova regra de agendamento criada!', 'success');
    } catch (error) {
      console.error('Error adding rule:', error);
      addToast('Erro ao criar regra', 'error');
    }
  };

  const handleRemoveRule = async (id: string) => {
    try {
      await fetch(`/api/scheduling-rules/${id}`, { method: 'DELETE' });
      setSchedulingRules(schedulingRules.filter(r => r.id !== id));
      addToast('Regra removida com sucesso', 'success');
    } catch (error) {
      console.error('Error removing rule:', error);
      addToast('Erro ao remover regra', 'error');
    }
  };

  const handleImportClick = (format: string) => {
    setImportFormat(format);
    if (fileInputRef.current) {
      fileInputRef.current.accept = format === 'XLSX' ? '.xlsx,.xls' : 
                                   format === 'CSV' ? '.csv' : 
                                   format === 'PDF' ? '.pdf' : 
                                   format === 'JSON' ? '.json' : '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && importFormat) {
      addToast(`Importação do arquivo ${file.name} (${importFormat}) iniciada...`, 'info');
      
      // Simulate processing
      setTimeout(() => {
        addToast(`Arquivo ${file.name} importado com sucesso!`, 'success');
        setImportFormat(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2000);
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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie as mensagens automáticas, preferências e dados</p>
      </div>

      {/* Clinic Info Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4">Informações da Clínica</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Clínica</label>
          <input 
            type="text" 
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ex: Clinica Ana Emilia"
          />
        </div>
      </div>

      {/* Mensagens Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4">Mensagens Automáticas</h2>
        
        <div className="space-y-8">
          {/* Birthday Message Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mensagem de Aniversário</label>
                <p className="text-xs text-slate-500">Variáveis disponíveis: {'{nome}'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Enviar automaticamente</span>
                <button 
                  onClick={() => setAutoBirthday(!autoBirthday)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    autoBirthday ? "bg-sky-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    autoBirthday ? "left-6" : "left-1"
                  )} />
                </button>
              </div>
            </div>
            <textarea 
              value={birthdayMessage}
              onChange={(e) => setBirthdayMessage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
            />
            {autoBirthday && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex-1 max-w-[200px]">
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-sky-500" />
                    Horário de Envio
                  </label>
                  <input 
                    type="time" 
                    value={birthdayTime}
                    onChange={(e) => setBirthdayTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder Message Section */}
          <div className="space-y-4 pt-6 border-t border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-slate-700">Lembrete de Consulta</label>
                <p className="text-xs text-slate-500">Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{horario}'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Enviar automaticamente</span>
                <button 
                  onClick={() => setAutoReminder(!autoReminder)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    autoReminder ? "bg-sky-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    autoReminder ? "left-6" : "left-1"
                  )} />
                </button>
              </div>
            </div>
            <textarea 
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
            />
            {autoReminder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 text-sky-500" />
                    Dias após a consulta para envio
                  </label>
                  <input 
                    type="number" 
                    value={daysAfter}
                    onChange={(e) => setDaysAfter(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-sky-500" />
                    Horário programado para disparo
                  </label>
                  <input 
                    type="time" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Specific Scheduling Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-500" />
          Agendamento de Mensagem para Paciente Específico
        </h2>
        
        <p className="text-sm text-slate-500">
          Configure regras de envio baseadas na patologia, medicação ou tipo de consulta, vinculando também o nome do paciente. 
          O sistema identificará pacientes com estas características e agendará as mensagens automaticamente após o número de dias definido.
        </p>
        
        <div className="space-y-6">
          {/* Form to add new rule */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Critério</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={newRule.criteria}
                onChange={(e) => setNewRule({...newRule, criteria: e.target.value})}
              >
                <option>Patologia</option>
                <option>Medicação</option>
                <option>Tipo de Consulta</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor/Nome</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" 
                value={newRule.value}
                onChange={(e) => setNewRule({...newRule, value: e.target.value})}
              >
                <option value="">Selecione...</option>
                {getCriteriaOptions().map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Paciente</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" 
                value={newRule.patientName}
                onChange={(e) => setNewRule({...newRule, patientName: e.target.value})}
              >
                <option value="">Selecione...</option>
                {allPatients.map(p => p.name).sort().map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dias após consulta</label>
              <input 
                type="number" 
                placeholder="Ex: 2" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                min="0" 
                value={newRule.daysAfter}
                onChange={(e) => setNewRule({...newRule, daysAfter: e.target.value})}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button 
                onClick={handleAddRule}
                className="w-full px-3 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                Adicionar Regra
              </button>
            </div>
          </div>

          {/* List of active rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regras Ativas</h3>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {schedulingRules.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">Nenhuma regra cadastrada.</div>
              )}
              {schedulingRules.map((rule) => (
                <div key={rule.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", rule.criteria === 'Patologia' ? 'bg-sky-50' : 'bg-sky-50')}>
                      {rule.criteria === 'Patologia' ? <Activity className="w-4 h-4 text-sky-600" /> : <Pill className="w-4 h-4 text-sky-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Paciente: {rule.patientName} ({rule.criteria}: {rule.value})</p>
                      <p className="text-xs text-slate-500">Enviar mensagem {rule.daysAfter} dias após a consulta</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-xs text-red-500 font-medium hover:underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Dados
        </h2>
        
        <p className="text-sm text-slate-500">Selecione o formato do arquivo para importar seus pacientes ou registros financeiros.</p>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => handleImportClick('XLSX')}
            className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-sky-200 transition-all group"
          >
            <FileSpreadsheet className="w-8 h-8 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600">XLSX</span>
          </button>
          
          <button 
            onClick={() => handleImportClick('CSV')}
            className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-sky-200 transition-all group"
          >
            <FileCode className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600">CSV</span>
          </button>
          
          <button 
            onClick={() => handleImportClick('PDF')}
            className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-sky-200 transition-all group"
          >
            <FileText className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600">PDF</span>
          </button>
          
          <button 
            onClick={() => handleImportClick('JSON')}
            className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-sky-200 transition-all group"
          >
            <FileJson className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600">JSON</span>
          </button>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-sky-500" />
          Backup e Segurança
        </h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Backup Manual do Sistema</p>
            <p className="text-xs text-slate-500 mt-1">
              Baixe uma cópia completa de todos os seus dados (pacientes, histórico e configurações) em formato JSON. 
              Recomendamos realizar este procedimento semanalmente.
            </p>
          </div>
          <button 
            onClick={handleBackup}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Realizar Backup Agora
          </button>
        </div>
      </div>
    </div>
  );
}
