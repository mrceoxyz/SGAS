import { NextResponse } from "next/server";

import mongoose from "mongoose";

import {
  attendanceDB,
  studentsDB,
} from "@/lib/db";

import { sendNotifications }
  from "@/lib/notify";

export async function POST(
  req: Request
) {
  try {
    // ─────────────────────────────────────────────
    // Parse request body
    // ─────────────────────────────────────────────

    const body = await req.json();

    let studentId: string | undefined;

    /**
     * Supports:
     *
     * {
     *   studentId: "..."
     * }
     *
     * OR full QR payload:
     *
     * {
     *   qrData: "{...}"
     * }
     */

    if (body.studentId) {
      studentId = body.studentId;
    }

    if (body.qrData) {
      try {
        const parsed =
          JSON.parse(body.qrData);

        studentId =
          parsed.studentId;
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid QR code format",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ─────────────────────────────────────────────
    // Validate student ID
    // ─────────────────────────────────────────────

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "studentId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid student ID",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Find student
    // ─────────────────────────────────────────────

    const student =
      await studentsDB.getById(
        studentId
      );

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Prevent duplicate scans
    // ─────────────────────────────────────────────

    const existing =
      await attendanceDB.getByStudentToday(
        student._id.toString()
      );

    if (existing) {
      return NextResponse.json({
        success: true,

        alreadyArrived: true,

        message:
          "Student already scanned today",

        student,

        attendance: existing,

        notifications: [],
      });
    }

    // ─────────────────────────────────────────────
    // Attendance timestamp
    // ─────────────────────────────────────────────

    const arrivedAt =
      new Date();

    // ─────────────────────────────────────────────
    // Send notifications
    // ─────────────────────────────────────────────

    let notifications: any[] = [];

    try {
      notifications =
        await sendNotifications(
          student,
          arrivedAt
        );
    } catch (notificationError) {
      console.error(
        "[NOTIFICATION_ERROR]",
        notificationError
      );
    }

    const anySuccess =
      notifications.some(
        (notification: any) =>
          notification.success
      );

    // ─────────────────────────────────────────────
    // Save attendance
    // ─────────────────────────────────────────────

    const attendance =
      await attendanceDB.save({
        studentId:
          student._id,

        status:
          "PRESENT",

        arrivedAt,

        notified:
          anySuccess,

        notificationChannel:
          student.notificationChannel ||
          "WHATSAPP",

        notificationError:
          anySuccess
            ? null
            : notifications
                .map(
                  (n: any) => n.error
                )
                .filter(Boolean)
                .join("; "),
      });

    // ─────────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────────

    return NextResponse.json({
      success: true,

      alreadyArrived: false,

      message:
        "Attendance recorded successfully",

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