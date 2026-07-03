import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import userRouter from "./presentation/routes/user.route";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,          // allow cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files and generated thumbnails as static assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRouter);

export default app;
