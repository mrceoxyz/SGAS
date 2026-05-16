import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { studentsDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const student = studentsDB.getById(params.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // The QR code value is just the student ID.
  // When scanned, the scanner POSTs this to /api/scan.
  const qrData = student.id;

  const pngBuffer = await QRCode.toBuffer(qrData, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#0c4a6e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  return new NextResponse(pngBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
      "Content-Disposition": `inline; filename="${student.name.replace(/\s+/g, "_")}_qr.png"`,
    },
  });
}
