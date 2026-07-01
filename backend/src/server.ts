import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { env } from "./infrastructure/config/env.config";
import app from "./app";
import { connectDb } from "./infrastructure/database/mongodb/db";

const PORT = env.PORT;


const startServer = async () => {
    try {
        await connectDb();
        console.log("✅ DB connection established");
    } catch (err) {
        console.warn("⚠️ DB connection failed, server will run without DB:", err);
    }
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};


startServer()