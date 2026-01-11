import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useFamily } from '../contexts/FamilyContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Income, Expense } from '../types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter, Calendar, Tag, TrendingUp, TrendingDown, DollarSign, User } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExpensePieChart3D from '../components/charts/ExpensePieChart3D';
import FinancialLineChart3D from '../components/charts/FinancialLineChart3D';

const Reports: React.FC = () => {
  const { family, familyMembers } = useFamily();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [compareMonths, setCompareMonths] = useState(3);

  const parseDateInput = (value: string, endOfDay = false) => {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;

    return endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }

    const incomesQuery = query(
      collection(db, 'incomes'),
      where('familyId', '==', family.id)
    );

    const unsubscribeIncomes = onSnapshot(incomesQuery, (snapshot) => {
      const incomesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Income[];
      setIncomes(incomesData);
    });

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('familyId', '==', family.id)
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Expense[];
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, [family]);

  // Filtrar dados
  const rangeStart = parseDateInput(startDate) ?? startOfMonth(new Date());
  const rangeEnd = parseDateInput(endDate, true) ?? endOfMonth(new Date());
  const isValidRange = rangeStart <= rangeEnd;

  const filteredIncomes = incomes.filter(income => {
    const dateInRange = isValidRange && income.data >= rangeStart && income.data <= rangeEnd;
    return dateInRange;
  });

  const filteredExpenses = expenses.filter(expense => {
    const dateInRange = isValidRange && expense.data >= rangeStart && expense.data <= rangeEnd;
    const categoryMatch = !selectedCategory || expense.tipo === selectedCategory;
    const memberMatch = !selectedMember || expense.addedBy === selectedMember;
    return dateInRange && categoryMatch && memberMatch;
  });

  // Calcular métricas
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.valor, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.valor, 0);
  const balance = totalIncome - totalExpense;

  // Categorias únicas
  const categories = [...new Set(expenses.map(e => e.tipo))];

  // Comparativo mensal
  const monthsInterval = isValidRange
    ? eachMonthOfInterval({
      start: startOfMonth(rangeStart),
      end: startOfMonth(rangeEnd)
    })
    : [];

  const visibleMonths = monthsInterval.length > compareMonths
    ? monthsInterval.slice(monthsInterval.length - compareMonths)
    : monthsInterval;

  const monthlyComparison = visibleMonths.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthIncomes = filteredIncomes
      .filter(income => income.data >= monthStart && income.data <= monthEnd)
      .reduce((sum, i) => sum + i.valor, 0);

    const monthExpenses = filteredExpenses
      .filter(expense => expense.data >= monthStart && expense.data <= monthEnd)
      .reduce((sum, e) => sum + e.valor, 0);

    return {
      month: format(monthStart, 'MMM yyyy', { locale: ptBR }),
      rendimentos: monthIncomes,
      gastos: monthExpenses,
      saldo: monthIncomes - monthExpenses
    };
  });

  const sortedFilteredIncomes = [...filteredIncomes].sort(
    (a, b) => a.data.getTime() - b.data.getTime()
  );
  const sortedFilteredExpenses = [...filteredExpenses].sort(
    (a, b) => a.data.getTime() - b.data.getTime()
  );

  // Exportar para PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Relatório Financeiro - Money Map', 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Família: ${family?.nome}`, 14, 30);
      doc.text(`Período: ${format(rangeStart, 'dd/MM/yyyy')} - ${format(rangeEnd, 'dd/MM/yyyy')}`, 14, 37);
      
      let yPos = 37;
      if (selectedCategory) {
        yPos += 7;
        doc.text(`Categoria: ${selectedCategory}`, 14, yPos);
      }
      if (selectedMember) {
        yPos += 7;
        const memberName = familyMembers.find(m => m.uid === selectedMember)?.nome || 'Desconhecido';
        doc.text(`Membro: ${memberName}`, 14, yPos);
      }
      
      doc.setFontSize(14);
      doc.text('Resumo', 14, yPos + 13);
      
      autoTable(doc, {
        startY: yPos + 18,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Rendimentos', totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })],
          ['Total de Gastos', totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })],
          ['Saldo', balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })]
        ]
      });

      doc.text('Rendimentos', 14, (doc as any).lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Nome', 'Valor']],
        body: sortedFilteredIncomes.map(income => [
          format(income.data, 'dd/MM/yyyy'),
          income.nome,
          income.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ])
      });

      doc.text('Gastos', 14, (doc as any).lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Nome', 'Categoria', 'Valor']],
        body: sortedFilteredExpenses.map(expense => [
          format(expense.data, 'dd/MM/yyyy'),
          expense.nome,
          expense.tipo,
          expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ])
      });

      doc.save(`relatorio_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Exportar para Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Resumo
      const summaryData = [
        ['Família', family?.nome ?? ''],
        ['Período', `${format(rangeStart, 'dd/MM/yyyy')} - ${format(rangeEnd, 'dd/MM/yyyy')}`],
        [''],
        ['Métrica', 'Valor'],
        ['Total de Rendimentos', totalIncome],
        ['Total de Gastos', totalExpense],
        ['Saldo', balance]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');

      // Rendimentos
      const incomesData = [
        ['Data', 'Nome', 'Valor'],
        ...sortedFilteredIncomes.map(income => [
          format(income.data, 'dd/MM/yyyy'),
          income.nome,
          income.valor
        ])
      ];
      const incomesWs = XLSX.utils.aoa_to_sheet(incomesData);
      XLSX.utils.book_append_sheet(wb, incomesWs, 'Rendimentos');

      // Gastos
      const expensesData = [
        ['Data', 'Nome', 'Categoria', 'Valor'],
        ...sortedFilteredExpenses.map(expense => [
          format(expense.data, 'dd/MM/yyyy'),
          expense.nome,
          expense.tipo,
          expense.valor
        ])
      ];
      const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);
      XLSX.utils.book_append_sheet(wb, expensesWs, 'Gastos');

      // Comparativo Mensal
      const comparisonData = [
        ['Mês', 'Rendimentos', 'Gastos', 'Saldo'],
        ...monthlyComparison.map(m => [m.month, m.rendimentos, m.gastos, m.saldo])
      ];
      const comparisonWs = XLSX.utils.aoa_to_sheet(comparisonData);
      XLSX.utils.book_append_sheet(wb, comparisonWs, 'Comparativo');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `relatorio_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar Excel');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros Avançados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Membro
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-colors"
              >
                <option value="">Todos</option>
                {familyMembers.map(member => (
                  <option key={member.uid} value={member.uid}>{member.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 font-medium">Rendimentos</p>
              <TrendingUp className="w-6 h-6 text-green-100" />
            </div>
            <p className="text-3xl font-bold">{totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-green-100 mt-1">{filteredIncomes.length} transações</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-red-100 font-medium">Gastos</p>
              <TrendingDown className="w-6 h-6 text-red-100" />
            </div>
            <p className="text-3xl font-bold">{totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-red-100 mt-1">{filteredExpenses.length} transações</p>
          </div>

          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/90 font-medium">Saldo</p>
              <DollarSign className="w-6 h-6 text-white/90" />
            </div>
            <p className="text-3xl font-bold">{balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-white/90 mt-1">{balance >= 0 ? 'Positivo' : 'Negativo'}</p>
          </div>
        </div>

        {/* Comparativo Mensal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comparativo Mensal</h2>
            <select
              value={compareMonths}
              onChange={(e) => setCompareMonths(Number(e.target.value))}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Mês</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Rendimentos</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Gastos</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {monthlyComparison.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{month.month}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                      {month.rendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                      {month.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${month.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {month.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gastos por Categoria</h2>
            <ExpensePieChart3D expenses={filteredExpenses} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Evolução Financeira</h2>
            <FinancialLineChart3D incomes={filteredIncomes} expenses={filteredExpenses} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

