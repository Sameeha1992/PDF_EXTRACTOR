export interface UploadPdfDto {
  filename: string;
  originalName: string;
  path: string;
}

export interface UploadPdfResponseDto {
  filename: string;
  originalName: string;
  totalPages: number;
}

export interface GetPdfsResponseDto {
  _id: string;
  originalName: string;
  filename: string;
  totalPages: number;
  createdAt?: Date;
}

export interface PdfPageDto {
  pageNumber: number;
  imageUrl: string;
}

export interface GetPdfPagesResponseDto {
  _id: string;
  originalName: string;
  totalPages: number;
  pages: PdfPageDto[];
}

export interface ExtractPdfDto {
  userId: string;
  pdfId: string;
  selectedPages: number[];
}

export interface ExtractPdfResponseDto {
  id: string;
  filename: string;
  totalPages: number;
  downloadUrl: string;
}

export interface GetGeneratedPdfsResponseDto {
  _id: string;
  originalName: string;
  filename: string;
  totalPages: number;
  downloadUrl: string;
  createdAt: Date;
}

export interface DeletePdfResponseDto {
  id: string;
}

