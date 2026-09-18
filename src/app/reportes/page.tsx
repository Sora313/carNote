import { BarChart3 } from "lucide-react";
import { ProtectedShell } from "@/components/protected-shell";

export default function ReportesPage() {
  // Ruta /reportes: protegida por el shell; aquí se consumirá el análisis futuro.
  return (
    <ProtectedShell title="Reportes">
      <div className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ANÁLISIS</p>
            <h1>Reportes</h1>
            <p className="subtitle">
              Visualiza el comportamiento de tus gastos mensuales.
            </p>
          </div>
        </div>
        <section className="panel report-empty">
          <BarChart3 size={36} />
          <h2>Reportes disponibles próximamente</h2>
          <p>
            Cuando registres gastos, aquí podrás comparar consumos por auto,
            tipo y periodicidad.
          </p>
        </section>
      </div>
    </ProtectedShell>
  );
}
