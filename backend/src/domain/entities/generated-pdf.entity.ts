export interface IGeneratedPdf {
  userId: string;
  originalPdfId: string;
  originalName: string;
  filename: string;
  path: string;
  totalPages: number;
  createdAt?: Date;
}
