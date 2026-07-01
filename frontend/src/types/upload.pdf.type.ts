export interface UploadPdfResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalName: string;
    totalPages: number;
  };
}

export interface PdfItem {
  _id: string;
  originalName: string;
  filename: string;
  totalPages: number;
  createdAt: string;
}

export interface GetPdfsResponse {
  success: boolean;
  message: string;
  data: PdfItem[];
}

export interface PdfPage {
  pageNumber: number;
  imageUrl: string;
}

export interface PdfPagesData {
  _id: string;
  originalName: string;
  totalPages: number;
  pages: PdfPage[];
}

export interface GetPdfPagesResponse {
  success: boolean;
  message: string;
  data: PdfPagesData;
}

export interface ExtractPdfResult {
  id: string;
  filename: string;
  totalPages: number;
  downloadUrl: string;
}

export interface ExtractPdfResponse {
  success: boolean;
  message: string;
  data: ExtractPdfResult;
}

export interface GeneratedPdfItem {
  _id: string;
  originalName: string;
  filename: string;
  totalPages: number;
  downloadUrl: string;
  createdAt: string;
}

export interface GetGeneratedPdfsResponse {
  success: boolean;
  message: string;
  data: GeneratedPdfItem[];
}