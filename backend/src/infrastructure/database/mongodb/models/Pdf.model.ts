import { Schema, model } from "mongoose";


import { Document } from "mongoose";

export interface IPdfDocument extends Document {
  originalName: string;
  filename: string;
  path: string;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
}


const pdfSchema = new Schema<IPdfDocument>(
  {
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

export const PdfModel = model("Pdf", pdfSchema);