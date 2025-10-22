import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { SavingsGoal, Income, Expense } from '../types';
import toast from 'react-hot-toast';
import { Target, TrendingUp, TrendingDown, CheckCircle, XCircle, Edit, Save } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

const SavingsGoalPage: React.FC = () => {
  const { family } = useFamily();
  const { currentUser } = useAuth();
  const [currentGoal, setCurrentGoal] = useState<SavingsGoal | null>(null);
  const [newGoalValue, setNewGoalValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [monthIncomes, setMonthIncomes] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Carregar meta do mês atual
  useEffect(() => {
    if (!family) return;

    const q = query(
      collection(db, 'savingsGoals'),
      where('familyId', '==', family.id),
      where('mes', '==', currentMonth),
      where('ano', '==', currentYear)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const goalData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
          createdAt: snapshot.docs[0].data().createdAt.toDate()
        } as SavingsGoal;
        setCurrentGoal(goalData);
      } else {
        setCurrentGoal(null);
      }
    });

    return () => unsubscribe();
  }, [family, currentMonth, currentYear]);

  // Carregar rendimentos e gastos do mês
  useEffect(() => {
    if (!family) return;

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Carregar rendimentos
    const incomesQuery = query(
      collection(db, 'incomes'),
      where('familyId', '==', family.id)
    );

    const unsubscribeIncomes = onSnapshot(incomesQuery, (snapshot) => {
      const total = snapshot.docs
        .map(doc => ({ ...doc.data(), data: doc.data().data.toDate() }))
        .filter((inc: any) => inc.data >= monthStart && inc.data <= monthEnd)
        .reduce((sum: number, inc: any) => sum + inc.valor, 0);
      setMonthIncomes(total);
    });

    // Carregar gastos
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('familyId', '==', family.id)
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const total = snapshot.docs
        .map(doc => ({ ...doc.data(), data: doc.data().data.toDate() }))
        .filter((exp: any) => exp.data >= monthStart && exp.data <= monthEnd)
        .reduce((sum: number, exp: any) => sum + exp.valor, 0);
      setMonthExpenses(total);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, [family]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !family) {
      toast.error('Você precisa estar em uma família');
      return;
    }

    if (!newGoalValue) {
      toast.error('Digite um valor para a meta');
      return;
    }

    const valor = parseFloat(newGoalValue);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'savingsGoals'), {
        familyId: family.id,
        valor: valor,
        mes: currentMonth,
        ano: currentYear,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now()
      });

      toast.success('Meta criada com sucesso!');
      setNewGoalValue('');
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar meta');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentGoal) return;

    if (!newGoalValue) {
      toast.error('Digite um valor para a meta');
      return;
    }

    const valor = parseFloat(newGoalValue);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'savingsGoals', currentGoal.id), {
        valor: valor
      });

      toast.success('Meta atualizada com sucesso!');
      setNewGoalValue('');
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar meta');
    } finally {
      setLoading(false);
    }
  };

  const monthSavings = monthIncomes - monthExpenses;
  const goalAchieved = currentGoal ? monthSavings >= currentGoal.valor : false;
  const progressPercentage = currentGoal ? Math.min((monthSavings / currentGoal.valor) * 100, 100) : 0;

  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meta de Poupança</h1>
          <p className="text-gray-600 dark:text-gray-400">Acompanhe o progresso da sua meta mensal de economia</p>
        </div>

        {/* Resumo do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rendimentos ({monthName})</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {monthIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos ({monthName})</p>
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {monthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Poupança ({monthName})</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className={`text-3xl font-bold ${monthSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {monthSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {!currentGoal && !editing ? (
            <div className="text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Defina sua meta de poupança
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Estabeleça uma meta mensal para economizar e acompanhe seu progresso
              </p>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Criar Meta
              </button>
            </div>
          ) : editing ? (
            <form onSubmit={currentGoal ? handleUpdateGoal : handleCreateGoal} className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentGoal ? 'Editar Meta' : 'Nova Meta'} - {monthName}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Valor da Meta de Poupança
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors outline-none"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (currentGoal ? 'Atualizar' : 'Criar Meta')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setNewGoalValue('');
                  }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : currentGoal ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Meta de {monthName}
                </h2>
                <button
                  onClick={() => {
                    setNewGoalValue(currentGoal.valor.toString());
                    setEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </div>

              {/* Progresso */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Progresso</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      goalAchieved ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Meta</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentGoal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Poupado</p>
                  <p className={`text-2xl font-bold ${monthSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {monthSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Resultado */}
              <div className={`rounded-lg p-6 text-center border-2 ${
                goalAchieved 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                {goalAchieved ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                      Meta Atingida!
                    </h3>
                    <p className="text-green-800 dark:text-green-200">
                      Parabéns! Você conseguiu poupar {monthSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês.
                    </p>
                  </>
                ) : (
                  <>
                    <Target className="w-16 h-16 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                      Continue Economizando
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200">
                      Faltam {(currentGoal.valor - monthSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir sua meta.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default SavingsGoalPage;

