"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { Student } from "@/lib/types";

interface StudentFormProps {
  student?: Student;
  onClose: () => void;
  onSaved: (student: Student) => void;
}

const GRADES = [
  "Nursery 1", "Nursery 2",
  "KG 1", "KG 2",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7", "Grade 8",
  "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "JSS 1", "JSS 2", "JSS 3",
  "SS 1", "SS 2", "SS 3",
];

export default function StudentForm({ student, onClose, onSaved }: StudentFormProps) {
  const [form, setForm] = useState({
    name: student?.name ?? "",
    grade: student?.grade ?? "",
    parentName: student?.parentName ?? "",
    parentPhone: student?.parentPhone ?? "",
    parentWhatsApp: student?.parentWhatsApp ?? "",
    notificationChannel: student?.notificationChannel ?? "whatsapp",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = student ? `/api/students/${student.id}` : "/api/students";
      const method = student ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save student.");
        return;
      }

      const saved: Student = await res.json();
      onSaved(saved);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-semibold text-slate-900 text-base">
            {student ? "Edit Student" : "Add New Student"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Student name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Amara Johnson"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Grade / Class *
            </label>
            <select
              required
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition bg-white"
            >
              <option value="">Select grade…</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <hr className="border-slate-100" />

          {/* Parent name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Parent / Guardian Name *
            </label>
            <input
              type="text"
              required
              value={form.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              placeholder="e.g. Mrs. Johnson"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
            />
          </div>

          {/* Parent phone */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Phone Number * <span className="text-slate-300">(E.164 format)</span>
            </label>
            <input
              type="tel"
              required
              value={form.parentPhone}
              onChange={(e) => set("parentPhone", e.target.value)}
              placeholder="+2348012345678"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">Include country code, e.g. +234 for Nigeria</p>
          </div>

          {/* WhatsApp (optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              WhatsApp Number <span className="text-slate-300">(if different)</span>
            </label>
            <input
              type="tel"
              value={form.parentWhatsApp}
              onChange={(e) => set("parentWhatsApp", e.target.value)}
              placeholder="Same as phone if blank"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
            />
          </div>

          {/* Notification channel */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              Notify Parent Via *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["whatsapp", "sms", "both"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => set("notificationChannel", ch)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                    form.notificationChannel === ch
                      ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-sky-300"
                  }`}
                >
                  {ch === "both" ? "Both" : ch === "whatsapp" ? "WhatsApp" : "SMS"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {student ? "Update" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
