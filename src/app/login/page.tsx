import { Car } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  // Ruta pública /login: AuthForm decide entre iniciar sesión y registrarse.
  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">
            <Car size={20} />
          </span>
          CarNote
        </div>
        <div className="auth-quote">
          <span>“</span>
          <h1>
            Tu vehículo merece
            <br />
            un mejor copiloto.
          </h1>
          <p>
            Ordena tus gastos, anticipa el mantenimiento y conduce con
            tranquilidad.
          </p>
        </div>
        <div className="auth-stats">
          <span>
            <strong>3</strong> vehículos activos
          </span>
          <span>
            <strong>24</strong> gastos registrados
          </span>
        </div>
      </section>
      <section className="auth-form-area">
        <AuthForm />
      </section>
    </main>
  );
}
