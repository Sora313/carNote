export type User = { id: string; name: string; email: string };
export type Car = { _id: string; name: string; plate: string; model: string };
export type Expense = { _id: string; name: string; type: string; amount: number; frequency: string; carId: Car | string; date: string; status: "Pagado" | "Pendiente" };

type AuthResponse = { token: string; user: User };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function saveSession(session: AuthResponse) { localStorage.setItem("carnote_session", JSON.stringify(session)); }
export function getSession(): AuthResponse | null { try { return JSON.parse(localStorage.getItem("carnote_session") ?? "null") as AuthResponse | null; } catch { return null; } }
export function clearSession() { localStorage.removeItem("carnote_session"); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message ?? "No se pudo completar la solicitud"); }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const authApi = {
  login: (payload: { email: string; password: string }) => request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: { name: string; email: string; password: string }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
};
export const carsApi = {
  list: () => request<Car[]>("/cars"),
  create: (payload: Omit<Car, "_id">) => request<Car>("/cars", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Car>) => request<Car>(`/cars/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/cars/${id}`, { method: "DELETE" }),
};
export const expensesApi = {
  list: () => request<Expense[]>("/expenses"),
  create: (payload: { name: string; type: string; amount: number; frequency: string; carId: string }) => request<Expense>("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Expense>) => request<Expense>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/expenses/${id}`, { method: "DELETE" }),
};
