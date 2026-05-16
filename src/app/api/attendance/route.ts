import { NextResponse } from "next/server";
import { attendanceDB, studentsDB } from "@/lib/db";
import type { DashboardStats } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  if (mode === "stats") {
    const students = studentsDB.getAll();
    const today = attendanceDB.getToday();
    const recent = attendanceDB.getRecent(1);

    const stats: DashboardStats = {
      totalStudents: students.length,
      arrivedToday: today.length,
      pendingToday: Math.max(0, students.length - today.length),
      lastScan: recent[0],
    };
    return NextResponse.json(stats);
  }

  const records = attendanceDB.getToday();
  return NextResponse.json(records.sort(
    (a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime()
  ));
}
