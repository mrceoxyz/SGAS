"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  QrCode,
  ClipboardList,
  GraduationCap,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Scan QR", icon: QrCode },
  { href: "/students", label: "Students", icon: Users },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>SchoolGate – Student Arrival System</title>
        <meta name="description" content="Real-time student arrival alerts for parents" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </head>
      <body className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-100 shadow-sm shrink-0">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-700 text-slate-900 text-sm leading-none font-semibold">SchoolGate</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Arrival System</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-sky-50 text-sky-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-sky-600" : ""}`} />
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[11px] text-slate-400">
                {process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "Greenfield Academy"}
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 flex items-center justify-around px-2 py-2 shadow-lg">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  active ? "text-sky-600" : "text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
