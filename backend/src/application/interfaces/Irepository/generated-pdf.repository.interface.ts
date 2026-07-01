import { IGeneratedPdf } from "../../../domain/entities/generated-pdf.entity";

export interface IGeneratedPdfRepository {
  create(doc: IGeneratedPdf): Promise<IGeneratedPdf>;
  findByUserId(userId: string): Promise<IGeneratedPdf[]>;
}
