import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import ExpensePieChart3D from '../components/charts/ExpensePieChart3D';
import FinancialLineChart3D from '../components/charts/FinancialLineChart3D';
import { useFamily } from '../contexts/FamilyContext';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Income, Expense } from '../types';
import { TrendingUp, TrendingDown, Wallet, Repeat } from 'lucide-react';
import { useExpenseNotifications } from '../hooks/useExpenseNotifications';
import { useRecurringExpensesProcessor } from '../hooks/useRecurringExpensesProcessor';
import { useRecurringIncomesProcessor } from '../hooks/useRecurringIncomesProcessor';
import { startOfMonth, endOfMonth } from 'date-fns';

const Dashboard: React.FC = () => {
  const { family } = useFamily();
  
  // Processa gastos e rendimentos recorrentes automaticamente
  useRecurringExpensesProcessor();
  useRecurringIncomesProcessor();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyLimit: 0,
    monthlyLimit: 0,
    singleExpenseLimit: 0
  });

  // Hook de notificações
  useExpenseNotifications(expenses, notificationSettings);

  // Separar gastos fixos mensais e anuais
  const monthlyRecurringExpenses = recurringExpenses.filter((re: any) => 
    re.frequencia === 'mensal' || !re.frequencia // Compatibilidade com gastos antigos
  );
  const annualRecurringExpenses = recurringExpenses.filter((re: any) => 
    re.frequencia === 'anual'
  );

  // Calcular previsão de gastos fixos mensais
  const predictedMonthlyExpenses = monthlyRecurringExpenses.reduce((sum, re: any) => sum + re.valor, 0);
  const predictedAnnualExpenses = annualRecurringExpenses.reduce((sum, re: any) => sum + re.valor, 0);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }

    // Carregar configurações de notificação
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', family.id));
        if (settingsDoc.exists()) {
          setNotificationSettings(settingsDoc.data() as any);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();

    // Listener para rendimentos
    const incomesQuery = query(
      collection(db, 'incomes'),
      where('familyId', '==', family.id)
    );

    const unsubscribeIncomes = onSnapshot(incomesQuery, (snapshot) => {
      const incomesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Income[];
      
      // Filtrar apenas rendimentos do mês atual
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const currentMonthIncomes = incomesData.filter(income => 
        income.data >= monthStart && income.data <= monthEnd
      );
      
      setIncomes(currentMonthIncomes);
    });

    // Listener para gastos
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('familyId', '==', family.id)
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Expense[];
      
      // Filtrar apenas gastos do mês atual
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const currentMonthExpenses = expensesData.filter(expense => 
        expense.data >= monthStart && expense.data <= monthEnd
      );
      
      setExpenses(currentMonthExpenses);
      setLoading(false);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, [family]);

  // Carregar gastos recorrentes para previsão
  useEffect(() => {
    if (!family) {
      setRecurringExpenses([]);
      return;
    }

    const q = query(
      collection(db, 'recurringExpenses'),
      where('familyId', '==', family.id),
      where('active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recurring = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecurringExpenses(recurring);
    });

    return () => unsubscribe();
  }, [family]);

  // Calcula métricas
  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.valor, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.valor, 0);
  const balance = totalIncomes - totalExpenses;

  if (!family) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700">
              Você precisa criar ou entrar em uma família para usar o dashboard.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500 text-center">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Visão geral das suas finanças</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Total de Rendimentos"
            value={totalIncomes}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Total de Gastos"
            value={totalExpenses}
            icon={TrendingDown}
            color="red"
          />
          <MetricCard
            title="Saldo"
            value={balance}
            icon={Wallet}
            color="blue"
          />
        </div>

        {/* Previsão de Gastos Fixos */}
        {recurringExpenses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Repeat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Previsão de Gastos Fixos</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Baseado em {recurringExpenses.length} gasto(s) fixo(s)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Gastos Fixos Mensais</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{predictedMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{monthlyRecurringExpenses.length} gasto(s)</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Gastos Fixos Anuais</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{predictedAnnualExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{annualRecurringExpenses.length} gasto(s)</p>
              </div>
            </div>

            {monthlyRecurringExpenses.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Próximos gastos fixos mensais:</p>
                <div className="space-y-2">
                  {monthlyRecurringExpenses.map((re: any) => (
                    <div key={re.id} className="flex items-center justify-between text-sm py-2 border-b border-blue-100 dark:border-blue-900/30 last:border-0">
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300">{re.nome} - Dia {re.diaDoMes}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({re.tipo})</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{re.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {annualRecurringExpenses.length > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Próximos gastos fixos anuais:</p>
                <div className="space-y-2">
                  {annualRecurringExpenses.map((re: any) => (
                    <div key={re.id} className="flex items-center justify-between text-sm py-2 border-b border-purple-100 dark:border-purple-900/30 last:border-0">
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300">{re.nome} - Dia {re.diaDoMes}/{re.mesDoAno || 1}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({re.tipo})</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{re.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Gastos por Categoria
            </h2>
            <ExpensePieChart3D expenses={expenses} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Evolução Financeira (Mês Atual)
            </h2>
            <FinancialLineChart3D incomes={incomes} expenses={expenses} />
          </div>
        </div>

        {/* Resumo recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Últimos Rendimentos
            </h2>
            {incomes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum rendimento cadastrado</p>
            ) : (
              <div className="space-y-2">
                {incomes.slice(0, 5).map(income => (
                  <div key={income.id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <span className="text-gray-900 dark:text-white font-medium">{income.nome}</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      +{income.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Últimos Gastos
            </h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum gasto cadastrado</p>
            ) : (
              <div className="space-y-2">
                {expenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">{expense.nome}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({expense.tipo})</span>
                    </div>
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      -{expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

