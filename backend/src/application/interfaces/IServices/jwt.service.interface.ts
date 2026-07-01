import { JwtPayload } from "jsonwebtoken";
import { User } from "../../../domain/entities/user.entity";

export interface IJwtService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): string;
  verifyAccessToken(token: string): JwtPayload | string;
  verifyRefreshToken(token: string): JwtPayload | string;
}