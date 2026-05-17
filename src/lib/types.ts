export interface Student {
  photo: any;
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone: string;        // E.164 format e.g. +2348012345678
  parentWhatsApp?: string;    // If different from parentPhone
  notificationChannel: "sms" | "whatsapp" | "both";
  photoUrl?: string;
  createdAt: string;          // ISO date string
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  arrivedAt: string;           // ISO date string
  notified: boolean;
  notificationChannel?: string;
  notificationError?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  messageSid?: string;
  error?: string;
}

export interface ScanResult {
  student: Student;
  attendance: AttendanceRecord;
  alreadyArrived: boolean;
  notifications: NotificationResult[];
}

export interface DashboardStats {
  totalStudents: number;
  arrivedToday: number;
  pendingToday: number;
  lastScan?: AttendanceRecord;
}
