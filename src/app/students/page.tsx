"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import dynamic from "next/dynamic";

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

const StudentForm = dynamic(
  () =>
    import(
      "@/components/StudentForm"
    ),
  {
    ssr: false,
  }
);



interface Student {
  id: any;
  _id: string;

  studentId: string;

  fullName: string;

  className: string;

  parentPhone: string;

  parentWhatsapp?: string;

  parentName: string;

  notificationChannel:
    | "SMS"
    | "WHATSAPP"
    | "BOTH";

  photo?: string;
}

// ─────────────────────────────────────────────
// QR MODAL
// ─────────────────────────────────────────────

function QRModal({
  student,
  onClose,
}: {
  student: Student;

  onClose: () => void;
}) {
  const src =
    `/api/qr/${student.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl animate-slide-up">

        <h3 className="mb-1 font-semibold text-slate-900">
          {student.fullName}
        </h3>

        <p className="mb-5 text-xs text-slate-400">
          {student.className}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}

        <img
          src={src}
          alt="QR Code"
          className="mx-auto h-52 w-52 rounded-xl border border-slate-100"
        />

        <p className="mb-5 mt-3 text-[11px] text-slate-400">
          Print and attach this QR
          code to the student's bag
          or ID card.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600"
          >
            Close
          </button>

          <a
            href={src}
            download={`${student.fullName.replace(
              /\s+/g,
              "_"
            )}_qr.png`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"
          >
            <Download className="h-4 w-4" />

            Download
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT CARD
// ─────────────────────────────────────────────

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
    student.notificationChannel ===
    "WHATSAPP" ? (
      <MessageCircle className="h-3 w-3 text-emerald-600" />
    ) : student.notificationChannel ===
      "SMS" ? (
      <Phone className="h-3 w-3 text-sky-600" />
    ) : (
      <span className="text-[10px] font-medium text-purple-600">
        BOTH
      </span>
    );

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">

      <div className="mb-3 flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sky-700 font-semibold">
                {student.fullName.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              {student.fullName}
            </p>

            <p className="text-xs text-slate-400">
              {student.className}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">

          <button
            onClick={onQR}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600"
          >
            <QrCode className="h-4 w-4" />
          </button>

          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-50 pt-3 text-xs text-slate-500">

        <div className="flex items-center justify-between">
          <p className="font-medium">
            {student.parentName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono">
            {student.parentPhone}
          </p>

          {channelIcon}
        </div>
      </div>

      <button
        onClick={onQR}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
      >
        <QrCode className="h-3.5 w-3.5" />

        View QR Code
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function StudentsPage() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editStudent,
    setEditStudent,
  ] = useState<
    Student | undefined
  >();

  const [qrStudent, setQrStudent] =
    useState<Student | null>(
      null
    );

  // Load students

  const load = useCallback(
    async () => {
      try {
        const res =
          await fetch(
            "/api/students"
          );

        const data =
          await res.json();

        setStudents(
          data.students || data
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Delete

  const handleDelete =
    async (
      student: Student
    ) => {
      const confirmed =
        confirm(
          `Delete ${student.fullName}?`
        );

      if (!confirmed) return;

      await fetch(
        `/api/students/${student._id}`,
        {
          method: "DELETE",
        }
      );

      setStudents((prev) =>
        prev.filter(
          (s) =>
            s._id !==
            student._id
        )
      );
    };

  // Save

  const handleSaved = (
    saved: Student
  ) => {
    setStudents((prev) => {
      const idx =
        prev.findIndex(
          (s) =>
            s._id ===
            saved._id
        );

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

  // Search

  const filtered =
    students.filter(
      (student) =>
        student.fullName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        student.className
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        student.parentPhone.includes(
          search
        )
    );

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Students
          </h1>

          <p className="mt-0.5 text-sm text-slate-400">
            {students.length}{" "}
            registered student
            {students.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setEditStudent(
              undefined
            );

            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />

          Add Student
        </button>
      </div>

      {/* Search */}

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search students..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {/* Content */}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map(
            (_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-white p-4"
              />
            )
          )}
        </div>
      ) : filtered.length ===
        0 ? (
        <div className="py-20 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Users className="h-8 w-8 text-slate-300" />
          </div>

          <p className="font-medium text-slate-400">
            No students found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(
            (student) => (
              <StudentCard
                key={
                  student._id
                }
                student={
                  student
                }
                onEdit={() => {
                  setEditStudent(
                    student
                  );

                  setShowForm(
                    true
                  );
                }}
                onDelete={() =>
                  handleDelete(
                    student
                  )
                }
                onQR={() =>
                  setQrStudent(
                    student
                  )
                }
              />
            )
          )}
        </div>
      )}

      {/* Modals */}

      {showForm && (
        <StudentForm
          student={editStudent}
          onClose={() => {
            setShowForm(false);

            setEditStudent(
              undefined
            );
          }}
          onSaved={handleSaved}
        />
      )}

      {qrStudent && (
        <QRModal
          student={qrStudent}
          onClose={() =>
            setQrStudent(
              null
            )
          }
        />
      )}
    </div>
  );
}