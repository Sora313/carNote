"use client";

import { Pencil, Plus, Search, Trash2, X, CheckSquare } from "lucide-react";
import { useMemo, useState } from "react";
import type { Expense } from "@/models";
import { useApp } from "@/context/app-context";
import { ProtectedShell } from "@/components/protected-shell";
import { FREQUENCY_UNITS, formatFrequency, parseFrequency, type FrequencyUnit } from "@/lib/frequency";

const emptyExpense = {
  name: "",
  type: "Mantenimiento",
  amount: "",
  frequencyCount: "1",
  frequencyUnit: "meses" as FrequencyUnit,
  carId: "",
  date: new Date().toISOString().slice(0, 16),
};
export default function GastosPage() {
  // Ruta /gastos: ProtectedShell valida sesión; el contexto dirige el CRUD a /expenses.
  const { cars, expenses, createExpense, updateExpense, removeExpense, updateStatusExpense} =
    useApp();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyExpense);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const filtered = expenses.filter((expense) =>
    `${expense.name} ${expense.type} ${typeof expense.carId === "object" ? expense.carId.name : expense.carId}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const expenseNameOptions = useMemo(
    () => Array.from(new Set(expenses.map((expense) => expense.name))).sort(),
    [expenses],
  );

  function startEdit(expense: Expense) {
    const carId =
      typeof expense.carId === "object" ? expense.carId._id : expense.carId;
    const { count, unit } = parseFrequency(expense.frequency);
    setEditing(expense);
    setForm({
      name: expense.name,
      type: expense.type,
      amount: String(expense.amount),
      frequencyCount: String(count),
      frequencyUnit: unit,
      carId,
      date: new Date(expense.date).toISOString().slice(0, 16),
    });
    setOpen(true);
  }

  async function edit_statusPay(id: string) {
    try {
      const filter_expense = expenses.filter((expense) => expense._id === id);
      filter_expense[0].status = "Pagado"
      await updateStatusExpense(id, filter_expense[0]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo eliminar el gasto",
      );
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const { frequencyCount, frequencyUnit, ...rest } = form;
      const payload = {
        ...rest,
        amount: Number(form.amount),
        frequency: formatFrequency(Number(frequencyCount), frequencyUnit),
      };
      if (editing) await updateExpense(editing._id, payload);
      else await createExpense(payload);
      setOpen(false);
      setEditing(null);
      setForm({ ...emptyExpense, carId: cars[0]?._id ?? "" });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo guardar el gasto",
      );
    }
  }
  async function remove(id: string) {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await removeExpense(id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo eliminar el gasto",
      );
    }
  }

  return (
    <ProtectedShell title="Gastos">
      <div className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CONTROL FINANCIERO</p>
            <h1>Gastos</h1>
            <p className="subtitle">
              Registra y administra los gastos de todos tus vehículos.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setEditing(null);
              setForm({ ...emptyExpense, carId: cars[0]?._id ?? "" });
              setOpen(true);
            }}
          >
            <Plus size={18} /> Nuevo gasto
          </button>
        </div>
        <section className="panel crud-panel">
          <div className="crud-toolbar">
            <div>
              <h2>Registro de gastos</h2>
              <p>{expenses.length} gastos registrados</p>
            </div>
            <div className="search-box">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar gasto..."
              />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CONCEPTO</th>
                  <th>TIPO</th>
                  <th>MONTO</th>
                  <th>PERIODICIDAD</th>
                  <th>FECHA DE REGISTRO</th>
                  <th>AUTO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense) => {
                  const car =
                    typeof expense.carId === "object"
                      ? expense.carId.name
                      : (cars.find((item) => item._id === expense.carId)
                          ?.name ?? "Sin auto");
                  return (
                    <tr key={expense._id}>
                      <td>
                        <strong>{expense.name}</strong>
                      </td>
                      <td>
                        <span className="type-badge">{expense.type}</span>
                      </td>
                      <td className="amount">${expense.amount.toFixed(2)}</td>
                      <td>{expense.frequency}</td>
                      <td>{new Date(expense.date).toLocaleString("es-MX")}</td>
                      <td>{car}</td>
                      <td>
                        <span
                          className={`status ${expense.status === "Pagado" ? "paid" : "pending"}`}
                        >
                          <i />
                          {expense.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="action-button"
                            onClick={() => startEdit(expense)}
                            aria-label="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="action-button danger"
                            onClick={() => void remove(expense._id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            className="action-button"
                            onClick={() => void edit_statusPay(expense._id)}
                            aria-label="Editar"
                          >xa
                            <CheckSquare size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <div className="empty-crud">Aún no hay gastos para mostrar.</div>
          )}
        </section>
      </div>
      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">CRUD DE GASTOS</p>
                <h2>{editing ? "Editar gasto" : "Nuevo gasto"}</h2>
              </div>
              <button className="close-button" onClick={() => setOpen(false)}>
                <X size={19} />
              </button>
            </div>
            <form onSubmit={submit}>
              <label>
                Nombre del gasto
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Cambio de aceite"
                  list="expense-name-options"
                  autoComplete="off"
                  required
                />
                <datalist id="expense-name-options">
                  {expenseNameOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </label>
              <div className="form-row">
                <label>
                  Tipo
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    <option>Mantenimiento</option>
                    <option>Seguro</option>
                    <option>Operativo</option>
                    <option>Impuestos</option>
                    <option>Cuidado</option>
                  </select>
                </label>
                <label>
                  Monto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Repetir cada
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.frequencyCount}
                    disabled={form.frequencyUnit === "unica"}
                    onChange={(event) =>
                      setForm({ ...form, frequencyCount: event.target.value })
                    }
                    required={form.frequencyUnit !== "unica"}
                  />
                </label>
                <label>
                  Periodicidad
                  <select
                    value={form.frequencyUnit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        frequencyUnit: event.target.value as FrequencyUnit,
                      })
                    }
                  >
                    {FREQUENCY_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.plural.charAt(0).toUpperCase() + unit.plural.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Auto
                  <select
                    value={form.carId}
                    onChange={(event) =>
                      setForm({ ...form, carId: event.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona un auto</option>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.name} · {car.plate}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Fecha y hora de registro
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button className="primary-button" disabled={!cars.length}>
                  Guardar gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedShell>
  );
}
