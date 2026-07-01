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
  getPdfs(): Promise<GetPdfsResponseDto[]>;
  getPdfPages(id: string): Promise<GetPdfPagesResponseDto>;
  extractPages(dto: ExtractPdfDto): Promise<ExtractPdfResponseDto>;
  getGeneratedPdfs(userId: string): Promise<GetGeneratedPdfsResponseDto[]>;
  deletePdf(id: string): Promise<DeletePdfResponseDto>;
}
