"use client";

import { Bell, Car, CircleHelp, FileText, Gauge, Home, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearSession, getSession, type User } from "@/lib/api";

const navigation = [{ href: "/", label: "Resumen", icon: Home }, { href: "/gastos", label: "Gastos", icon: FileText }, { href: "/autos", label: "Mis autos", icon: Car }, { href: "/reportes", label: "Reportes", icon: Gauge }];

export function ProtectedShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { const session = getSession(); if (!session) { router.replace("/login"); return; } queueMicrotask(() => setUser(session.user)); }, [router]);
  if (!user) return <div className="auth-loading">Cargando tu espacio...</div>;
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <main className="app-shell"><aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark"><Car size={20} /></span><span>CarNote</span></Link><div className="workspace-label">ESPACIO DE TRABAJO</div><nav className="nav-list">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-item ${pathname === href ? "active" : ""}`}><Icon size={18} />{label}</Link>)}</nav><div className="sidebar-bottom"><button className="nav-item"><Settings size={18} />Configuración</button><button className="nav-item"><CircleHelp size={18} />Centro de ayuda</button><button className="nav-item logout-button" onClick={() => { clearSession(); router.replace("/login"); }}><LogOut size={18} />Cerrar sesión</button><div className="user-card"><div className="avatar">{initials}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></div></aside><section className="content-area"><header className="topbar"><div className="breadcrumbs">CarNote <span>/</span> {title}</div><div className="top-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={18} /><i /></button><div className="top-avatar">{initials}</div></div></header>{children}</section></main>;
}
