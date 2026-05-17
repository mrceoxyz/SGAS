"use client";

import { useState } from "react";

import {
  X,
  Save,
  Loader2,
} from "lucide-react";

interface Student {
  id: any;
  _id: string;

  studentId: string;

  fullName: string;

  className: string;

  parentPhone: string;

  parentName: string;

  parentWhatsapp?: string;

  notificationChannel:
    | "SMS"
    | "WHATSAPP"
    | "BOTH";

  photo?: string;
}

interface StudentFormProps {
  student?: Student;

  onClose: () => void;

  onSaved: (
    student: Student
  ) => void;
}

const CLASSES = [
  "Nursery 1",
  "Nursery 2",

  "KG 1",
  "KG 2",

  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",

  "Grade 5",
  "Grade 6",

  "JSS 1",
  "JSS 2",
  "JSS 3",

  "SS 1",
  "SS 2",
  "SS 3",
];

export default function StudentForm({
  student,
  onClose,
  onSaved,
}: StudentFormProps) {
  const [form, setForm] =
    useState({
      fullName:
        student?.fullName ?? "",

      className:
        student?.className ?? "",

      parentPhone:
        student?.parentPhone ?? "",

      parentName:
        student?.parentName ?? "",

      parentWhatsapp:
        student?.parentWhatsapp ??
        "",

      notificationChannel:
        student?.notificationChannel ??
        "WHATSAPP",

      photo:
        student?.photo ?? "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);

  const set = (
    field: string,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  const uploadPhoto = async () => {
  if (!photoFile) return null;

  setUploading(true);

  const formData = new FormData();
  formData.append("file", photoFile);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  setUploading(false);

  return data.url;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const photoUrl = await uploadPhoto();

    const payload = {
      ...form,
      photo: photoUrl || student?.photo || "",
    };

    const url = student
      ? `/api/students/${student._id}`
      : "/api/students";

    const method = student ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save student");
      return;
    }

    onSaved(data.student || data);
  } catch {
    setError("Upload failed or network error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-slide-up">

        {/* Header */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-base font-semibold text-slate-900">
            {student
              ? "Edit Student"
              : "Add Student"}
          </h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4 px-6 py-5"
        >
          {/* Full Name */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Student Full Name *
            </label>

            <input
              required
              type="text"
              value={
                form.fullName
              }
              onChange={(e) =>
                set(
                  "fullName",
                  e.target.value
                )
              }
              placeholder="e.g. Amina Musa"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Student Photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhotoFile(e.target.files?.[0] || null)
              }
              className="w-full text-sm"
            />

            {uploading && (
              <p className="text-xs text-slate-400 mt-1">
                Uploading image...
              </p>
            )}
          </div>

          {/* Class */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Class *
            </label>

            <select
              required
              value={
                form.className
              }
              onChange={(e) =>
                set(
                  "className",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value="">
                Select class
              </option>

              {CLASSES.map(
                (cls) => (
                  <option
                    key={cls}
                    value={cls}
                  >
                    {cls}
                  </option>
                )
              )}
            </select>
          </div>

          <hr className="border-slate-100" />

          {/* Parent Phone */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Parent/Guardian's Phone Number *
            </label>

            <input
              required
              type="tel"
              value={
                form.parentPhone
              }
              onChange={(e) =>
                set(
                  "parentPhone",
                  e.target.value
                )
              }
              placeholder="+2348012345678"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          {/* Parent Name */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Parent/Guardian's Full Name *
            </label>

            <input
              required
              type="text"
              value={
                form.parentName
              }
              onChange={(e) =>
                set(
                  "parentName",
                  e.target.value
                )
              }
              placeholder="e.g. Mrs. Mariam Adekunle"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          {/* WhatsApp */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              WhatsApp Number
            </label>

            <input
              type="tel"
              value={
                form.parentWhatsapp
              }
              onChange={(e) =>
                set(
                  "parentWhatsapp",
                  e.target.value
                )
              }
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          {/* Notification */}

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Notification Channel
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                "WHATSAPP",
                "SMS",
                "BOTH",
              ].map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() =>
                    set(
                      "notificationChannel",
                      channel
                    )
                  }
                  className={`rounded-xl border py-2.5 text-xs font-medium transition-all ${
                    form.notificationChannel ===
                    channel
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:border-sky-300"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {student
                ? "Update"
                : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}