"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, QrCode, TrendingUp } from "lucide-react";
import type { DashboardStats, AttendanceRecord } from "@/lib/types";
import Link from "next/link";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ArrivalRow({ record }: { record: AttendanceRecord }) {
  const time = new Date(record.arrivedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-sm">
          {(record.studentName ?? "U").charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{record.studentName}</p>
          <p className="text-xs text-slate-400">
            {record.grade ?? "No grade"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-mono text-slate-500">{time}</p>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            record.notified
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {record.notified ? "Notified" : "Pending"}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const [statsRes, recRes] = await Promise.all([
        fetch("/api/attendance?mode=stats", {
          signal: controller.signal,
        }),
        fetch("/api/attendance", {
          signal: controller.signal,
        }),
      ]);

      if (!statsRes.ok || !recRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsRes.json();
      const recData = await recRes.json();

      setStats(statsData);
      setRecords(Array.isArray(recData) ? recData : []);
    } catch (err) {
      console.error("[DASHBOARD_LOAD_ERROR]", err);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const total = stats?.totalStudents ?? 0;
  const arrived = stats?.arrivedToday ?? 0;

  const pct = total > 0 ? Math.round((arrived / total) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good morning 👋</h1>
        <p className="text-slate-500 mt-1 text-sm">{today}</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Students"
            value={stats?.totalStudents ?? 0}
            icon={Users}
            color="bg-slate-700"
          />
          <StatCard
            label="Arrived Today"
            value={stats?.arrivedToday ?? 0}
            icon={CheckCircle}
            color="bg-emerald-500"
          />
          <StatCard
            label="Not Yet Arrived"
            value={stats?.pendingToday ?? 0}
            icon={Clock}
            color="bg-amber-500"
          />
          <StatCard
            label="Attendance Rate"
            value={`${pct}%`}
            icon={TrendingUp}
            color="bg-sky-500"
            sub="Today"
          />
        </div>
      )}

      {/* Progress bar */}
      {!loading && stats && stats.totalStudents > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-slate-700">Today's Arrival Progress</p>
            <p className="text-sm font-mono text-slate-500">
              {stats.arrivedToday}/{stats.totalStudents}
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-sky-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/scanner"
          className="flex items-center gap-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl p-5 transition-colors shadow-sm"
        >
          <QrCode className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Scan QR Code</p>
            <p className="text-sky-200 text-xs mt-0.5">Mark student arrival</p>
          </div>
        </Link>
        <Link
          href="/students"
          className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl p-5 transition-colors shadow-sm"
        >
          <Users className="w-6 h-6 text-slate-500 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Manage Students</p>
            <p className="text-slate-400 text-xs mt-0.5">Add, edit, remove</p>
          </div>
        </Link>
      </div>

      {/* Recent arrivals */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Recent Arrivals Today</h2>
          <Link href="/attendance" className="text-sky-600 text-xs font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="px-5">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : records.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-400 text-sm">No arrivals recorded yet today.</p>
              <Link
                href="/scanner"
                className="inline-block mt-3 text-sky-600 text-sm font-medium hover:underline"
              >
                Start scanning →
              </Link>
            </div>
          ) : (
            records.slice(0, 8).map((r) => <ArrivalRow key={r.id} record={r} />)
          )}
        </div>
      </div>
    </div>
  );
}
