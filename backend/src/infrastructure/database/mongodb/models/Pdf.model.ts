import { Schema, model, Document, Types } from "mongoose";

export interface IPdfDocument extends Document {
  userId: Types.ObjectId;
  originalName: string;
  filename: string;
  path: string;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
}


const pdfSchema = new Schema<IPdfDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // 👈 gives createdAt & updatedAt
  }
);

// Index for fast per-user queries
pdfSchema.index({ userId: 1, createdAt: -1 });

export const PdfModel = model<IPdfDocument>("Pdf", pdfSchema);