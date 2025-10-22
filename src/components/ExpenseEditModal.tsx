import React, { useState } from 'react';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Expense } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseEditModalProps {
  expense: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({ expense, onClose, onSuccess }) => {
  const { categories } = useCategories();
  const { family } = useFamily();
  const { currentUser } = useAuth();
  const [nome, setNome] = useState(expense.nome);
  const [valor, setValor] = useState(expense.valor.toString());
  const [tipo, setTipo] = useState<string>(expense.tipo);
  const [data, setData] = useState(format(expense.data, 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !valor || !tipo) {
      toast.error('Preencha todos os campos');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    setLoading(true);
    try {
      // Atualiza o gasto
      await updateDoc(doc(db, 'expenses', expense.id), {
        nome: nome,
        valor: valorNumerico,
        tipo: tipo,
        data: new Date(data)
      });

      // Se marcou como gasto fixo, cria o gasto recorrente
      if (isRecurring && family && currentUser) {
        const diaDoMes = new Date(data).getDate();
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        await addDoc(collection(db, 'recurringExpenses'), {
          familyId: family.id,
          nome: nome,
          valor: valorNumerico,
          tipo: tipo,
          diaDoMes: diaDoMes,
          createdBy: currentUser.uid,
          createdAt: Timestamp.now(),
          active: true,
          lastProcessedMonth: currentMonth
        });
      }

      toast.success(isRecurring ? 'Gasto atualizado e marcado como fixo!' : 'Gasto atualizado!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Editar Gasto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Gasto
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
            <input
              type="checkbox"
              id="isRecurringEdit"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isRecurringEdit" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Marcar como <strong>Gasto Fixo</strong> (será repetido automaticamente todo mês no dia {new Date(data).getDate()})
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseEditModal;

