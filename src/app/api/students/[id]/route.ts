import { NextResponse } from "next/server";

import mongoose from "mongoose";

import { studentsDB } from "@/lib/db";

const ALLOWED_CHANNELS = [
  "SMS",
  "WHATSAPP",
  "BOTH",
];

interface RouteContext {
  params: {
    id: string;
  };
}

// ─────────────────────────────────────────────
// GET STUDENT
// ─────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // Validate MongoDB ObjectId

    if (
      !mongoose.Types.ObjectId.isValid(
        params.id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID",
        },
        {
          status: 400,
        }
      );
    }

    // Find student

    const student =
      await studentsDB.getById(
        params.id
      );

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error(
      "[GET_STUDENT_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch student",
      },
      {
        status: 500,
      }
    );
  }
}

// ─────────────────────────────────────────────
// UPDATE STUDENT
// ─────────────────────────────────────────────

export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  try {
    // Validate MongoDB ObjectId

    if (
      !mongoose.Types.ObjectId.isValid(
        params.id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID",
        },
        {
          status: 400,
        }
      );
    }

    // Find existing student

    const existing =
      await studentsDB.getById(
        params.id
      );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    // Parse request body

    const body =
      await req.json();

    const {
      fullName,
      className,
      parentPhone,
      parentWhatsapp,
      notificationChannel,
      photo,
    } = body;

    // Normalize notification channel

    let normalizedChannel =
      existing.notificationChannel;

    if (notificationChannel) {
      normalizedChannel =
        String(
          notificationChannel
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
    }

    // Update student

    const updated =
      await studentsDB.save({
        _id: existing._id,

        studentId:
          existing.studentId,

        qrCode:
          existing.qrCode,

        fullName:
          fullName?.trim() ||
          existing.fullName,

        className:
          className?.trim() ||
          existing.className,

        parentPhone:
          parentPhone?.trim() ||
          existing.parentPhone,

        parentWhatsapp:
          parentWhatsapp?.trim() ||
          existing.parentWhatsapp,

        notificationChannel:
          normalizedChannel,

        photo:
          photo ??
          existing.photo,
      });

    return NextResponse.json({
      success: true,
      student: updated,
    });
  } catch (error) {
    console.error(
      "[UPDATE_STUDENT_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update student",
      },
      {
        status: 500,
      }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE STUDENT
// ─────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // Validate MongoDB ObjectId

    if (
      !mongoose.Types.ObjectId.isValid(
        params.id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID",
        },
        {
          status: 400,
        }
      );
    }

    // Delete student

    const deleted =
      await studentsDB.delete(
        params.id
      );

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Student deleted successfully",
    });
  } catch (error) {
    console.error(
      "[DELETE_STUDENT_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to delete student",
      },
      {
        status: 500,
      }
    );
  }
}