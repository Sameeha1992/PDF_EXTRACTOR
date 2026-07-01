import { Schema, model, Document, Types } from "mongoose";

export interface IGeneratedPdfDocument extends Document {
  userId: Types.ObjectId;
  originalPdfId: Types.ObjectId;
  originalName: string;
  filename: string;
  path: string;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
}

const generatedPdfSchema = new Schema<IGeneratedPdfDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalPdfId: {
      type: Schema.Types.ObjectId,
      ref: "Pdf",
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
  { timestamps: true },
);

// Index for fast per-user queries
generatedPdfSchema.index({ userId: 1, createdAt: -1 });

export const GeneratedPdfModel = model<IGeneratedPdfDocument>(
  "GeneratedPdf",
  generatedPdfSchema,
);
