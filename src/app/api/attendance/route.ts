import { NextResponse } from "next/server";

import {
  attendanceDB,
  studentsDB,
} from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const mode =
      searchParams.get("mode");

    // ─────────────────────────────────────────────
    // Dashboard Stats
    // ─────────────────────────────────────────────

    if (mode === "stats") {
      const students =
        await studentsDB.getAll();

      const today =
        await attendanceDB.getToday();

      const recent =
        await attendanceDB.getRecent(1);

      const stats = {
        totalStudents:
          students.length,

        arrivedToday:
          today.length,

        pendingToday: Math.max(
          0,
          students.length - today.length
        ),

        lastScan:
          recent.length > 0
            ? recent[0]
            : null,
      };

      return NextResponse.json(stats);
    }

    // ─────────────────────────────────────────────
    // Today's Attendance Records
    // ─────────────────────────────────────────────

    const records =
      await attendanceDB.getToday();

    return NextResponse.json(records);
  } catch (error) {
    console.error(
      "[ATTENDANCE_API_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}