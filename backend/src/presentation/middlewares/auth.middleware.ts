import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../infrastructure/config/env.config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorised: no token provided" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;

    if (!decoded?.id) {
      res.status(401).json({ success: false, message: "Unauthorised: invalid token payload" });
      return;
    }

    req.user = { id: decoded.id as string, email: decoded.email as string };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorised: token expired or invalid" });
  }
};
