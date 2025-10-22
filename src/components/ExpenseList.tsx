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
import { Expense } from '../types';
import toast from 'react-hot-toast';
import { Trash2, Calendar, Tag, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpenseEditModal from './ExpenseEditModal';

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { family, familyMembers } = useFamily();

  useEffect(() => {
    if (!family) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'expenses'),
      where('familyId', '==', family.id),
      orderBy('data', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Expense[];
      
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [family]);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      toast.success('Gasto excluído!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir gasto');
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

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center">
          Nenhum gasto cadastrado ainda
        </p>
      </div>
    );
  }

  return (
    <>
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => setEditingExpense(null)}
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
                  Categoria
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
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {expense.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      {expense.tipo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600 font-bold">
                      -{expense.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(expense.data, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getMemberName(expense.addedBy)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
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

export default ExpenseList;
