import { Router } from "express";
import { container } from "../../infrastructure/di/container";
import { UserController } from "../controllers/user.controller";
import { validateRegister } from "../validators/user.register.validator";
import { validateLogin } from "../validators/user.login.validator";
import { upload } from "../../infrastructure/upload/multer.config";
import { PdfController } from "../controllers/pdf.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const userController = container.resolve(UserController);
const pdfController = container.resolve(PdfController);

// ── Auth (public) ────────────────────────────────────────────────────────────
router.post(
  "/register",
  validateRegister,
  userController.register.bind(userController),
);
router.post("/login", validateLogin, userController.login.bind(userController));
router.post("/refresh", userController.refresh.bind(userController));
router.post("/logout", userController.logout.bind(userController));

// ── PDFs (public read, auth required for write / user-scoped) ────────────────
router.get(
  "/pdfs",
  authMiddleware,
  pdfController.getPdfs.bind(pdfController),
);
router.get(
  "/pdfs/:id/pages",
  authMiddleware,
  pdfController.getPdfPages.bind(pdfController),
);

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"),
  pdfController.uploadPdf.bind(pdfController),
);

router.post(
  "/pdfs/:id/extract",
  authMiddleware,
  pdfController.extractPages.bind(pdfController),
);

// ── Generated PDFs (auth required) ───────────────────────────────────────────
router.get(
  "/generated-pdfs",
  authMiddleware,
  pdfController.getGeneratedPdfs.bind(pdfController),
);

// ── Delete uploaded PDF (auth required) ──────────────────────────────────────
router.delete(
  "/pdfs/:id",
  authMiddleware,
  pdfController.deletePdf.bind(pdfController),
);
router.delete(
  "/generated-pdfs/:id",
  authMiddleware,
  pdfController.deleteGeneratedPdf.bind(pdfController),
);

export default router;
