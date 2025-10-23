export interface User {
  uid: string;
  email: string;
  nome: string;
  familyId?: string;
}

export interface Family {
  id: string;
  nome: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
}

export interface Income {
  id: string;
  familyId: string;
  nome: string;
  valor: number;
  data: Date;
  addedBy: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  familyId: string;
  nome: string;
  valor: number;
  tipo: string;
  data: Date;
  addedBy: string;
  createdAt: Date;
}

export interface SavingsGoal {
  id: string;
  familyId: string;
  valor: number;
  mes: number;
  ano: number;
  createdBy: string;
  createdAt: Date;
}

export interface RecurringExpense {
  id: string;
  familyId: string;
  nome: string;
  valor: number;
  tipo: string;
  diaDoMes: number; // Dia do mês em que o gasto deve ser lançado (1-31)
  mesDoAno?: number; // Mês do ano para gastos anuais (1-12)
  frequencia: 'mensal' | 'anual'; // Frequência do gasto recorrente
  createdBy: string;
  createdAt: Date;
  active: boolean; // Se o gasto recorrente está ativo
  lastProcessedMonth?: string; // "YYYY-MM" para controlar se já foi processado no mês
  lastProcessedYear?: number; // Ano do último processamento para gastos anuais
}

export interface RecurringIncome {
  id: string;
  familyId: string;
  nome: string;
  valor: number;
  diaDoMes: number; // Dia do mês em que o rendimento deve ser lançado (1-31)
  mesDoAno?: number; // Mês do ano para rendimentos anuais (1-12)
  frequencia: 'mensal' | 'anual'; // Frequência do rendimento recorrente
  createdBy: string;
  createdAt: Date;
  active: boolean; // Se o rendimento recorrente está ativo
  lastProcessedMonth?: string; // "YYYY-MM" para controlar se já foi processado no mês
  lastProcessedYear?: number; // Ano do último processamento para rendimentos anuais
}

export const ExpenseCategories = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Moradia',
  'Vestuário',
  'Serviços',
  'Outros'
] as const;

export type ExpenseCategory = typeof ExpenseCategories[number];

