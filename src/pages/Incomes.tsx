import React, { useState } from 'react';
import Layout from '../components/Layout';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';

const Incomes: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rendimentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Registre e gerencie as fontes de renda da família</p>
        </div>

        <IncomeForm onSuccess={handleSuccess} />
        <IncomeList key={refreshKey} />
      </div>
    </Layout>
  );
};

export default Incomes;
