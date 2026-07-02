import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../interfaces/Irepository/user.repository.interface";
import { IUserAuthService } from "../interfaces/IuseCase/auth/user.service.interface";
import bcrypt from "bcrypt";
import { RegisterResponseDto, RegisterUserDTO } from "../dtos/auth/register.user.dto";
import { UserMapper } from "../../infrastructure/mappers/auth/user.register.mapper";
import { LoginDto, LoginResponseDto } from "../dtos/auth/login.dto";
import { IJwtService } from "../interfaces/IServices/jwt.service.interface";
import { UserLoginMapper } from "../../infrastructure/mappers/auth/user.login.mapper";

@injectable()
export class UserAuthService implements IUserAuthService{
    constructor(
        @inject("IUserRepository") private readonly _iUserRepository: IUserRepository,
          @inject("IJwtService") private readonly _jwtService: IJwtService
    ){}
    
    async register(user: RegisterUserDTO): Promise<RegisterResponseDto> {
        const existingUser = await this._iUserRepository.findByEmail(user.email);

        if(existingUser){
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = UserMapper.toEntity(user,hashedPassword)
        const createdUser = await this._iUserRepository.create(newUser);
        return UserMapper.toRegisterResponse(createdUser)
    }

    async login(data:LoginDto):Promise<LoginResponseDto>{
        const user = await this._iUserRepository.findByEmail(data.email);

        if(!user){
            throw new Error("Invalid email or password");

        }

        const isPassword = await bcrypt.compare(data.password,user.password);

        if(!isPassword){
            throw new Error("Password not valid")
        }

        const accessToken = this._jwtService.generateAccessToken(user);
        const refreshToken = this._jwtService.generateRefreshToken(user);

        return UserLoginMapper.toResponse(user, accessToken, refreshToken);
    }

    async refresh(refreshToken: string): Promise<string> {
        const decoded = this._jwtService.verifyRefreshToken(refreshToken) as any;
        if (!decoded || !decoded.email) {
            throw new Error("Invalid refresh token");
        }

        const user = await this._iUserRepository.findByEmail(decoded.email);
        if (!user) {
            throw new Error("User not found");
        }

        return this._jwtService.generateAccessToken(user);
    }
}