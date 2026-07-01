import mongoose from "mongoose";
import { env } from "../../config/env.config";


export const connectDb = async(): Promise<void>=>{
    try {
        const mongoUrl = env.MONGO_URI;

         if (!mongoUrl) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(mongoUrl);
        console.log("Mongo db connected succesfully")
    } catch (error) {
        console.error("Failed to connect to MongoDb:", error);
        throw error
    }
}