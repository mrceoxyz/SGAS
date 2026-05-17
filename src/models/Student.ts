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

    parentName: {
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
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();

        delete ret._id;

        delete ret.__v;
      },
    }
  }
);

export default models.Student || model("Student", StudentSchema);