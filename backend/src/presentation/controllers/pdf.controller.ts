import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPdfService } from "../../application/interfaces/IuseCase/pdf/pdf.service.interface";
import { UploadPdfDto, ExtractPdfDto } from "../../application/dtos/pdf/upload.pdf.dto";

@injectable()
export class PdfController {
  constructor(@inject("IPdfService") private _pdfService: IPdfService) {}

  // ── Upload ──────────────────────────────────────────────────────────────

  async uploadPdf(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      const dto: UploadPdfDto = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
      };

      const result = await this._pdfService.uploadPdf(dto);
      res.status(200).json({ success: true, message: "PDF uploaded successfully", data: result });
    } catch {
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }

  // ── List uploaded PDFs ──────────────────────────────────────────────────

  async getPdfs(_req: Request, res: Response): Promise<void> {
    try {
      const pdfs = await this._pdfService.getPdfs();
      res.status(200).json({ success: true, message: "PDFs fetched successfully", data: pdfs });
    } catch {
      res.status(500).json({ success: false, message: "Failed to fetch PDFs" });
    }
  }

  // ── Page thumbnails ─────────────────────────────────────────────────────

  async getPdfPages(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ success: false, message: "PDF id is required" });
        return;
      }

      const data = await this._pdfService.getPdfPages(id);
      res.status(200).json({ success: true, message: "PDF pages fetched successfully", data });
    } catch (error: any) {
      const isNotFound = error?.message === "PDF not found";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: isNotFound ? "PDF not found" : "Failed to fetch PDF pages",
      });
    }
  }

  // ── Extract selected pages ──────────────────────────────────────────────

  async extractPages(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const { selectedPages } = req.body as { selectedPages: unknown };

      if (!id) {
        res.status(400).json({ success: false, message: "PDF id is required" });
        return;
      }

      if (!Array.isArray(selectedPages) || selectedPages.length === 0) {
        res.status(400).json({
          success: false,
          message: "selectedPages must be a non-empty array",
        });
        return;
      }

      if (!selectedPages.every((p) => typeof p === "number")) {
        res.status(400).json({
          success: false,
          message: "All values in selectedPages must be numbers",
        });
        return;
      }

      const dto: ExtractPdfDto = {
        userId,
        pdfId: id,
        selectedPages: selectedPages as number[],
      };

      const data = await this._pdfService.extractPages(dto);
      res.status(200).json({ success: true, message: "PDF generated successfully", data });
    } catch (error: any) {
      const msg: string = error?.message ?? "";

      const prefixStatus: [string, number][] = [
        ["PDF not found", 404],
        ["No pages selected", 400],
        ["Duplicate page numbers", 400],
        ["Invalid page numbers", 400],
        ["Source PDF file not found on disk", 404],
        ["Source PDF is corrupted or unreadable", 422],
      ];

      const matched = prefixStatus.find(([prefix]) => msg.startsWith(prefix));
      res.status(matched ? matched[1] : 500).json({
        success: false,
        message: msg || "Extraction failed",
      });
    }
  }

  // ── List generated PDFs for current user ────────────────────────────────

  async getGeneratedPdfs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await this._pdfService.getGeneratedPdfs(userId);
      res.status(200).json({
        success: true,
        message: "Generated PDFs fetched successfully",
        data,
      });
    } catch {
      res.status(500).json({ success: false, message: "Failed to fetch generated PDFs" });
    }
  }

  // ── Delete an uploaded PDF ───────────────────────────────────────────────

  async deletePdf(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ success: false, message: "PDF id is required" });
        return;
      }

      const data = await this._pdfService.deletePdf(id);
      res.status(200).json({ success: true, message: "PDF deleted successfully", data });
    } catch (error: any) {
      const isNotFound = error?.message === "PDF not found";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: isNotFound ? "PDF not found" : "Failed to delete PDF",
      });
    }
  }
}
