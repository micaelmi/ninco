import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function getReportData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/reports/data', {
    schema: {
      tags: ['reports'],
      summary: 'Get aggregated financial data for report generation',
      querystring: z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
      response: {
        200: z.object({
          period: z.object({
            from: z.string(),
            to: z.string(),
            weeks: z.number(),
          }),
          totals: z.object({
            income: z.number(),
            expenses: z.number(),
            savings: z.number(),
          }),
          weeklyAverages: z.object({
            income: z.number(),
            expenses: z.number(),
            savings: z.number(),
          }),
          topCategories: z.object({
            income: z.array(z.object({
              id: z.string(),
              name: z.string(),
              amount: z.number(),
              color: z.string(),
              percentage: z.number(),
            })),
            expense: z.array(z.object({
              id: z.string(),
              name: z.string(),
              amount: z.number(),
              color: z.string(),
              percentage: z.number(),
            })),
          }),
          topTags: z.array(z.object({
            id: z.string(),
            name: z.string(),
            count: z.number(),
            totalAmount: z.number(),
          })),
          transactionCount: z.number(),
          weeklyBreakdown: z.array(z.object({
            week: z.string(),
            income: z.number(),
            expense: z.number(),
          })),
        }),
      },
    },
  }, async (request) => {
    const userId = request.userId;
    const { from: startDate, to: endDate } = request.query;

    // Fetch all transactions in the range with categories and tags
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    const incomeCategories: Record<string, { id: string; name: string; amount: number; color: string }> = {};
    const expenseCategories: Record<string, { id: string; name: string; amount: number; color: string }> = {};
    const tagMap: Record<string, { id: string; name: string; count: number; totalAmount: number }> = {};

    transactions.forEach(t => {
      const amount = t.amount.toNumber();
      const categoryId = t.categoryId || 'uncategorized';
      const categoryName = t.category?.name || 'Uncategorized';
      const categoryColor = t.category?.color || '#94a3b8';

      if (t.type === 'INCOME') {
        totalIncome += amount;
        if (!incomeCategories[categoryId]) {
          incomeCategories[categoryId] = { id: categoryId, name: categoryName, amount: 0, color: categoryColor };
        }
        incomeCategories[categoryId].amount += amount;
      } else {
        totalExpense += amount;
        if (!expenseCategories[categoryId]) {
          expenseCategories[categoryId] = { id: categoryId, name: categoryName, amount: 0, color: categoryColor };
        }
        expenseCategories[categoryId].amount += amount;
      }

      // Aggregate tags
      t.tags.forEach(tag => {
        if (!tagMap[tag.id]) {
          tagMap[tag.id] = { id: tag.id, name: tag.name, count: 0, totalAmount: 0 };
        }
        tagMap[tag.id].count += 1;
        tagMap[tag.id].totalAmount += amount;
      });
    });

    const totalSavings = totalIncome - totalExpense;

    // Calculate weeks in range
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const weeks = Math.max(1, diffDays / 7);

    // Weekly averages
    const weeklyAverages = {
      income: Math.round((totalIncome / weeks) * 100) / 100,
      expenses: Math.round((totalExpense / weeks) * 100) / 100,
      savings: Math.round((totalSavings / weeks) * 100) / 100,
    };

    // Top categories with percentages
    const topIncomeCategories = Object.values(incomeCategories)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(c => ({
        ...c,
        percentage: totalIncome > 0 ? Math.round((c.amount / totalIncome) * 10000) / 100 : 0,
      }));

    const topExpenseCategories = Object.values(expenseCategories)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(c => ({
        ...c,
        percentage: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 10000) / 100 : 0,
      }));

    // Top tags
    const topTags = Object.values(tagMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Weekly breakdown for chart data
    const weeklyBreakdown: { week: string; income: number; expense: number }[] = [];
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    let weekStart = new Date(startDate);
    let weekNum = 1;

    while (weekStart < endDate) {
      const weekEnd = new Date(Math.min(weekStart.getTime() + msPerWeek, endDate.getTime()));
      const weekTransactions = transactions.filter(t =>
        t.date >= weekStart && t.date < weekEnd
      );

      weeklyBreakdown.push({
        week: `Week ${weekNum}`,
        income: weekTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount.toNumber(), 0),
        expense: weekTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount.toNumber(), 0),
      });

      weekStart = weekEnd;
      weekNum++;
    }

    return {
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        weeks: Math.round(weeks * 100) / 100,
      },
      totals: {
        income: totalIncome,
        expenses: totalExpense,
        savings: totalSavings,
      },
      weeklyAverages,
      topCategories: {
        income: topIncomeCategories,
        expense: topExpenseCategories,
      },
      topTags,
      transactionCount: transactions.length,
      weeklyBreakdown,
    };
  });
}
