import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      errors: result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
    return;
  }
  
  req.body = result.data;
  next();
};
