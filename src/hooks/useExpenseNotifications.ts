import { useEffect, useRef } from 'react';
import { Expense } from '../types';
import toast from 'react-hot-toast';
import { startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseNotificationSettings {
  dailyLimit?: number;
  monthlyLimit?: number;
  singleExpenseLimit?: number;
  categoryLimits?: Record<string, number>;
}

export const useExpenseNotifications = (
  expenses: Expense[],
  settings: ExpenseNotificationSettings = {}
) => {
  const notifiedExpenses = useRef<Set<string>>(new Set());
  const lastMonthlyCheck = useRef<string>('');

  useEffect(() => {
    if (expenses.length === 0) return;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Filtrar gastos do mês atual
    const currentMonthExpenses = expenses.filter(
      expense => expense.data >= monthStart && expense.data <= monthEnd
    );

    // Calcular total mensal
    const monthlyTotal = currentMonthExpenses.reduce((sum, e) => sum + e.valor, 0);
    const monthKey = `${now.getMonth()}-${now.getFullYear()}`;

    // Notificação de limite mensal
    if (settings.monthlyLimit && monthlyTotal > settings.monthlyLimit) {
      if (lastMonthlyCheck.current !== monthKey) {
        toast.error(
          `⚠️ Atenção! Gastos mensais ultrapassaram o limite de ${settings.monthlyLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          { duration: 5000 }
        );
        lastMonthlyCheck.current = monthKey;
      }
    }

    // Notificação de gasto individual alto
    if (settings.singleExpenseLimit) {
      expenses.forEach(expense => {
        if (
          expense.valor > settings.singleExpenseLimit! &&
          !notifiedExpenses.current.has(expense.id)
        ) {
          toast(
            `💰 Gasto alto registrado: ${expense.nome} - ${expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            { duration: 4000, icon: '⚠️' }
          );
          notifiedExpenses.current.add(expense.id);
        }
      });
    }

    // Notificação de limite diário
    if (settings.dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.data);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === today.getTime();
      });

      const dailyTotal = todayExpenses.reduce((sum, e) => sum + e.valor, 0);

      if (dailyTotal > settings.dailyLimit) {
        const dailyKey = `daily-${today.toISOString().split('T')[0]}`;
        if (!notifiedExpenses.current.has(dailyKey)) {
          toast.error(
            `⚠️ Gastos de hoje ultrapassaram o limite diário de ${settings.dailyLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            { duration: 5000 }
          );
          notifiedExpenses.current.add(dailyKey);
        }
      }
    }

    // Notificação de limite por categoria
    if (settings.categoryLimits) {
      Object.entries(settings.categoryLimits).forEach(([category, limit]) => {
        if (limit > 0) {
          const categoryExpenses = currentMonthExpenses.filter(e => e.tipo === category);
          const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.valor, 0);

          if (categoryTotal > limit) {
            const categoryKey = `category-${category}-${monthKey}`;
            if (!notifiedExpenses.current.has(categoryKey)) {
              toast.error(
                `⚠️ Gastos em "${category}" ultrapassaram o limite mensal de ${limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                { duration: 5000 }
              );
              notifiedExpenses.current.add(categoryKey);
            }
          }
        }
      });
    }
  }, [expenses, settings]);
};

