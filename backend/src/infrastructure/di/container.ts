import { container } from "tsyringe";
import { Logger } from "../utils/logger";
import { connectDb } from "../database/mongodb/db";
import { UserRepository } from "../repositories/user.repository";
import { UserAuthService } from "../../application/usecases/userauth.usecase";
import { JwtService } from "../services/jwt.services";
import { PdfService } from "../../application/usecases/pdf/pdf.service";
import { PdfRepository } from "../repositories/pdf.repository";
import { GeneratedPdfRepository } from "../repositories/generated-pdf.repository";

container.register<Logger>("Logger", { useClass: Logger });

// Register DB connection
container.register("ConnectDb", { useValue: connectDb });
container.register("IJwtService", { useClass: JwtService });

// Register UserRepository
container.register("IUserRepository", { useClass: UserRepository });

// Register UserAuthService
container.register("IUserAuthService", { useClass: UserAuthService });

// PDF
container.register("IPdfRepository", { useClass: PdfRepository });
container.register("IGeneratedPdfRepository", { useClass: GeneratedPdfRepository });
container.register("IPdfService", { useClass: PdfService });

export { container };
