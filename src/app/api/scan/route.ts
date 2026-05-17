import { NextResponse } from "next/server";

import {
  studentsDB,
  attendanceDB,
} from "@/lib/db";

import { sendNotifications } from "@/lib/notify";

import type {
  AttendanceRecord,
  ScanResult,
} from "@/lib/types";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const { studentId } = body;

    // ─────────────────────────────
    // Validate request
    // ─────────────────────────────

    if (!studentId) {
      return NextResponse.json(
        {
          error: "studentId is required",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────
    // Find student
    // ─────────────────────────────

    const student =
      await studentsDB.getById(
        studentId
      );

    if (!student) {
      return NextResponse.json(
        {
          error: "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    // ─────────────────────────────
    // Prevent duplicate attendance
    // ─────────────────────────────

    const existing =
      await attendanceDB.getByStudentToday(
        student._id.toString()
      );

    if (existing) {
      return NextResponse.json<ScanResult>({
        success: true,

        alreadyArrived: true,

        student,

        attendance: existing,

        notifications: [],
      });
    }

    // ─────────────────────────────
    // Create attendance record
    // ─────────────────────────────

    const arrivedAt = new Date();

    // ─────────────────────────────
    // Send notifications
    // ─────────────────────────────

    const notifications =
      await sendNotifications(
        student,
        arrivedAt
      );

    const anySuccess =
      notifications.some(
        (n) => n.success
      );

    // ─────────────────────────────
    // Save attendance
    // ─────────────────────────────

    const attendance =
      await attendanceDB.save({
        studentId: student._id,

        studentName: student.name,

        grade: student.grade,

        arrivedAt,

        attendanceDate:
          arrivedAt
            .toISOString()
            .split("T")[0],

        status: "PRESENT",

        notified: anySuccess,

        notificationChannel:
          student.notificationChannel ||
          "WHATSAPP",

        notificationError:
          anySuccess
            ? null
            : notifications
                .map((n) => n.error)
                .filter(Boolean)
                .join("; "),
      });

    // ─────────────────────────────
    // Response
    // ─────────────────────────────

    return NextResponse.json<ScanResult>({
      success: true,

      alreadyArrived: false,

      student,

      attendance,

      notifications,
    });
  } catch (error) {
    console.error(
      "[SCAN_API_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}