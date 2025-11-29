import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const slides = [
  { src: '/Dash.png', alt: 'Dashboard' },
  { src: '/rendi.png', alt: 'Rendimentos' },
  { src: '/gast.png', alt: 'Gastos' },
  { src: '/meta.png', alt: 'Meta de Poupança' },
  { src: '/rela.png', alt: 'Relatórios' },
  { src: '/config.png', alt: 'Configurações' },
  { src: '/fami.png', alt: 'Família' },
  { src: '/perfi.png', alt: 'Perfil' }
];

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login, signup, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        if (!nome.trim()) {
          toast.error('Por favor, preencha seu nome');
          return;
        }
        await signup(email, password, nome);
        toast.success('Conta criada! Verifique seu email para ativar.');
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está em uso');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha deve ter pelo menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta');
      } else if (error.code === 'auth/email-not-verified') {
        toast.error('Confirme seu email. Reenviamos o link para você.');
      } else {
        toast.error(isLogin ? 'Erro ao fazer login' : 'Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Digite seu email para recuperar a senha');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      toast.error('Erro ao enviar email de recuperação');
    }
  };

  const goToSlide = (direction: 'next' | 'prev') => {
    setCurrentSlide((prev) => {
      if (direction === 'next') return (prev + 1) % slides.length;
      return (prev - 1 + slides.length) % slides.length;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-12">
      {/* Background accents */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.06),transparent_20%)]" />

      <div className="relative w-full max-w-4xl flex flex-col items-center gap-8 sm:gap-10">
        {/* Pitch / hero */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur text-sm font-semibold text-cyan-200">
            Money Map
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Descubra por onde anda seu dinheiro
            </h1>
            <p className="text-slate-200 text-lg leading-relaxed max-w-xl mx-auto">
              Acompanhe seus gastos, renda e metas em um painel claro, com gráficos que ajudam a enxergar tendências e manter o controle do mês.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200">Controle de gastos</span>
            <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200">Gráficos claros</span>
            <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200">Metas de poupança</span>
          </div>
        </div>

        {/* Carousel de screenshots */}
        <div className="w-full relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="relative aspect-video w-full bg-slate-950/40 border-b border-white/10">
            {slides.map((item, index) => (
              <div
                key={item.alt}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="max-h-full max-w-full object-contain border border-white/10 rounded-lg bg-slate-900/70 select-none"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="px-4 sm:px-6 py-3 bg-slate-900/70 text-sm text-slate-100 border-t border-white/10 flex items-center justify-center">
            {slides[currentSlide]?.alt}
          </div>
          <button
            type="button"
            onClick={() => goToSlide('prev')}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-white/15 p-2 text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Anterior"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => goToSlide('next')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-white/15 p-2 text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Próximo"
          >
            {'>'}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md w-full">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-semibold">
                Money Map
              </p>
              <h2 className="text-2xl font-bold text-white mt-1">
                {isLogin ? 'Entrar' : 'Criar conta'}
              </h2>
              <p className="text-slate-200 text-sm mt-2">
                {isLogin ? 'Acompanhe gastos, renda e metas em um só lugar' : 'Comece a acompanhar suas finanças'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-slate-400 transition-colors outline-none"
                  placeholder="Como quer ser chamado(a)?"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-slate-400 transition-colors outline-none"
                placeholder="seuemail@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-slate-400 transition-colors outline-none"
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3.5 rounded-lg font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Carregando...
                </>
              ) : (
                <>{isLogin ? 'Entrar' : 'Criar Conta'}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-200">
            <p className="text-sm">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
