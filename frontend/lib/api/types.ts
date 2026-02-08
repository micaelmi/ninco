// API Response Types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
  description: string;
  comments: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
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
  description: string;
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
}

export interface CreateAccountInput {
  name: string;
  balance?: number;
  color: string;
  icon: string;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
  color?: string;
  icon?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  userId: string;
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
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}
