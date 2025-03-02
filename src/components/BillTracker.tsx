import React, { useState, useEffect } from 'react';
import { Bill, BillSummary, BillRecurrence } from '../types/Bill';
import { format, addDays, isBefore, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import SpendingPieChart from './SpendingPieChart';

interface BillTrackerProps {
  bills: Bill[];
  onBillAdd: (bill: Bill) => void;
  onBillUpdate: (bill: Bill) => void;
  onBillDelete: (billId: string) => void;
}

const BillTracker: React.FC<BillTrackerProps> = ({
  bills,
  onBillAdd,
  onBillUpdate,
  onBillDelete,
}) => {
  const [summary, setSummary] = useState<BillSummary>({
    totalDue: 0,
    upcomingBills: 0,
    overdueBills: 0,
    paidThisMonth: 0,
    nextDueDate: null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    title: '',
    amount: 0,
    dueDate: new Date(),
    recurrence: 'monthly' as BillRecurrence,
    category: '',
    paid: false,
    reminderDays: 7,
    automaticPayment: false,
  });

  // Add state for monthly totals
  const [monthlyTotals, setMonthlyTotals] = useState({
    totalDue: 0,
    totalPaid: 0
  });

  // Calculate bill summary
  useEffect(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const summary: BillSummary = {
      totalDue: 0,
      upcomingBills: 0,
      overdueBills: 0,
      paidThisMonth: 0,
      nextDueDate: null,
    };

    bills.forEach(bill => {
      if (!bill.paid) {
        summary.totalDue += bill.amount;
        
        if (isBefore(bill.dueDate, now)) {
          summary.overdueBills++;
        } else if (isBefore(bill.dueDate, addDays(now, bill.reminderDays))) {
          summary.upcomingBills++;
        }

        if (!summary.nextDueDate || isBefore(bill.dueDate, summary.nextDueDate)) {
          summary.nextDueDate = bill.dueDate;
        }
      } else if (
        isAfter(bill.dueDate, monthStart) &&
        isBefore(bill.dueDate, monthEnd)
      ) {
        summary.paidThisMonth++;
      }
    });

    setSummary(summary);
  }, [bills]);

  // Calculate monthly totals
  useEffect(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthlyBills = bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return !isBefore(dueDate, start) && !isAfter(dueDate, end);
    });

    const totalDue = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaid = monthlyBills
      .filter(bill => bill.paid)
      .reduce((sum, bill) => sum + bill.amount, 0);

    setMonthlyTotals({ totalDue, totalPaid });
  }, [bills]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBill.title && newBill.amount && newBill.dueDate) {
      const bill: Bill = {
        id: crypto.randomUUID(),
        ...newBill as Omit<Bill, 'id'>,
      };
      onBillAdd(bill);
      setShowAddForm(false);
      setNewBill({
        title: '',
        amount: 0,
        dueDate: new Date(),
        recurrence: 'monthly',
        category: '',
        paid: false,
        reminderDays: 7,
        automaticPayment: false,
      });
    }
  };

  const handleBillPaid = (bill: Bill) => {
    const updatedBill = { ...bill, paid: true };
    onBillUpdate(updatedBill);
  };

  return (
    <div className="bill-tracker">
      <div className="bill-summary">
        <h2>Bills Overview</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Due</h3>
            <p>${monthlyTotals.totalDue.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Paid</h3>
            <p>${monthlyTotals.totalPaid.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Remaining</h3>
            <p>${(monthlyTotals.totalDue - monthlyTotals.totalPaid).toFixed(2)}</p>
          </div>
        </div>

        <SpendingPieChart
          income={monthlyTotals.totalDue}
          spending={monthlyTotals.totalPaid}
          title="Monthly Bills: Due vs Paid"
        />

        <div className="bill-summary">
          <h2>Bills Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Total Due</h3>
              <p>${summary.totalDue.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Upcoming</h3>
              <p>{summary.upcomingBills} bills</p>
            </div>
            <div className="summary-card">
              <h3>Overdue</h3>
              <p>{summary.overdueBills} bills</p>
            </div>
            <div className="summary-card">
              <h3>Paid this Month</h3>
              <p>{summary.paidThisMonth} bills</p>
            </div>
          </div>
          {summary.nextDueDate && (
            <div className="next-due">
              Next bill due: {format(summary.nextDueDate, 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      </div>

      <div className="bills-section">
        <div className="bills-header">
          <h2>Upcoming Bills</h2>
          <button
            className="add-bill-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Bill'}
          </button>
        </div>

        {showAddForm && (
          <form className="bill-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Bill Title</label>
                <input
                  type="text"
                  id="title"
                  value={newBill.title}
                  onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  min="0"
                  step="0.01"
                  value={newBill.amount}
                  onChange={e => setNewBill({ ...newBill, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  value={format(newBill.dueDate || new Date(), 'yyyy-MM-dd')}
                  onChange={e => setNewBill({ ...newBill, dueDate: new Date(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recurrence">Recurrence</label>
                <select
                  id="recurrence"
                  value={newBill.recurrence}
                  onChange={e => setNewBill({ ...newBill, recurrence: e.target.value as BillRecurrence })}
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  value={newBill.category}
                  onChange={e => setNewBill({ ...newBill, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reminderDays">Reminder Days Before</label>
                <input
                  type="number"
                  id="reminderDays"
                  min="0"
                  value={newBill.reminderDays}
                  onChange={e => setNewBill({ ...newBill, reminderDays: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newBill.automaticPayment}
                    onChange={e => setNewBill({ ...newBill, automaticPayment: e.target.checked })}
                  />
                  Automatic Payment
                </label>
              </div>
            </div>
            <button type="submit" className="submit-btn">Add Bill</button>
          </form>
        )}

        <div className="bills-grid">
          {bills
            .filter(bill => !bill.paid)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .map(bill => (
              <div
                key={bill.id}
                className={`bill-card ${
                  isBefore(bill.dueDate, new Date()) ? 'overdue' : ''
                }`}
              >
                <div className="bill-header">
                  <h3>{bill.title}</h3>
                  <span className="amount">${bill.amount.toFixed(2)}</span>
                </div>
                <div className="bill-details">
                  <p>Due: {format(bill.dueDate, 'MMM dd, yyyy')}</p>
                  <p>Recurrence: {bill.recurrence}</p>
                  {bill.category && <p>Category: {bill.category}</p>}
                  {bill.automaticPayment && (
                    <span className="auto-pay-badge">Auto-pay enabled</span>
                  )}
                </div>
                <div className="bill-actions">
                  <button
                    className="mark-paid-btn"
                    onClick={() => handleBillPaid(bill)}
                  >
                    Mark as Paid
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onBillDelete(bill.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BillTracker; 