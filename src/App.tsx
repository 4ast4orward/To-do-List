import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import ContactList from './components/ContactList';
import DebugPanel from './components/DebugPanel';
import BillTracker from './components/BillTracker';
import BudgetTracker from './components/BudgetTracker';
import { loadUserStats, saveUserStats, loadTodos, saveTodos } from './utils/storage';
import { UserStats, Todo } from './types/Todo';
import { Contact } from './types/Contact';
import { Bill } from './types/Bill';
import { BudgetItem, Transaction } from './types/Budget';
import './App.css';

function App() {
  const [userStats, setUserStats] = useState<UserStats>(() => loadUserStats());
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem('contacts');
    return savedContacts ? JSON.parse(savedContacts) : [];
  });
  const [bills, setBills] = useState<Bill[]>(() => {
    const savedBills = localStorage.getItem('bills');
    return savedBills ? JSON.parse(savedBills, (key, value) => {
      if (key === 'dueDate') return new Date(value);
      return value;
    }) : [];
  });
  const [budgets, setBudgets] = useState<BudgetItem[]>(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  });

  const [view, setView] = useState<'todos' | 'contacts' | 'bills' | 'budget'>(() => {
    const savedView = localStorage.getItem('currentView');
    return (savedView as 'todos' | 'contacts' | 'bills' | 'budget') || 'todos';
  });

  // Save stats and todos whenever they change
  useEffect(() => {
    saveUserStats(userStats);
  }, [userStats]);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Add new useEffect for saving view
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  const handleAddTodo = (todo: Todo) => {
    setTodos(prevTodos => [...prevTodos, todo]);
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...contactData,
    };
    setContacts([...contacts, newContact]);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(contacts.map(contact =>
      contact.id === updatedContact.id
        ? { ...updatedContact, updatedAt: new Date() }
        : contact
    ));
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  const handleAddBill = (bill: Bill) => {
    setBills(prevBills => [...prevBills, bill]);
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills(prevBills =>
      prevBills.map(bill => (bill.id === updatedBill.id ? updatedBill : bill))
    );
  };

  const handleDeleteBill = (billId: string) => {
    setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
  };

  const handleAddBudget = (budget: BudgetItem) => {
    setBudgets(prevBudgets => [...prevBudgets, budget]);
  };

  const handleUpdateBudget = (updatedBudget: BudgetItem) => {
    setBudgets(prevBudgets =>
      prevBudgets.map(budget => (budget.id === updatedBudget.id ? updatedBudget : budget))
    );
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prevTransactions => [...prevTransactions, transaction]);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.filter(transaction => transaction.id !== transactionId)
    );
  };

  const handleViewChange = (newView: 'todos' | 'contacts' | 'bills' | 'budget') => {
    setView(newView);
    localStorage.setItem('currentView', newView);
    window.location.reload();
  };

  return (
    <div className="app" data-view={view}>
      <div className="view-toggle">
        <button
          className={`view-button ${view === 'todos' ? 'active' : ''}`}
          onClick={() => handleViewChange('todos')}
        >
          Tasks
        </button>
        <button
          className={`view-button ${view === 'contacts' ? 'active' : ''}`}
          onClick={() => handleViewChange('contacts')}
        >
          Contacts
        </button>
        <button
          className={`view-button ${view === 'bills' ? 'active' : ''}`}
          onClick={() => handleViewChange('bills')}
        >
          Bills
        </button>
        <button
          className={`view-button ${view === 'budget' ? 'active' : ''}`}
          onClick={() => handleViewChange('budget')}
        >
          Budget
        </button>
      </div>

      {view === 'todos' ? (
        <TodoList
          todos={todos}
          userStats={userStats}
          setUserStats={setUserStats}
          onAddTodo={handleAddTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      ) : view === 'contacts' ? (
        <ContactList
          contacts={contacts}
          onAddContact={handleAddContact}
          onUpdateContact={handleUpdateContact}
          onDeleteContact={handleDeleteContact}
        />
      ) : view === 'bills' ? (
        <BillTracker
          bills={bills}
          onBillAdd={handleAddBill}
          onBillUpdate={handleUpdateBill}
          onBillDelete={handleDeleteBill}
        />
      ) : (
        <BudgetTracker
          budgets={budgets}
          transactions={transactions}
          onBudgetAdd={handleAddBudget}
          onBudgetUpdate={handleUpdateBudget}
          onTransactionAdd={handleAddTransaction}
          onTransactionDelete={handleDeleteTransaction}
        />
      )}

      <DebugPanel
        userStats={userStats}
        setUserStats={setUserStats}
        todos={todos}
        setTodos={setTodos}
      />
    </div>
  );
}

export default App; 