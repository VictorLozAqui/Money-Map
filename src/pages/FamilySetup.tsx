import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, Copy, Check, Wallet } from 'lucide-react';

const FamilySetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createFamily, joinFamily, family } = useFamily();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      toast.error('Digite um nome para a família');
      return;
    }

    setLoading(true);
    try {
      await createFamily(familyName);
      toast.success('Família criada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar família');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyCode.trim()) {
      toast.error('Digite o código da família');
      return;
    }

    setLoading(true);
    try {
      await joinFamily(familyCode);
      toast.success('Você entrou na família!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.message === 'Família não encontrada') {
        toast.error('Código inválido ou família não encontrada');
      } else {
        toast.error('Erro ao entrar na família');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyFamilyId = () => {
    if (family?.id) {
      navigator.clipboard.writeText(family.id);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Se já tem família, mostra o código
  if (userData?.familyId && family) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sua Família
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{family.nome}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Código da Família
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Compartilhe este código com outros membros da família
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono break-all text-gray-900 dark:text-white">
                {family.id}
              </code>
              <button
                onClick={copyFamilyId}
                className={`p-3 rounded-lg font-medium transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-8 py-12 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-lg mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Núcleo Familiar
          </h1>
          <p className="text-blue-100">
            {isCreating ? 'Crie um novo núcleo familiar' : 'Entre em uma família existente'}
          </p>
        </div>

        <div className="px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors ${
                isCreating
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Criar Família
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-colors ${
                !isCreating
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Entrar em Família
            </button>
          </div>

          {isCreating ? (
            <form onSubmit={handleCreateFamily} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Nome da Família
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors outline-none"
                  placeholder="Ex: Família Silva"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  'Criar Família'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Código da Família
                </label>
                <input
                  type="text"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors outline-none"
                  placeholder="Cole o código aqui"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Peça o código para um membro da família
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  'Entrar na Família'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilySetup;
