import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-900 lg:hidden mr-4 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Money Map
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{userData?.nome}</p>
            <p className="text-xs text-gray-600">{userData?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
