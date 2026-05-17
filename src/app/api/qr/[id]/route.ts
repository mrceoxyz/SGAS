import { NextResponse } from "next/server";

import QRCode from "qrcode";

import { studentsDB } from "@/lib/db";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // ─────────────────────────────────────────────
    // Find student
    // ─────────────────────────────────────────────

    const student = 
      await studentsDB.getById(
        params.id
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

    // ─────────────────────────────────────────────
    // QR Payload
    // ─────────────────────────────────────────────

    /**
     * Better than storing only the ID.
     * Allows future expansion.
     */

    const qrPayload = JSON.stringify({
      studentId:
        student._id.toString(),

      studentCode:
        student.studentId,

      name:
        student.fullName,
    });

    // ─────────────────────────────────────────────
    // Generate QR PNG
    // ─────────────────────────────────────────────

    const pngBuffer =
      await QRCode.toBuffer(
        qrPayload,
        {
          type: "png",

          width: 400,

          margin: 2,

          errorCorrectionLevel: "H",

          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        }
      );

    // ─────────────────────────────────────────────
    // Filename
    // ─────────────────────────────────────────────

    const fileName =
      student.fullName.replace(
        /\s+/g,
        "_"
      );

    // ─────────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────────

    return new NextResponse(
      pngBuffer as BodyInit,
      {
        headers: {
          "Content-Type":
            "image/png",

          "Cache-Control":
            "public, max-age=86400",

          "Content-Disposition":
            `inline; filename="${fileName}_qr.png"`,
        },
      }
    );
  } catch (error) {
    console.error(
      "[QR_GENERATION_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate QR code",
      },
      {
        status: 500,
      }
    );
  }
}