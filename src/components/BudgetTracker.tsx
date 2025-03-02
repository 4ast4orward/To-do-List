import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { BudgetItem, Transaction, BudgetSummary, BudgetCategory, DEFAULT_CATEGORIES } from '../types/Budget';
import SpendingPieChart from './SpendingPieChart';

interface BudgetTrackerProps {
  budgets: BudgetItem[];
  transactions: Transaction[];
  onBudgetAdd: (budget: BudgetItem) => void;
  onBudgetUpdate: (budget: BudgetItem) => void;
  onTransactionAdd: (transaction: Transaction) => void;
  onTransactionDelete: (transactionId: string) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgets,
  transactions,
  onBudgetAdd,
  onBudgetUpdate,
  onTransactionAdd,
  onTransactionDelete,
}) => {
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    savingsRate: 0,
    categoryBreakdown: {} as BudgetSummary['categoryBreakdown'],
    monthlyTrend: []
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    category: 'other',
    type: 'expense',
    amount: 0,
    description: '',
    date: new Date()
  });
  const [newBudget, setNewBudget] = useState<Partial<BudgetItem>>({
    category: 'other',
    amount: 0,
    month: format(new Date(), 'yyyy-MM'),
    spent: 0
  });

  // Add new state for total income
  const [totalIncome, setTotalIncome] = useState(0);

  // Calculate budget summary
  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const currentMonthTransactions = transactions.filter(
      t => format(t.date, 'yyyy-MM') === currentMonth
    );

    const totalBudget = budgets
      .filter(b => b.month === currentMonth)
      .reduce((sum, b) => sum + b.amount, 0);

    const totalSpent = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(monthlyIncome);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    // Calculate category breakdown
    const categoryBreakdown = {} as BudgetSummary['categoryBreakdown'];
    Object.keys(DEFAULT_CATEGORIES).forEach(category => {
      const budget = budgets.find(b => b.month === currentMonth && b.category === category)?.amount || 0;
      const spent = currentMonthTransactions
        .filter(t => t.category === category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      categoryBreakdown[category as BudgetCategory] = {
        budget,
        spent,
        remaining: budget - spent
      };
    });

    // Calculate monthly trends
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    const monthlyTrend = last6Months.map(date => {
      const month = format(date, 'yyyy-MM');
      const monthTransactions = transactions.filter(
        t => format(t.date, 'yyyy-MM') === month && t.type === 'expense'
      );
      const monthBudgets = budgets.filter(b => b.month === month);

      return {
        month,
        spent: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        budget: monthBudgets.reduce((sum, b) => sum + b.amount, 0)
      };
    });

    setSummary({
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
      savingsRate,
      categoryBreakdown,
      monthlyTrend
    });
  }, [budgets, transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransaction.amount && newTransaction.description) {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        category: newTransaction.category as BudgetCategory,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: newTransaction.date || new Date(),
        type: newTransaction.type as 'income' | 'expense'
      };
      onTransactionAdd(transaction);
      setShowAddTransaction(false);
      setNewTransaction({
        category: 'other',
        type: 'expense',
        amount: 0,
        description: '',
        date: new Date()
      });
    }
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget.amount) {
      const budget: BudgetItem = {
        id: crypto.randomUUID(),
        category: newBudget.category as BudgetCategory,
        amount: newBudget.amount,
        spent: 0,
        month: newBudget.month || format(new Date(), 'yyyy-MM'),
        notes: newBudget.notes
      };
      onBudgetAdd(budget);
      setShowAddBudget(false);
      setNewBudget({
        category: 'other',
        amount: 0,
        month: format(new Date(), 'yyyy-MM'),
        spent: 0
      });
    }
  };

  return (
    <div className="budget-tracker">
      <div className="budget-summary">
        <h2>Budget Overview</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Budget</h3>
            <p>${summary.totalBudget.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p>${summary.totalSpent.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Remaining</h3>
            <p>${summary.remainingBudget.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Savings Rate</h3>
            <p>{summary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        <SpendingPieChart
          income={totalIncome}
          spending={summary.totalSpent}
          title="Monthly Income vs Spending"
        />

        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          <div className="category-grid">
            {Object.entries(summary.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="category-card">
                <div className="category-header">
                  <span className="category-icon">
                    {DEFAULT_CATEGORIES[category as BudgetCategory].icon}
                  </span>
                  <h4>{DEFAULT_CATEGORIES[category as BudgetCategory].name}</h4>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((data.spent / data.budget) * 100, 100)}%`,
                      backgroundColor: data.spent > data.budget ? '#ff4444' : DEFAULT_CATEGORIES[category as BudgetCategory].color
                    }}
                  />
                </div>
                <div className="category-details">
                  <p>Budget: ${data.budget.toFixed(2)}</p>
                  <p>Spent: ${data.spent.toFixed(2)}</p>
                  <p>Remaining: ${data.remaining.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="monthly-trend">
          <h3>Monthly Trend</h3>
          <div className="trend-chart">
            {summary.monthlyTrend.map(month => (
              <div key={month.month} className="trend-bar">
                <div className="bar-label">{format(new Date(month.month + '-01'), 'MMM')}</div>
                <div className="bar-container">
                  <div
                    className="spent-bar"
                    style={{
                      height: `${(month.spent / Math.max(...summary.monthlyTrend.map(m => Math.max(m.spent, m.budget)))) * 100}%`
                    }}
                  />
                  <div
                    className="budget-bar"
                    style={{
                      height: `${(month.budget / Math.max(...summary.monthlyTrend.map(m => Math.max(m.spent, m.budget)))) * 100}%`
                    }}
                  />
                </div>
                <div className="bar-values">
                  <span>${month.spent.toFixed(0)}</span>
                  <span>${month.budget.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="actions-section">
        <button
          className="add-transaction-btn"
          onClick={() => setShowAddTransaction(!showAddTransaction)}
        >
          {showAddTransaction ? 'Cancel' : 'Add Transaction'}
        </button>
        <button
          className="add-budget-btn"
          onClick={() => setShowAddBudget(!showAddBudget)}
        >
          {showAddBudget ? 'Cancel' : 'Set Budget'}
        </button>
      </div>

      {showAddTransaction && (
        <form className="transaction-form" onSubmit={handleAddTransaction}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={newTransaction.type}
                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={newTransaction.category}
                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value as BudgetCategory })}
              >
                {Object.entries(DEFAULT_CATEGORIES).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                min="0"
                step="0.01"
                value={newTransaction.amount}
                onChange={e => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={newTransaction.description}
                onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={format(newTransaction.date || new Date(), 'yyyy-MM-dd')}
                onChange={e => setNewTransaction({ ...newTransaction, date: new Date(e.target.value) })}
                required
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">Add Transaction</button>
        </form>
      )}

      {showAddBudget && (
        <form className="budget-form" onSubmit={handleAddBudget}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="budgetCategory">Category</label>
              <select
                id="budgetCategory"
                value={newBudget.category}
                onChange={e => setNewBudget({ ...newBudget, category: e.target.value as BudgetCategory })}
              >
                {Object.entries(DEFAULT_CATEGORIES).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="budgetAmount">Monthly Budget</label>
              <input
                type="number"
                id="budgetAmount"
                min="0"
                step="0.01"
                value={newBudget.amount}
                onChange={e => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="budgetMonth">Month</label>
              <input
                type="month"
                id="budgetMonth"
                value={newBudget.month}
                onChange={e => setNewBudget({ ...newBudget, month: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="budgetNotes">Notes</label>
              <textarea
                id="budgetNotes"
                value={newBudget.notes}
                onChange={e => setNewBudget({ ...newBudget, notes: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">Set Budget</button>
        </form>
      )}
    </div>
  );
};

export default BudgetTracker; 