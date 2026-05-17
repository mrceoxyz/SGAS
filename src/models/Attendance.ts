import { Schema, models, model } from "mongoose";

const AttendanceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      default: "PRESENT",
    },

    arrivedAt: {
      type: Date,
      default: Date.now,
    },

    notified: {
      type: Boolean,
      default: false,
    },

    notificationChannel: {
      type: String,
    },

    notificationError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Attendance ||
  model("Attendance", AttendanceSchema);