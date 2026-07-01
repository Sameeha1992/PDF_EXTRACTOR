import { Model, Document } from "mongoose";
import { IBaseRepository } from "../../application/interfaces/Irepository/baserepository.interface";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {

    constructor(
        protected readonly model: Model<T>
    ) {}

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findAll(): Promise<T[]> {
        return await this.model.find();
    }

    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id);
    }
}