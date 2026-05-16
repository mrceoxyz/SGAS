import { NextResponse } from "next/server";
import { studentsDB } from "@/lib/db";
import type { Student } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const students = studentsDB.getAll();
    return NextResponse.json(students);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, grade, parentName, parentPhone, parentWhatsApp, notificationChannel } = body;

    if (!name || !grade || !parentName || !parentPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student: Student = {
      id: uuidv4(),
      name: name.trim(),
      grade: grade.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentWhatsApp: parentWhatsApp?.trim() || undefined,
      notificationChannel: notificationChannel ?? "whatsapp",
      createdAt: new Date().toISOString(),
    };

    studentsDB.save(student);
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
