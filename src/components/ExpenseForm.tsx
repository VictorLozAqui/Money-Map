import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { ExpenseCategories } from '../types';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<string>(ExpenseCategories[0]);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
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
      await addDoc(collection(db, 'expenses'), {
        familyId: family.id,
        nome: nome,
        valor: valorNumerico,
        tipo: tipo,
        data: Timestamp.fromDate(new Date(data)),
        addedBy: currentUser.uid,
        createdAt: Timestamp.now()
      });

      toast.success('Gasto adicionado!');
      setNome('');
      setValor('');
      setTipo(ExpenseCategories[0]);
      setData(new Date().toISOString().split('T')[0]);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Novo Gasto
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nome do Gasto
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 transition-colors outline-none"
            placeholder="Ex: Supermercado, Conta de luz..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 transition-colors outline-none"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 transition-colors outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Categoria
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 transition-colors outline-none"
          >
            {ExpenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
