import 'dotenv/config';
import { PrismaClient, TransactionType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('--- Production Seeding Started ---');

    // Create Categories independent of the user (userId = null)
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

    console.log('Creating general categories...');

    const existingGlobalCategories = await prisma.category.findMany({
      where: { userId: null }
    });
    
    const existingNames = new Set(existingGlobalCategories.map(c => c.name));

    let createdCount = 0;

    for (const cat of categoriesData) {
      if (!existingNames.has(cat.name)) {
        await prisma.category.create({
          data: {
            ...cat,
            // Explicitly not passing userId to keep it global
          }
        });
        createdCount++;
      }
    }

    console.log(`Created ${createdCount} global categories successfully (skipped ${categoriesData.length - createdCount} existing).`);
    console.log('--- Production Seeding Completed successfully ---');

  } catch (error) {
    console.error('Production Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
