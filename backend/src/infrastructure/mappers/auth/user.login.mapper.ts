import { LoginResponseDto } from "../../../application/dtos/auth/login.dto";
import { User } from "../../../domain/entities/user.entity";

export class UserLoginMapper {
  static toResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): LoginResponseDto {
    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }
}
