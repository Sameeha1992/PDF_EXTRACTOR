import fs from "fs";
import path from "path";
import { inject, injectable } from "tsyringe";
import {
  UploadPdfDto,
  UploadPdfResponseDto,
  GetPdfsResponseDto,
  GetPdfPagesResponseDto,
  PdfPageDto,
  ExtractPdfDto,
  ExtractPdfResponseDto,
  GetGeneratedPdfsResponseDto,
  DeletePdfResponseDto,
} from "../../dtos/pdf/upload.pdf.dto";
import { IPdfService } from "../../interfaces/IuseCase/pdf/pdf.service.interface";
import { PDFDocument } from "pdf-lib";
import { IPdf } from "../../../domain/entities/pdf.entity";
import { IPdfRepository } from "../../interfaces/Irepository/pdf.repository.interface";
import { IGeneratedPdfRepository } from "../../interfaces/Irepository/generated-pdf.repository.interface";
import { ThumbnailService } from "../../../infrastructure/services/thumbnail.service";

const STATIC_BASE_URL = process.env.STATIC_BASE_URL;

@injectable()
export class PdfService implements IPdfService {
  constructor(
    @inject("IPdfRepository") private _ipdfRepository: IPdfRepository,
    @inject("IGeneratedPdfRepository")
    private _iGeneratedPdfRepository: IGeneratedPdfRepository,
  ) {}

  // ── Upload ────────────────────────────────────────────────────────────────

  async uploadPdf(dto: UploadPdfDto): Promise<UploadPdfResponseDto> {
    const pdfBytes = fs.readFileSync(dto.path);
    const pdfDocument = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDocument.getPageCount();

    const pdfEntity: IPdf = {
      userId: dto.userId,
      originalName: dto.originalName,
      filename: dto.filename,
      path: dto.path,
      totalPages,
    };

    await this._ipdfRepository.create(pdfEntity);
    return { filename: dto.filename, originalName: dto.originalName, totalPages };
  }

  // ── List uploaded PDFs ────────────────────────────────────────────────────

  async getPdfs(userId: string): Promise<GetPdfsResponseDto[]> {
    const pdfs = await this._ipdfRepository.findByUserId(userId);

    return pdfs.map((pdf) => ({
      _id: (pdf as any)._id?.toString(),
      originalName: pdf.originalName,
      filename: pdf.filename,
      totalPages: pdf.totalPages,
      createdAt: pdf.createdAt,
    }));
  }

  // ── Page thumbnails ───────────────────────────────────────────────────────

  async getPdfPages(id: string, userId: string): Promise<GetPdfPagesResponseDto> {
    const pdf = await this._ipdfRepository.findById(id);
    if (!pdf || pdf.userId.toString() !== userId) throw new Error("PDF not found");

    const pdfId = (pdf as any)._id?.toString() as string;

    if (!ThumbnailService.thumbnailsExist(pdfId, pdf.totalPages)) {
      await ThumbnailService.generateThumbnails(pdf.path, pdfId);
    }

    const pages: PdfPageDto[] = Array.from({ length: pdf.totalPages }, (_, i) => ({
      pageNumber: i + 1,
      imageUrl: `${STATIC_BASE_URL}/uploads/pdf-pages/${pdfId}/page-${i + 1}.png`,
    }));

    return {
      _id: pdfId,
      originalName: pdf.originalName,
      totalPages: pdf.totalPages,
      pages,
    };
  }

  // ── Extract selected pages ────────────────────────────────────────────────

  async extractPages(dto: ExtractPdfDto): Promise<ExtractPdfResponseDto> {
    const { userId, pdfId, selectedPages } = dto;

    if (!selectedPages || selectedPages.length === 0) {
      throw new Error("No pages selected");
    }

    const pdf = await this._ipdfRepository.findById(pdfId);
    if (!pdf || pdf.userId.toString() !== userId) throw new Error("PDF not found");

    if (!fs.existsSync(pdf.path)) {
      throw new Error("Source PDF file not found on disk");
    }

    const duplicates = selectedPages.filter((p, i) => selectedPages.indexOf(p) !== i);
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate page numbers found: ${[...new Set(duplicates)].join(", ")}`,
      );
    }

    const invalidPages = selectedPages.filter(
      (p) => !Number.isInteger(p) || p < 1 || p > pdf.totalPages,
    );
    if (invalidPages.length > 0) {
      throw new Error(
        `Invalid page numbers: ${invalidPages.join(", ")}. Valid range is 1–${pdf.totalPages}`,
      );
    }

    // Read + parse source
    let srcBytes: Buffer;
    try {
      srcBytes = fs.readFileSync(pdf.path);
    } catch {
      throw new Error("Failed to read source PDF file");
    }

    let srcDoc: PDFDocument;
    try {
      srcDoc = await PDFDocument.load(srcBytes);
    } catch {
      throw new Error("Source PDF is corrupted or unreadable");
    }

    // Build new PDF preserving requested order
    const newDoc = await PDFDocument.create();
    const zeroIndexed = selectedPages.map((p) => p - 1);
    const copiedPages = await newDoc.copyPages(srcDoc, zeroIndexed);
    copiedPages.forEach((page) => newDoc.addPage(page));
    const newPdfBytes = await newDoc.save();

    // Persist file
    const outputDir = path.join(process.cwd(), "uploads", "generated");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const baseName = path.basename(pdf.originalName, path.extname(pdf.originalName));
    const filename = `${baseName}-extracted-${timestamp}.pdf`;
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, newPdfBytes);

    // Persist metadata to MongoDB
    const saved = await this._iGeneratedPdfRepository.create({
      userId,
      originalPdfId: pdfId,
      originalName: pdf.originalName,
      filename,
      path: outputPath,
      totalPages: selectedPages.length,
    });

    const savedId = (saved as any)._id?.toString() as string;
    const downloadUrl = `${STATIC_BASE_URL}/uploads/generated/${filename}`;

    return { id: savedId, filename, totalPages: selectedPages.length, downloadUrl };
  }

  // ── List generated PDFs for a user ───────────────────────────────────────

  async getGeneratedPdfs(userId: string): Promise<GetGeneratedPdfsResponseDto[]> {
    const docs = await this._iGeneratedPdfRepository.findByUserId(userId);

    return docs.map((doc) => ({
      _id: (doc as any)._id?.toString(),
      originalName: doc.originalName,
      filename: doc.filename,
      totalPages: doc.totalPages,
      downloadUrl: `${STATIC_BASE_URL}/uploads/generated/${doc.filename}`,
      createdAt: (doc as any).createdAt,
    }));
  }

  // ── Delete an uploaded PDF ────────────────────────────────────────────────

  async deletePdf(id: string, userId: string): Promise<DeletePdfResponseDto> {
    const pdf = await this._ipdfRepository.findById(id);
    if (!pdf || pdf.userId.toString() !== userId) throw new Error("PDF not found");

    // Remove original file from disk (best-effort — don't fail if already gone)
    if (fs.existsSync(pdf.path)) {
      fs.unlinkSync(pdf.path);
    }

    // Remove generated thumbnails folder if it exists
    const thumbnailDir = path.join(
      process.cwd(),
      "uploads",
      "pdf-pages",
      id,
    );
    if (fs.existsSync(thumbnailDir)) {
      fs.rmSync(thumbnailDir, { recursive: true, force: true });
    }

    // Remove DB record
    await this._ipdfRepository.delete(id);

    return { id };
  }

  // ── Delete a generated PDF ───────────────────────────────────────────────

  async deleteGeneratedPdf(id: string, userId: string): Promise<{ id: string }> {
    const generatedPdf = await this._iGeneratedPdfRepository.findById(id);
    if (!generatedPdf || generatedPdf.userId.toString() !== userId) throw new Error("Generated PDF not found");

    // Remove file from disk
    if (fs.existsSync(generatedPdf.path)) {
      fs.unlinkSync(generatedPdf.path);
    }

    // Remove DB record
    await this._iGeneratedPdfRepository.delete(id);

    return { id };
  }
}
