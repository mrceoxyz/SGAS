import mongoose, { Schema, models, model } from "mongoose";

const StudentSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    className: {
      type: String,
      required: true,
    },

    qrCode: {
      type: String,
      required: true,
    },

    parentPhone: {
      type: String,
      required: true,
    },

    parentWhatsapp: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
    },

    notificationChannel: {
      type: String,
      enum: ["SMS", "WHATSAPP", "BOTH"],
      default: "SMS",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Student || model("Student", StudentSchema);