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

