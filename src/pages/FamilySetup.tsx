import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, Copy, Check } from 'lucide-react';

const FamilySetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createFamily, joinFamily, family } = useFamily();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const alreadyInFamily = Boolean(userData?.familyId && family);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyName.trim()) {
      toast.error('Digite um nome para a familia');
      return;
    }

    setLoading(true);
    try {
      await createFamily(familyName);
      toast.success('Familia criada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar familia');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyCode.trim()) {
      toast.error('Digite o codigo da familia');
      return;
    }

    setLoading(true);
    try {
      await joinFamily(familyCode);
      toast.success('Voce entrou na familia!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.message === 'Familia nao encontrada') {
        toast.error('Codigo invalido ou familia nao encontrada');
      } else {
        toast.error('Erro ao entrar na familia');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyFamilyId = () => {
    if (family?.id) {
      navigator.clipboard.writeText(family.id);
      setCopied(true);
      toast.success('Codigo copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.06),transparent_20%)]" />

      <div className="relative w-full max-w-4xl flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md w-full max-w-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-semibold">
                Money Map
              </p>
              <h1 className="text-2xl font-bold text-white mt-1">
                {alreadyInFamily ? 'Sua Familia' : 'Nucleo Familiar'}
              </h1>
              <p className="text-slate-200 text-sm mt-2">
                {alreadyInFamily
                  ? 'Compartilhe o codigo com quem voce confia'
                  : isCreating
                  ? 'Crie um novo nucleo familiar'
                  : 'Entre em uma familia existente'}
              </p>
            </div>
          </div>

          {alreadyInFamily ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-500/15 border border-cyan-400/30">
                    <Users className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Familia atual</p>
                    <h3 className="text-xl font-semibold text-white">{family?.nome}</h3>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-200">
                    Use o codigo abaixo para convidar outros membros.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <code className="flex-1 px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm font-mono break-all text-white">
                      {family?.id}
                    </code>
                    <button
                      onClick={copyFamilyId}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors border border-white/10 ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3.5 rounded-lg font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-colors"
              >
                Ir para Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setIsCreating(true)}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                    isCreating
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Criar Familia
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                    !isCreating
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Entrar em Familia
                </button>
              </div>

              {isCreating ? (
                <form onSubmit={handleCreateFamily} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Nome da Familia
                    </label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-slate-400 transition-colors outline-none"
                      placeholder="Ex: Familia Silva"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3.5 rounded-lg font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Criando...
                      </>
                    ) : (
                      'Criar Familia'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinFamily} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Codigo da Familia
                    </label>
                    <input
                      type="text"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-slate-400 transition-colors outline-none"
                      placeholder="Cole o codigo aqui"
                    />
                    <p className="text-xs text-slate-300 mt-2">
                      Peca o codigo para um membro da familia
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3.5 rounded-lg font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Entrando...
                      </>
                    ) : (
                      'Entrar na Familia'
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilySetup;
