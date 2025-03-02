export type BudgetCategory = 
  | 'housing'
  | 'utilities'
  | 'groceries'
  | 'transportation'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'savings'
  | 'other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  amount: number;
  spent: number;
  month: string; // Format: 'YYYY-MM'
  notes?: string;
}

export interface Transaction {
  id: string;
  category: BudgetCategory;
  amount: number;
  date: Date;
  description: string;
  type: 'income' | 'expense';
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  savingsRate: number;
  categoryBreakdown: Record<BudgetCategory, {
    budget: number;
    spent: number;
    remaining: number;
  }>;
  monthlyTrend: {
    month: string;
    spent: number;
    budget: number;
  }[];
}

export const DEFAULT_CATEGORIES: Record<BudgetCategory, {
  name: string;
  icon: string;
  color: string;
}> = {
  housing: { name: 'Housing', icon: '🏠', color: '#4CAF50' },
  utilities: { name: 'Utilities', icon: '💡', color: '#2196F3' },
  groceries: { name: 'Groceries', icon: '🛒', color: '#FF9800' },
  transportation: { name: 'Transportation', icon: '🚗', color: '#E91E63' },
  healthcare: { name: 'Healthcare', icon: '⚕️', color: '#9C27B0' },
  entertainment: { name: 'Entertainment', icon: '🎮', color: '#673AB7' },
  shopping: { name: 'Shopping', icon: '🛍️', color: '#3F51B5' },
  savings: { name: 'Savings', icon: '💰', color: '#009688' },
  other: { name: 'Other', icon: '📌', color: '#607D8B' }
}; 