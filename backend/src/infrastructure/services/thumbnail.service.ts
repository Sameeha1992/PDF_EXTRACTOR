import fs from "fs";
import path from "path";

/**
 * Renders every page of a PDF to a PNG thumbnail and saves them to
 * uploads/pdf-pages/{pdfId}/.
 *
 * Uses mupdf (WASM, no system deps) via dynamic import() because the
 * package is ESM-only while the project compiles to CommonJS.
 */
export class ThumbnailService {
  /** Scale factor for rendering — 1.5× gives ~113 DPI thumbnails */
  private static readonly SCALE = 1.5;

  /**
   * Generates PNG thumbnails for all pages and returns an array of
   * { pageNumber, imagePath } objects.
   *
   * @param pdfPath   Absolute or cwd-relative path to the source PDF
   * @param pdfId     MongoDB _id string — used as the output folder name
   * @returns         Array of saved file paths relative to cwd
   */
  static async generateThumbnails(
    pdfPath: string,
    pdfId: string,
  ): Promise<{ pageNumber: number; imagePath: string }[]> {
    // Prepare output directory
    const outputDir = path.join(process.cwd(), "uploads", "pdf-pages", pdfId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Dynamic import — mupdf ships as ESM only
    const mupdf = await (Function('return import("mupdf")')() as Promise<typeof import("mupdf")>);

    const pdfBytes = fs.readFileSync(pdfPath);
    const doc = mupdf.Document.openDocument(pdfBytes, "application/pdf");
    const totalPages = doc.countPages();

    const results: { pageNumber: number; imagePath: string }[] = [];

    for (let i = 0; i < totalPages; i++) {
      const page = doc.loadPage(i);
      const matrix = mupdf.Matrix.scale(ThumbnailService.SCALE, ThumbnailService.SCALE);
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false);

      const pngBytes = pixmap.asPNG();

      const filename = `page-${i + 1}.png`;
      const fullPath = path.join(outputDir, filename);
      fs.writeFileSync(fullPath, pngBytes);

      // Path relative to the uploads root — used to build the URL
      results.push({
        pageNumber: i + 1,
        imagePath: path.join("pdf-pages", pdfId, filename).replace(/\\/g, "/"),
      });

      pixmap.destroy();
      page.destroy();
    }

    doc.destroy();

    return results;
  }

  /**
   * Returns true if thumbnails for this PDF have already been generated,
   * so we can skip re-rendering on repeat requests.
   */
  static thumbnailsExist(pdfId: string, totalPages: number): boolean {
    const outputDir = path.join(process.cwd(), "uploads", "pdf-pages", pdfId);
    if (!fs.existsSync(outputDir)) return false;

    for (let i = 1; i <= totalPages; i++) {
      if (!fs.existsSync(path.join(outputDir, `page-${i}.png`))) return false;
    }

    return true;
  }
}
