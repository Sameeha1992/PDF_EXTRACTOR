import { injectable } from "tsyringe";
import { BaseRepository } from "./baserepository";
import { PdfModel, IPdfDocument } from "../database/mongodb/models/Pdf.model";

@injectable()
export class PdfRepository extends BaseRepository<IPdfDocument> {
  constructor() {
    super(PdfModel);
  }

  async findAll(): Promise<IPdfDocument[]> {
    return await PdfModel.find().sort({ createdAt: -1 });
  }

  async findByUserId(userId: string): Promise<IPdfDocument[]> {
    return await PdfModel.find({ userId }).sort({ createdAt: -1 });
  }
}