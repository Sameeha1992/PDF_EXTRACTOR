import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(5000),
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

export const env = envSchema.parse(process.env);
