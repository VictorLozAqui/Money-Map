import React, { useState } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import Layout from '../components/Layout';
import { Users, Copy, Check, Calendar, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Family: React.FC = () => {
  const { family, familyMembers } = useFamily();
  const [copied, setCopied] = useState(false);

  const copyFamilyId = () => {
    if (family?.id) {
      navigator.clipboard.writeText(family.id);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!family) {
    return (
      <Layout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Você não está em nenhuma família
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Crie uma nova família ou entre em uma existente para começar
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{family.nome}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Criada em {family.createdAt.toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-6 py-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Membros</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{familyMembers.length}</p>
            </div>
          </div>
        </div>

        {/* Código da Família */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Convidar Membros
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Compartilhe este código com outras pessoas para que entrem na família
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Código de Convite
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono break-all text-gray-900 dark:text-white">
                {family.id}
              </code>
              <button
                onClick={copyFamilyId}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Copiar código"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Membros da Família
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {familyMembers.length} {familyMembers.length === 1 ? 'pessoa' : 'pessoas'} na família
            </p>
          </div>
          
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div
                key={member.uid}
                className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {member.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{member.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  {member.uid === family.createdBy && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium rounded">
                      Criador
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Family;

