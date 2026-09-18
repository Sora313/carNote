import type { Car } from "./car";

export type ExpenseStatus = "Pagado" | "Pendiente";

export type Expense = {
  _id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  carId: Car | string;
  date: string;
  status: ExpenseStatus;
};

export type ExpenseInput = {
  name: string;
  type: string;
  amount: number;
  frequency: string;
  carId: string;
  date: string;
};