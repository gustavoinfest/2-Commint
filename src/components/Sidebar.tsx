import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  DollarSign, 
  Plus, 
  Activity 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activePage: string;
  setPage: (page: string) => void;
  clinicName: string;
}

export function Sidebar({ activePage, setPage, clinicName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-sky-500 p-1.5 rounded-lg">
          <Plus className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <span className="text-xl font-bold text-slate-800">{clinicName}</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sky-50 text-sky-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
