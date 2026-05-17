import { NextResponse } from "next/server";
import { studentsDB, attendanceDB } from "@/lib/db";
import { sendNotifications } from "@/lib/notify";
import type { AttendanceRecord, ScanResult } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();
    alert(studentId)

    // return NextResponse.json({ studentId });
    // if (!studentId) {
    //   return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    // }

    // // 1. Look up the student
    // const student = await studentsDB.getById(studentId);
    // if (!student) {
    //   return NextResponse.json({ error: "Student not found" }, { status: 404 });
    // }

    // // 2. Check if already marked today
    // const existing = await attendanceDB.getByStudentToday(studentId);
    // if (existing) {
    //   return NextResponse.json<ScanResult>({
    //     student,
    //     attendance: existing,
    //     alreadyArrived: true,
    //     notifications: [],
    //   });
    // }

    // // 3. Create attendance record
    // const arrivedAt = new Date();
    // const record: AttendanceRecord = {
    //   id: crypto.randomUUID(),
    //   studentId: student.id,
    //   studentName: student.name,
    //   grade: student.grade,
    //   arrivedAt: arrivedAt.toISOString(),
    //   notified: false,
    // };

    // // 4. Send notifications
    // const notifications = await sendNotifications(student, arrivedAt);
    // const anySuccess = notifications.some((n) => n.success);

    // record.notified = anySuccess;
    // record.notificationChannel = student.notificationChannel;
    // if (!anySuccess) {
    //   record.notificationError = notifications.map((n) => n.error).join("; ");
    // }

    // await attendanceDB.save(record);

    // return NextResponse.json<ScanResult>({
    //   student,
    //   attendance: record,
    //   alreadyArrived: false,
    //   notifications,
    // });
  } catch (err) {
    console.error("[scan] Error:", err);
    return NextResponse.json({ error: "Internal server error!!!" }, { status: 500 });
  }
}
