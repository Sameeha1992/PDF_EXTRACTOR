import { IPdf } from "../../../domain/entities/pdf.entity";

export interface IPdfRepository {
  create(pdf: IPdf): Promise<IPdf>;
  findAll(): Promise<IPdf[]>;
  findById(id: string): Promise<IPdf | null>;
  findByUserId(userId: string): Promise<IPdf[]>;
  delete(id: string): Promise<void>;
}