/**
 * Simple JSON file-based data store.
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */

import fs from "fs";
import path from "path";
import type { Student, AttendanceRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");

// ── Ensure data directory exists ────────────────────────────────────
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string, defaultValue: T): T {
  ensureDir();
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Students ─────────────────────────────────────────────────────────
export const studentsDB = {
  getAll(): Student[] {
    return readJSON<Student[]>(STUDENTS_FILE, []);
  },

  getById(id: string): Student | undefined {
    return this.getAll().find((s) => s.id === id);
  },

  save(student: Student): Student {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === student.id);
    if (idx >= 0) all[idx] = student;
    else all.push(student);
    writeJSON(STUDENTS_FILE, all);
    return student;
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((s) => s.id !== id);
    if (filtered.length === all.length) return false;
    writeJSON(STUDENTS_FILE, filtered);
    return true;
  },
};

// ── Attendance ────────────────────────────────────────────────────────
export const attendanceDB = {
  getAll(): AttendanceRecord[] {
    return readJSON<AttendanceRecord[]>(ATTENDANCE_FILE, []);
  },

  getToday(): AttendanceRecord[] {
    const today = new Date().toISOString().split("T")[0];
    return this.getAll().filter((r) => r.arrivedAt.startsWith(today));
  },

  getByStudentToday(studentId: string): AttendanceRecord | undefined {
    const today = new Date().toISOString().split("T")[0];
    return this.getAll().find(
      (r) => r.studentId === studentId && r.arrivedAt.startsWith(today)
    );
  },

  save(record: AttendanceRecord): AttendanceRecord {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === record.id);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    writeJSON(ATTENDANCE_FILE, all);
    return record;
  },

  getRecent(limit = 20): AttendanceRecord[] {
    return this.getAll()
      .sort((a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime())
      .slice(0, limit);
  },
};
