import { connectDB } from "./mongodb";

import Student from "@/models/Student";
import Attendance from "@/models/Attendance";

// ─────────────────────────────────────────────────────────────
// Students
// ─────────────────────────────────────────────────────────────

export const studentsDB = {
  async getAll() {
    await connectDB();

    return Student.find().sort({
      createdAt: -1,
    });
  },

  async getById(id: string) {
    await connectDB();

    return Student.findById(id);
  },

  async save(student: any) {
    await connectDB();

    if (student._id) {
      return Student.findByIdAndUpdate(
        student._id,
        student,
        { new: true }
      );
    }

    return Student.create(student);
  },

  async delete(id: string) {
    await connectDB();

    const deleted = await Student.findByIdAndDelete(id);

    return !!deleted;
  },
};

// ─────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────

export const attendanceDB = {
  async getAll() {
    await connectDB();

    return Attendance.find()
      .populate("studentId")
      .sort({
        arrivedAt: -1,
      });
  },

  async getToday() {
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return Attendance.find({
    arrivedAt: {
      $gte: start,
      $lte: end,
    },
  })
    .populate("studentId")
    .sort({
      arrivedAt: -1,
    });
  },

  async getByStudentToday(studentId: string) {
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return Attendance.findOne({
      studentId,
      arrivedAt: {
        $gte: start,
        $lte: end,
      },
    });
  },

  async save(record: any) {
    await connectDB();

    if (record._id) {
      return Attendance.findByIdAndUpdate(
        record._id,
        record,
        { new: true }
      );
    }

    return Attendance.create(record);
  },

  async getRecent(limit = 20) {
    await connectDB();

    return Attendance.find()
      .populate("studentId")
      .sort({
        arrivedAt: -1,
      })
      .limit(limit);
  },
};