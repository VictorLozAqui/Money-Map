import React, { useState, useEffect } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Income } from '../types';
import toast from 'react-hot-toast';
import { Trash2, Calendar, Edit } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IncomeEditModal from './IncomeEditModal';

const IncomeList: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { family, familyMembers } = useFamily();

  useEffect(() => {
    if (!family) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'incomes'),
      where('familyId', '==', family.id),
      orderBy('data', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [family]);

  const handleDelete = async (incomeId: string) => {
    if (!confirm('Tem certeza que deseja excluir este rendimento?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'incomes', incomeId));
      toast.success('Rendimento excluído!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir rendimento');
    }
  };

  const getMemberName = (uid: string): string => {
    const member = familyMembers.find(m => m.uid === uid);
    return member?.nome || 'Desconhecido';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">Carregando...</p>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Nenhum rendimento cadastrado ainda
        </p>
      </div>
    );
  }

  return (
    <>
      {editingIncome && (
        <IncomeEditModal
          income={editingIncome}
          onClose={() => setEditingIncome(null)}
          onSuccess={() => setEditingIncome(null)}
        />
      )}
      
      {/* Layout Desktop - Tabela */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Adicionado por
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {incomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {income.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 dark:text-green-400 font-bold">
                      +{income.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(income.data, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {getMemberName(income.addedBy)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingIncome(income)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layout Mobile - Cards */}
      <div className="md:hidden space-y-3">
        {incomes.map((income) => (
          <div
            key={income.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {income.nome}
                </h3>
                <p className="text-lg text-green-600 dark:text-green-400 font-bold">
                  +{income.valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingIncome(income)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(income.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(income.data, "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div>
                {getMemberName(income.addedBy)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default IncomeList;
