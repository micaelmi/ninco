import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { startOfDay, endOfDay, eachDayOfInterval, format, startOfMonth, startOfWeek, endOfWeek, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

export async function getDashboardSummary(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/transactions/summary', {
    schema: {
      tags: ['transactions'],
      summary: 'Get dashboard summary data',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      querystring: z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
      response: {
        200: z.object({
          totalBalance: z.number(),
          income: z.number(),
          expense: z.number(),
          chartData: z.array(z.object({
            period: z.string(),
            income: z.number(),
            expense: z.number(),
          })),
          accounts: z.array(z.object({
            id: z.uuid(),
            name: z.string(),
            balance: z.number(),
            color: z.string(),
          })),
          categoryIncome: z.array(z.object({
            id: z.string(),
            name: z.string(),
            value: z.number(),
            color: z.string(),
          })),
          categoryExpense: z.array(z.object({
            id: z.string(),
            name: z.string(),
            value: z.number(),
            color: z.string(),
          })),
        }),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { from: startDate, to: endDate } = request.query;

    // 1. Total Balance & individual account balances
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        balance: true,
        color: true,
      },
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance.toNumber(), 0);

    // 2. Income & Expense in range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeCategories: Record<string, { id: string; name: string; value: number; color: string }> = {};
    const expenseCategories: Record<string, { id: string; name: string; value: number; color: string }> = {};

    transactions.forEach(t => {
      const amount = t.amount.toNumber();
      const categoryId = t.categoryId || 'uncategorized';
      const categoryName = t.category?.name || 'Uncategorized';
      const categoryColor = t.category?.color || '#94a3b8';

      if (t.type === 'INCOME') {
        totalIncome += amount;
        if (!incomeCategories[categoryId]) {
          incomeCategories[categoryId] = { id: categoryId, name: categoryName, value: 0, color: categoryColor };
        }
        incomeCategories[categoryId].value += amount;
      } else {
        totalExpense += amount;
        if (!expenseCategories[categoryId]) {
          expenseCategories[categoryId] = { id: categoryId, name: categoryName, value: 0, color: categoryColor };
        }
        expenseCategories[categoryId].value += amount;
      }
    });

    // 3. Chart Data
    // We'll group by day if range <= 31 days, otherwise by month
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let chartData: { period: string; income: number; expense: number }[] = [];

    if (diffDays <= 31) {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      chartData = days.map((day: Date) => {
        const dayTransactions = transactions.filter(t => isSameDay(t.date, day));
        return {
          period: format(day, 'dd/MM'),
          income: dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount.toNumber(), 0),
          expense: dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount.toNumber(), 0),
        };
      });
    } else {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      chartData = months.map((month: Date) => {
        const monthTransactions = transactions.filter(t => isSameMonth(t.date, month));
        return {
          period: format(month, 'MMM yyyy'),
          income: monthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount.toNumber(), 0),
          expense: monthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount.toNumber(), 0),
        };
      });
    }

    return {
      totalBalance,
      income: totalIncome,
      expense: totalExpense,
      chartData,
      accounts: accounts.map(a => ({
        ...a,
        balance: a.balance.toNumber(),
      })),
      categoryIncome: Object.values(incomeCategories).sort((a, b) => b.value - a.value),
      categoryExpense: Object.values(expenseCategories).sort((a, b) => b.value - a.value),
    };
  });
}
