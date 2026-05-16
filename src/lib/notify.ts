import twilio from "twilio";
import type { Student, NotificationResult } from "./types";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const smsFrom = process.env.TWILIO_SMS_FROM!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!;
const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "Your School";

function buildMessage(student: Student, arrivedAt: Date): string {
  const time = arrivedAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return (
    `✅ *${schoolName} Arrival Alert*\n\n` +
    `Hi ${student.parentName}, this is an automated message to let you know that ` +
    `*${student.name}* (${student.grade}) has safely arrived at school at *${time}* today.\n\n` +
    `_This message was sent automatically by the school attendance system._`
  );
}

export async function sendNotifications(
  student: Student,
  arrivedAt: Date
): Promise<NotificationResult[]> {
  // If credentials aren't configured, return a mock success for development
  if (!accountSid || !authToken || accountSid.startsWith("AC_your")) {
    console.warn("[notify] Twilio not configured – notification skipped (dev mode)");
    return [{ success: true, channel: "dev-mock", messageSid: "MOCK_SID" }];
  }

  const client = twilio(accountSid, authToken);
  const message = buildMessage(student, arrivedAt);
  const results: NotificationResult[] = [];
  const channel = student.notificationChannel;

  const toPhone = student.parentPhone;
  const toWhatsApp = `whatsapp:${student.parentWhatsApp ?? student.parentPhone}`;

  // ── SMS ──────────────────────────────────────────────────────────
  if (channel === "sms" || channel === "both") {
    try {
      const msg = await client.messages.create({
        body: message.replace(/\*/g, ""), // Strip markdown for plain SMS
        from: smsFrom,
        to: toPhone,
      });
      results.push({ success: true, channel: "sms", messageSid: msg.sid });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ success: false, channel: "sms", error });
      console.error("[notify] SMS failed:", error);
    }
  }

  // ── WhatsApp ─────────────────────────────────────────────────────
  if (channel === "whatsapp" || channel === "both") {
    try {
      const msg = await client.messages.create({
        body: message,
        from: whatsappFrom,
        to: toWhatsApp,
      });
      results.push({ success: true, channel: "whatsapp", messageSid: msg.sid });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ success: false, channel: "whatsapp", error });
      console.error("[notify] WhatsApp failed:", error);
    }
  }

  return results;
}
