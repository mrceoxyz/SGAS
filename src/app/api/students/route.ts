import { NextResponse } from "next/server";

import { studentsDB } from "@/lib/db";

const ALLOWED_CHANNELS = [
  "SMS",
  "WHATSAPP",
  "BOTH",
];

export async function GET() {
  try {
    const students =
      await studentsDB.getAll();

    return NextResponse.json(
      students
    );
  } catch (error) {
    console.error(
      "[GET_STUDENTS_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch students",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      fullName,
      className,
      parentPhone,
      parentName,
      parentWhatsapp,
      notificationChannel,
      photo,
    } = body;

    // ─────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────

    if (
      !fullName ||
      !className ||
      !parentPhone
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "fullName, className and parentPhone are required",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Normalize notification channel
    // ─────────────────────────────────────────────

    const normalizedChannel =
      String(
        notificationChannel ||
          "WHATSAPP"
      ).toUpperCase();

    if (
      !ALLOWED_CHANNELS.includes(
        normalizedChannel
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid notification channel",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Generate student code
    // Example: STD-4821
    // ─────────────────────────────────────────────

    const studentCode =
      `STD-${Math.floor(
        1000 +
          Math.random() * 9000
      )}`;

    // ─────────────────────────────────────────────
    // Create student
    // ─────────────────────────────────────────────

    const student =
      await studentsDB.save({
        studentId:
          studentCode,

        fullName:
          fullName.trim(),

        className:
          className.trim(),

        parentPhone:
          parentPhone.trim(),

        parentName:
          parentName.trim(),

        parentWhatsapp:
          parentWhatsapp?.trim() ||
          parentPhone.trim(),

        notificationChannel:
          normalizedChannel,

        photo:
          photo || "",

        qrCode:
          studentCode,
      });

    // ─────────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        student,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "[CREATE_STUDENT_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create student",
      },
      {
        status: 500,
      }
    );
  }
}