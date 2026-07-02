import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { injectable } from "tsyringe";
import { IJwtService } from "../../application/interfaces/IServices/jwt.service.interface";
import { User } from "../../domain/entities/user.entity";
import { env } from "../config/env.config";

@injectable()
export class JwtService implements IJwtService {
  generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] },
    );
  }

  generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] },
    );
  }

  verifyAccessToken(token: string): JwtPayload | string {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  }

  verifyRefreshToken(token: string): JwtPayload | string {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  }
}
