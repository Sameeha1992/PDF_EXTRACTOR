import { injectable } from "tsyringe";
import { IUserRepository } from "../../application/interfaces/Irepository/user.repository.interface";
import { User } from "../../domain/entities/user.entity";
import { UserModel, IUser } from "../database/mongodb/models/user.model";

@injectable()
export class UserRepository implements IUserRepository {
    private toDomain(userDoc: IUser): User {
        return new User(
            userDoc.name,
            userDoc.email,
            userDoc.password,
            userDoc._id ? String(userDoc._id) : undefined,
            userDoc.createdAt,
            userDoc.updatedAt
        );
    }

    async create(user: User): Promise<User> {
        const createdUserDoc = await UserModel.create({
            name: user.name,
            email: user.email,
            password: user.password
        });
        return this.toDomain(createdUserDoc);
    }

    async findByEmail(email: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) {
            return null;
        }
        return this.toDomain(userDoc);
    }
}