import { injectable } from "tsyringe";
import { BaseRepository } from "./baserepository";
import {
  GeneratedPdfModel,
  IGeneratedPdfDocument,
} from "../database/mongodb/models/GeneratedPdf.model";

@injectable()
export class GeneratedPdfRepository extends BaseRepository<IGeneratedPdfDocument> {
  constructor() {
    super(GeneratedPdfModel);
  }

  async findByUserId(userId: string): Promise<IGeneratedPdfDocument[]> {
    return GeneratedPdfModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean<IGeneratedPdfDocument[]>();
  }
}
