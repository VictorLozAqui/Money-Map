import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { useCategories } from '../contexts/CategoryContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<string>(categories[0] || 'Outros');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { family } = useFamily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !family) {
      toast.error('Você precisa estar em uma família');
      return;
    }

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
      // Adiciona o gasto normal
      await addDoc(collection(db, 'expenses'), {
        familyId: family.id,
        nome: nome,
        valor: valorNumerico,
        tipo: tipo,
        data: Timestamp.fromDate(new Date(data)),
        addedBy: currentUser.uid,
        createdAt: Timestamp.now()
      });

      // Se for gasto fixo, cria também o gasto recorrente
      if (isRecurring) {
        const diaDoMes = new Date(data).getDate();
        const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        
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

      toast.success(isRecurring ? 'Gasto fixo adicionado!' : 'Gasto adicionado!');
      setNome('');
      setValor('');
      setTipo(categories[0] || 'Outros');
      setData(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar gasto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Adicionar Gasto
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Novo Gasto
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Nome do Gasto
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white transition-colors outline-none"
            placeholder="Ex: Supermercado, Conta de luz..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white transition-colors outline-none"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white transition-colors outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Categoria
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white transition-colors outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="isRecurring" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
            Marcar como <strong>Gasto Fixo</strong> (será repetido automaticamente todo mês no dia {new Date(data).getDate()})
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
