"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  CheckCircle,
  MessageCircle,
  Phone,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import type { AttendanceRecord } from "@/lib/types";

function RecordRow({ record }: { record: AttendanceRecord }) {
  const time = new Date(record.arrivedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const date = new Date(record.arrivedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-sm shrink-0">
            {record.studentName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{record.studentName}</p>
            <p className="text-xs text-slate-400">{record.grade}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div>
          <p className="text-sm font-mono text-slate-700">{time}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {record.notified ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium capitalize">
              {record.notificationChannel ?? "Sent"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-600 font-medium">Failed</span>
          </div>
        )}
        {record.notificationError && (
          <p className="text-[10px] text-red-400 mt-0.5 max-w-xs truncate" title={record.notificationError}>
            {record.notificationError}
          </p>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 text-slate-400">
          {record.notificationChannel === "whatsapp" ? (
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
          ) : record.notificationChannel === "sms" ? (
            <Phone className="w-3.5 h-3.5 text-sky-500" />
          ) : (
            <>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <Phone className="w-3.5 h-3.5 text-sky-500" />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance");
      setRecords(await res.json());
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifiedCount = records.filter((r) => r.notified).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Log</h1>
          <p className="text-slate-400 text-sm mt-0.5">{today}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-sm font-medium text-slate-700">{records.length} Arrived</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">{notifiedCount} Notified</span>
        </div>
        {notifiedCount < records.length && (
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-slate-700">
              {records.length - notifiedCount} Failed
            </span>
          </div>
        )}
        <div className="ml-auto text-xs text-slate-400 flex items-center">
          Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && records.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium text-sm">No arrivals recorded today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Arrived
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Channel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <RecordRow key={r.id} record={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
