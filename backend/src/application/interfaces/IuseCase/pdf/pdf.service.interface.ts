import {
  UploadPdfDto,
  UploadPdfResponseDto,
  GetPdfsResponseDto,
  GetPdfPagesResponseDto,
  ExtractPdfDto,
  ExtractPdfResponseDto,
  GetGeneratedPdfsResponseDto,
  DeletePdfResponseDto,
} from "../../../dtos/pdf/upload.pdf.dto";

export interface IPdfService {
  uploadPdf(dto: UploadPdfDto): Promise<UploadPdfResponseDto>;
  getPdfs(userId: string): Promise<GetPdfsResponseDto[]>;
  getPdfPages(id: string, userId: string): Promise<GetPdfPagesResponseDto>;
  extractPages(dto: ExtractPdfDto): Promise<ExtractPdfResponseDto>;
  getGeneratedPdfs(userId: string): Promise<GetGeneratedPdfsResponseDto[]>;
  deletePdf(id: string, userId: string): Promise<DeletePdfResponseDto>;
  deleteGeneratedPdf(id: string, userId: string): Promise<{ id: string }>;
}
