import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useFamily } from '../contexts/FamilyContext';
import { useCategories } from '../contexts/CategoryContext';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Settings as SettingsIcon, Bell, Tag, Plus, Trash2, Save, Repeat, Edit2 } from 'lucide-react';
import { RecurringExpense } from '../types';
import toast from 'react-hot-toast';

interface NotificationSettings {
  dailyLimit: number;
  monthlyLimit: number;
  singleExpenseLimit: number;
  categoryLimits: Record<string, number>;
}

const Settings: React.FC = () => {
  const { family } = useFamily();
  const { categories, customCategories, addCategory, deleteCategory } = useCategories();
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dailyLimit: 0,
    monthlyLimit: 0,
    singleExpenseLimit: 0,
    categoryLimits: {}
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', family.id));
        if (settingsDoc.exists()) {
          setNotificationSettings(settingsDoc.data() as NotificationSettings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [family]);

  // Carregar gastos recorrentes
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
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as RecurringExpense[];
      setRecurringExpenses(recurring);
    });

    return () => unsubscribe();
  }, [family]);

  const handleSaveNotifications = async () => {
    if (!family) return;

    try {
      await setDoc(doc(db, 'settings', family.id), notificationSettings);
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error('Esta categoria já existe');
      return;
    }

    await addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      await updateDoc(doc(db, 'recurringExpenses', id), {
        active: false
      });
      toast.success('Gasto fixo removido!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover gasto fixo');
    }
  };

  const handleUpdateRecurring = async (recurring: RecurringExpense) => {
    try {
      await updateDoc(doc(db, 'recurringExpenses', recurring.id), {
        nome: recurring.nome,
        valor: recurring.valor,
        tipo: recurring.tipo,
        diaDoMes: recurring.diaDoMes
      });
      toast.success('Gasto fixo atualizado!');
      setEditingRecurring(null);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar gasto fixo');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Gerencie notificações e categorias personalizadas</p>
        </div>

        {/* Notificações */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notificações de Gastos</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Limite Diário
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Receba uma notificação quando os gastos do dia ultrapassarem este valor
              </p>
              <input
                type="number"
                value={notificationSettings.dailyLimit || ''}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  dailyLimit: Number(e.target.value)
                })}
                placeholder="0.00"
                className="w-full md:w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Limite Mensal
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Receba uma notificação quando os gastos mensais ultrapassarem este valor
              </p>
              <input
                type="number"
                value={notificationSettings.monthlyLimit || ''}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  monthlyLimit: Number(e.target.value)
                })}
                placeholder="0.00"
                className="w-full md:w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Limite para Gasto Individual
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Receba uma notificação quando um gasto individual ultrapassar este valor
              </p>
              <input
                type="number"
                value={notificationSettings.singleExpenseLimit || ''}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  singleExpenseLimit: Number(e.target.value)
                })}
                placeholder="0.00"
                className="w-full md:w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Limites por Categoria
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Defina limites mensais para cada categoria de gasto
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(category => (
                  <div key={category} className="flex items-center gap-3">
                    <label className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                      {category}
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.categoryLimits[category] || ''}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        categoryLimits: {
                          ...notificationSettings.categoryLimits,
                          [category]: Number(e.target.value)
                        }
                      })}
                      placeholder="0.00"
                      className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-semibold"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Categorias Customizadas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categorias Customizadas</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Nova categoria..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md font-semibold"
              >
                <Plus className="w-5 h-5" />
                Adicionar
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categorias Padrão</h3>
              <div className="flex flex-wrap gap-2">
                {['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros'].map(cat => (
                  <span
                    key={cat}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {customCategories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Suas Categorias</h3>
                <div className="space-y-2">
                  {customCategories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white font-medium">{cat.name}</span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gastos Fixos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Repeat className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gastos Fixos</h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Gastos que se repetem automaticamente todo mês. Adicione um gasto fixo ao criar um novo gasto e marcando a opção "Gasto Fixo".
          </p>

          {recurringExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum gasto fixo registrado
            </div>
          ) : (
            <div className="space-y-3">
              {recurringExpenses.map(recurring => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between px-5 py-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-gray-900 dark:text-white font-semibold">{recurring.nome}</h4>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        {recurring.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {recurring.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Todo dia {recurring.diaDoMes} do mês
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRecurring(recurring)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar gasto fixo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecurring(recurring.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remover gasto fixo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Edição */}
          {editingRecurring && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Editar Gasto Fixo
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={editingRecurring.nome}
                      onChange={(e) => setEditingRecurring({ ...editingRecurring, nome: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Valor
                    </label>
                    <input
                      type="number"
                      value={editingRecurring.valor}
                      onChange={(e) => setEditingRecurring({ ...editingRecurring, valor: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Categoria
                    </label>
                    <select
                      value={editingRecurring.tipo}
                      onChange={(e) => setEditingRecurring({ ...editingRecurring, tipo: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Dia do Mês (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editingRecurring.diaDoMes}
                      onChange={(e) => setEditingRecurring({ ...editingRecurring, diaDoMes: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleUpdateRecurring(editingRecurring)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingRecurring(null)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

