import { RegisterResponseDto, RegisterUserDTO } from "../../../application/dtos/auth/register.user.dto";
import { User } from "../../../domain/entities/user.entity";

export class UserMapper {

    static toEntity(dto: RegisterUserDTO,hashedPassword:string): User {
        return new User(
            dto.name,
            dto.email,
            hashedPassword
        );
    }

     static toRegisterResponse(user: User): RegisterResponseDto {
        return {
            id: user.id!,
            name: user.name,
            email: user.email,
        };
    }

}