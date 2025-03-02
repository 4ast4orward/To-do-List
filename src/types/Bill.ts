export type BillRecurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  recurrence: BillRecurrence;
  category: string;
  paid: boolean;
  notes?: string;
  reminderDays: number; // Days before due date to show reminder
  automaticPayment: boolean;
  paymentMethod?: string;
}

export interface BillSummary {
  totalDue: number;
  upcomingBills: number;
  overdueBills: number;
  paidThisMonth: number;
  nextDueDate: Date | null;
} 