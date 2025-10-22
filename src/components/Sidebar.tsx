import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  UserCircle,
  Target,
  X
} from 'lucide-react';
import { useFamily } from '../contexts/FamilyContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { family } = useFamily();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rendimentos', icon: TrendingUp, label: 'Rendimentos' },
    { to: '/gastos', icon: TrendingDown, label: 'Gastos' },
    { to: '/meta', icon: Target, label: 'Meta de Poupança' },
    { to: '/familia', icon: Users, label: 'Família' },
    { to: '/perfil', icon: UserCircle, label: 'Perfil' },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {family?.nome || 'Sem Família'}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">Controle Financeiro</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-medium">
              © 2025 Money Map
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
