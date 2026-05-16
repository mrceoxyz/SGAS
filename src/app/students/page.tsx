"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  QrCode,
  Pencil,
  Trash2,
  Download,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import type { Student } from "@/lib/types";
import dynamic from "next/dynamic";

const StudentForm = dynamic(() => import("@/components/StudentForm"), { ssr: false });

function QRModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const src = `/api/qr/${student.id}`;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-xs w-full text-center animate-slide-up">
        <h3 className="font-semibold text-slate-900 mb-1">{student.name}</h3>
        <p className="text-xs text-slate-400 mb-5">{student.grade}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="QR Code" className="w-52 h-52 mx-auto rounded-xl border border-slate-100" />
        <p className="text-[11px] text-slate-400 mt-3 mb-5">
          Print and attach this QR to the student's bag or ID tag.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm"
          >
            Close
          </button>
          <a
            href={src}
            download={`${student.name.replace(/\s+/g, "_")}_qr.png`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

function StudentCard({
  student,
  onEdit,
  onDelete,
  onQR,
}: {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onQR: () => void;
}) {
  const channelIcon =
    student.notificationChannel === "whatsapp" ? (
      <MessageCircle className="w-3 h-3 text-emerald-600" />
    ) : student.notificationChannel === "sms" ? (
      <Phone className="w-3 h-3 text-sky-600" />
    ) : (
      <span className="text-[10px] text-purple-600 font-medium">Both</span>
    );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">{student.name}</p>
            <p className="text-xs text-slate-400">{student.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onQR}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-slate-500 border-t border-slate-50 pt-3">
        <p className="font-medium text-slate-600">{student.parentName}</p>
        <div className="flex items-center justify-between">
          <p className="font-mono">{student.parentPhone}</p>
          <div className="flex items-center gap-1">{channelIcon}</div>
        </div>
      </div>

      <button
        onClick={onQR}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-500 rounded-xl text-xs font-medium transition-colors"
      >
        <QrCode className="w-3.5 h-3.5" />
        View QR Code
      </button>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | undefined>();
  const [qrStudent, setQrStudent] = useState<Student | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      setStudents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (student: Student) => {
    if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    await fetch(`/api/students/${student.id}`, { method: "DELETE" });
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
  };

  const handleSaved = (saved: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditStudent(undefined);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {students.length} student{students.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => {
            setEditStudent(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, grade, or parent…"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent transition bg-white"
        />
      </div>

      {/* Student grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">
            {search ? "No students match your search." : "No students added yet."}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Add First Student
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={() => {
                setEditStudent(student);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(student)}
              onQR={() => setQrStudent(student)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <StudentForm
          student={editStudent}
          onClose={() => {
            setShowForm(false);
            setEditStudent(undefined);
          }}
          onSaved={handleSaved}
        />
      )}

      {qrStudent && (
        <QRModal student={qrStudent} onClose={() => setQrStudent(null)} />
      )}
    </div>
  );
}
