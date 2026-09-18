"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  authApi,
  carsApi,
  clearSession,
  expensesApi,
  getSession,
  saveSession,
  type Car,
} from "@/api/api";
import type { Expense, ExpenseInput, User } from "@/models";
import { isExpenseDue } from "@/lib/frequency";

import type { CarInput } from "@/models";

type AppContextValue = {
  user: User | null;
  sessionReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  cars: Car[];
  carsLoading: boolean;
  loadCars: () => Promise<void>;
  createCar: (payload: CarInput) => Promise<Car>;
  updateCar: (id: string, payload: Partial<Car>) => Promise<Car>;
  removeCar: (id: string) => Promise<void>;
  expenses: Expense[];
  expensesLoading: boolean;
  loadExpenses: () => Promise<void>;
  createExpense: (payload: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<Expense>) => Promise<Expense>;
  updateStatusExpense: (id: string, payload: Partial<Expense>) => Promise<Expense>;
  removeExpense: (id: string) => Promise<void>;
  
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  useEffect(() => {
    // Primera rama: recuperar la sesión guardada o arrancar como visitante.
    const session = getSession();
    queueMicrotask(() => {
      setUser(session?.user ?? null);
      setSessionReady(true);
    });
  }, []);

  async function login(email: string, password: string) {
    // Login correcto: API -> localStorage -> estado global -> /.
    const session = await authApi.login({ email, password });
    saveSession(session);
    setUser(session.user);
  }

  async function register(name: string, email: string, password: string) {
    // Registro correcto: sigue el mismo camino que el login.
    const session = await authApi.register({ name, email, password });
    saveSession(session);
    setUser(session.user);
  }

  function logout() {
    clearSession();
    setUser(null);
    setCars([]);
    setExpenses([]);
  }

  async function loadCars() {
    setCarsLoading(true);
    try {
      setCars(await carsApi.list());
    } finally {
      setCarsLoading(false);
    }
  }

  async function loadExpenses() {
    setExpensesLoading(true);
    try {
      const list = await expensesApi.list();
      setExpenses(list);
      await syncDueExpenses(list);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function syncDueExpenses(list: Expense[]) {
    // Un gasto "Pagado" cuya periodicidad ya venció vuelve a "Pendiente" automáticamente.
    const due = list.filter(
      (expense) => expense.status === "Pagado" && isExpenseDue(expense.date, expense.frequency),
    );
    if (!due.length) return;
    const updated = await Promise.all(
      due.map((expense) => expensesApi.updateStatus(expense._id, { ...expense, status: "Pendiente" })),
    );
    setExpenses((current) =>
      current.map((item) => updated.find((update) => update._id === item._id) ?? item),
    );
  }

  useEffect(() => {
    // Sólo un usuario autenticado puede cargar los CRUD protegidos.
    if (!user) return;
    queueMicrotask(() => void Promise.all([loadCars(), loadExpenses()]));
  }, [user]);

  async function createCar(payload: CarInput) {
    // Cada mutación actualiza API y contexto para refrescar todas las vistas.
    const car = await carsApi.create(payload);
    setCars((current) => [...current, car]);
    return car;
  }

  async function updateCar(id: string, payload: Partial<Car>) {
    const car = await carsApi.update(id, payload);
    setCars((current) => current.map((item) => (item._id === id ? car : item)));
    return car;
  }

  async function removeCar(id: string) {
    await carsApi.remove(id);
    setCars((current) => current.filter((item) => item._id !== id));
  }

  async function createExpense(payload: ExpenseInput) {
    const expense = await expensesApi.create(payload);
    setExpenses((current) => [...current, expense]);
    return expense;
  }

  async function updateExpense(id: string, payload: Partial<Expense>) {
    const expense = await expensesApi.update(id, payload);
    setExpenses((current) => current.map((item) => (item._id === id ? expense : item)));
    return expense;
  }

  async function updateStatusExpense(id: string, payload: Partial<Expense> ) {
    const expense = await expensesApi.updateStatus(id, payload);
    setExpenses((current) => current.map((item) => (item._id === id ? expense : item)));
    return expense;
  }

  async function removeExpense(id: string) {
    await expensesApi.remove(id);
    setExpenses((current) => current.filter((item) => item._id !== id));
  }

  return (
    <AppContext.Provider value={{ user, sessionReady, login, register, logout, cars, carsLoading, loadCars, createCar, updateCar, removeCar, expenses, expensesLoading,
     loadExpenses, createExpense, updateExpense,updateStatusExpense ,removeExpense}}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe usarse dentro de AppProvider");
  return context;
}