import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import FinancialLineChart from '../components/charts/FinancialLineChart';
import { useFamily } from '../contexts/FamilyContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Income, Expense } from '../types';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { family } = useFamily();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }

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
      setIncomes(incomesData);
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
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas finanças</p>
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

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Gastos por Categoria
            </h2>
            <ExpensePieChart expenses={expenses} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Evolução Financeira (Últimos 6 meses)
            </h2>
            <FinancialLineChart incomes={incomes} expenses={expenses} months={6} />
          </div>
        </div>

        {/* Resumo recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Últimos Rendimentos
            </h2>
            {incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum rendimento cadastrado</p>
            ) : (
              <div className="space-y-2">
                {incomes.slice(0, 5).map(income => (
                  <div key={income.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                    <span className="text-gray-900 font-medium">{income.nome}</span>
                    <span className="text-green-600 font-semibold">
                      +{income.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Últimos Gastos
            </h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum gasto cadastrado</p>
            ) : (
              <div className="space-y-2">
                {expenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <span className="text-gray-900 font-medium">{expense.nome}</span>
                      <span className="text-xs text-gray-500 ml-2">({expense.tipo})</span>
                    </div>
                    <span className="text-red-600 font-semibold">
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

