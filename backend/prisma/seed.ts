import 'dotenv/config';
import { TransactionType } from '@prisma/client';
import { prisma } from "../src/lib/prisma";
import { subDays, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

async function main() {
  const userId = 'user_39IJ3qN94JhzWo7nZXciPbwOTWf';

  try {
    console.log('--- Seeding Started ---');

    // 1. Create User (if not exists)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'micael@ninco.app',
        name: 'Micael',
      },
    });

    console.log('User created/found');

    // 2. Cleanup existing data to start fresh (Optional, but good for consistent seeding)
    // Note: We don't delete the user.
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.tag.deleteMany({ where: { userId } });
    await prisma.category.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });

    console.log('Existing data cleaned up');

    // 3. Create Accounts
    const mainAccount = await prisma.account.create({
      data: {
        name: 'Main Account',
        balance: 2450.75,
        color: '#3b82f6',
        icon: 'Bank',
        userId,
      },
    });

    const savingsAccount = await prisma.account.create({
      data: {
        name: 'Savings',
        balance: 12500.00,
        color: '#10b981',
        icon: 'PiggyBank',
        userId,
      },
    });

    console.log('Accounts created');

    // 4. Create Categories
    const categoriesData = [
      // Income
      { name: 'Salary', color: '#10b981', icon: 'Wallet', type: TransactionType.INCOME },
      { name: 'Investments', color: '#3b82f6', icon: 'TrendingUp', type: TransactionType.INCOME },
      { name: 'Side Hustle', color: '#8b5cf6', icon: 'Briefcase', type: TransactionType.INCOME },
      { name: 'Gift', color: '#ec4899', icon: 'Gift', type: TransactionType.INCOME },
      
      // Expense
      { name: 'Housing', color: '#ef4444', icon: 'Home', type: TransactionType.EXPENSE },
      { name: 'Food', color: '#f59e0b', icon: 'Utensils', type: TransactionType.EXPENSE },
      { name: 'Transport', color: '#64748b', icon: 'Car', type: TransactionType.EXPENSE },
      { name: 'Utilities', color: '#06b6d4', icon: 'Zap', type: TransactionType.EXPENSE },
      { name: 'Entertainment', color: '#8b5cf6', icon: 'Gamepad', type: TransactionType.EXPENSE },
      { name: 'Health', color: '#fb7185', icon: 'Heart', type: TransactionType.EXPENSE },
      { name: 'Shopping', color: '#f43f5e', icon: 'ShoppingBag', type: TransactionType.EXPENSE },
      { name: 'Education', color: '#6366f1', icon: 'GraduationCap', type: TransactionType.EXPENSE },
      { name: 'Subscriptions', color: '#1e293b', icon: 'CreditCard', type: TransactionType.EXPENSE },
    ];

    const categories = await Promise.all(
      categoriesData.map(cat => prisma.category.create({ data: { ...cat, userId } }))
    );

    console.log('Categories created');

    // 5. Create Tags
    const tagsData = ['Essential', 'Luxury', 'Work', 'Personal', 'Recurring', 'One-time'];
    const tags = await Promise.all(
      tagsData.map(name => prisma.tag.create({ data: { name, userId } }))
    );

    console.log('Tags created');

    // 6. Generate Realistic Transactions (Last 90 days)
    const today = new Date();
    const startDate = subDays(today, 90);
    
    // Helper to get random category
    const getRandomCategory = (type: TransactionType) => {
      const filtered = categories.filter(c => c.type === type);
      return filtered[Math.floor(Math.random() * filtered.length)];
    };

    // Helper to get random account
    const getRandomAccount = () => Math.random() > 0.8 ? savingsAccount : mainAccount;

    console.log('Generating transactions...');

    const transactions = [];

    // Monthly Salary (Recurring)
    const salaryCat = categories.find(c => c.name === 'Salary')!;
    const recurringTag = tags.find(t => t.name === 'Recurring')!;
    
    for (let i = 0; i <= 3; i++) {
        const date = startOfMonth(subDays(today, i * 30));
        transactions.push({
            amount: 3500 + Math.random() * 500,
            type: TransactionType.INCOME,
            date,
            description: 'Monthly Salary',
            accountId: mainAccount.id,
            categoryId: salaryCat.id,
            tagIds: [recurringTag.id]
        });
    }

    // Daily Expenses
    const interval = eachDayOfInterval({ start: startDate, end: today });
    
    for (const day of interval) {
        // Daily food/coffee
        if (Math.random() > 0.3) {
            const foodCat = categories.find(c => c.name === 'Food')!;
            transactions.push({
                amount: 10 + Math.random() * 40,
                type: TransactionType.EXPENSE,
                date: day,
                description: Math.random() > 0.5 ? 'Lunch' : 'Grocery store',
                accountId: mainAccount.id,
                categoryId: foodCat.id,
                tagIds: [tags.find(t => t.name === 'Essential')!.id]
            });
        }

        // Random Shopping/Entertainment
        if (Math.random() > 0.8) {
            const cat = getRandomCategory(TransactionType.EXPENSE);
            transactions.push({
                amount: 20 + Math.random() * 150,
                type: TransactionType.EXPENSE,
                date: day,
                description: `Purchase at ${cat.name} store`,
                accountId: mainAccount.id,
                categoryId: cat.id,
                tagIds: Math.random() > 0.5 ? [tags.find(t => t.name === 'Personal')!.id] : []
            });
        }

        // Transport
        if (Math.random() > 0.6) {
            const transCat = categories.find(c => c.name === 'Transport')!;
            transactions.push({
                amount: 5 + Math.random() * 30,
                type: TransactionType.EXPENSE,
                date: day,
                description: Math.random() > 0.5 ? 'Uber' : 'Gas station',
                accountId: mainAccount.id,
                categoryId: transCat.id,
                tagIds: [tags.find(t => t.name === 'Essential')!.id]
            });
        }
    }

    // Larger Monthly Expenses (Rent, Utilities)
    for (let i = 0; i <= 3; i++) {
        const monthStart = startOfMonth(subDays(today, i * 30));
        
        // Rent
        transactions.push({
            amount: 1200,
            type: TransactionType.EXPENSE,
            date: subDays(monthStart, -1), // 2nd of the month
            description: 'Rent Payment',
            accountId: mainAccount.id,
            categoryId: categories.find(c => c.name === 'Housing')!.id,
            tagIds: [recurringTag.id, tags.find(t => t.name === 'Essential')!.id]
        });

        // Utilities
        transactions.push({
            amount: 150 + Math.random() * 100,
            type: TransactionType.EXPENSE,
            date: subDays(monthStart, -5),
            description: 'Electric & Water Bill',
            accountId: mainAccount.id,
            categoryId: categories.find(c => c.name === 'Utilities')!.id,
            tagIds: [recurringTag.id]
        });
    }

    // Save all transactions
    for (const t of transactions) {
        const { tagIds, ...data } = t;
        await prisma.transaction.create({
            data: {
                ...data,
                userId,
                tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined
            }
        });
    }

    console.log(`Created ${transactions.length} transactions`);
    console.log('--- Seeding Completed successfully ---');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
