import React, { useState } from 'react';
import Layout from '../components/Layout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Expenses: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gastos</h1>
          <p className="text-gray-600">Registre e gerencie os gastos da família</p>
        </div>

        <ExpenseForm onSuccess={handleSuccess} />
        <ExpenseList key={refreshKey} />
      </div>
    </Layout>
  );
};

export default Expenses;
