import { NextResponse } from "next/server";
import { studentsDB } from "@/lib/db";
import type { Student } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const student = studentsDB.getById(params.id);
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const existing = studentsDB.getById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated: Student = { ...existing, ...body, id: params.id };
  studentsDB.save(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ok = studentsDB.delete(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
