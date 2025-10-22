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
import { format } from 'date-fns';
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
      
      setIncomes(incomesData);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center">Carregando...</p>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Adicionado por
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {income.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-bold">
                      +{income.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(income.data, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
    </>
  );
};

export default IncomeList;
