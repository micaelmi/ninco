// API Response Types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
  description: string | null;
  comments: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  account: {
    id: string;
    name: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

export interface CreateTransactionInput {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string; // ISO datetime string
  description?: string;
  accountId: string;
  comments?: string;
  categoryId?: string;
  tagIds?: string[];
}

export interface UpdateTransactionInput {
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  date?: string;
  description?: string;
  accountId?: string;
  comments?: string;
  categoryId?: string | null;
  tagIds?: string[];
}

// Account Types
export interface Account {
  id: string;
  name: string;
  balance: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  currencyCode?: string | null;
  isVisible: boolean;
}

export interface CreateAccountInput {
  name: string;
  balance?: number;
  color: string;
  icon: string;
  currencyCode?: string;
  isVisible?: boolean;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
  color?: string;
  icon?: string;
  currencyCode?: string;
  isVisible?: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
}

// Tag Types
// Tag Types
export interface Tag {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagInput {
  name: string;
}

export interface UpdateTagInput {
  name?: string;
}
// ... existing types ...

export interface GetTransactionsParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  type?: 'INCOME' | 'EXPENSE';
}

export interface GetTransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalBalance: number;
  income: number;
  expense: number;
  chartData: {
    period: string;
    income: number;
    expense: number;
  }[];
  accounts: {
    id: string;
    name: string;
    balance: number;
    color: string;
    icon: string;
    currencyCode?: string | null;
    isVisible: boolean;
  }[];
  categoryIncome: {
    id: string;
    name: string;
    value: number;
    color: string;
  }[];
  categoryExpense: {
    id: string;
    name: string;
    value: number;
    color: string;
  }[];
}

// Report Types
export interface ReportData {
  period: {
    from: string;
    to: string;
    weeks: number;
  };
  totals: {
    income: number;
    expenses: number;
    savings: number;
  };
  weeklyAverages: {
    income: number;
    expenses: number;
    savings: number;
  };
  topCategories: {
    income: CategoryBreakdown[];
    expense: CategoryBreakdown[];
  };
  topTags: {
    id: string;
    name: string;
    count: number;
    totalAmount: number;
  }[];
  transactionCount: number;
  weeklyBreakdown: {
    week: string;
    income: number;
    expense: number;
  }[];
}

export interface CategoryBreakdown {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface ReportInsights {
  summary: string;
  tips: string[];
  patterns: string[];
}

export interface GeneratedReport {
  data: ReportData;
  insights: ReportInsights;
  generatedAt: string;
  periodLabel: string;
}
