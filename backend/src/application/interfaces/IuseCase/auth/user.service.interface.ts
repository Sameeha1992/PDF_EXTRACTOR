import { User } from "../../../../domain/entities/user.entity";
import { LoginDto, LoginResponseDto } from "../../../dtos/auth/login.dto";
import { RegisterResponseDto, RegisterUserDTO } from "../../../dtos/auth/register.user.dto";

export interface IUserAuthService{
    register(user:RegisterUserDTO):Promise<RegisterResponseDto>
    login(data:LoginDto):Promise<LoginResponseDto>
}