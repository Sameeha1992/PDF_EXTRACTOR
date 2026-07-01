import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IUserAuthService } from "../../application/interfaces/IuseCase/auth/user.service.interface";
import { User } from "../../domain/entities/user.entity";
import { RegisterUserDTO } from "../../application/dtos/auth/register.user.dto";
import { LoginDto } from "../../application/dtos/auth/login.dto";

@injectable()
export class UserController {
  constructor(
    @inject("IUserAuthService")
    private readonly _userauthService: IUserAuthService,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const dto: RegisterUserDTO = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };

      let user = await this._userauthService.register(dto);
      console.log(user, "user set aai");

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: unknown) {
      const err = error as Error;

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDto = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await this._userauthService.login(data);

      // Refresh token → secure httpOnly cookie (7 days)
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      res.status(400).json({ success: false, message });
    }
  }
}
