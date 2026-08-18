import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import {
  ACTIVITY_SESSION_COOKIE,
  isProductionEnvironment,
} from "./auth.constants";
import {
  AuthService,
  type ActivityUser,
} from "./auth.service";
import { ActivityAuthDto } from "./dto/activity-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: ActivityAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ActivityUser> {
    const user = await this.authService.register(dto);

    this.setLoginCookie(response, user.id);

    return user;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: ActivityAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ActivityUser> {
    const user = await this.authService.login(dto);

    this.setLoginCookie(response, user.id);

    return user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(ACTIVITY_SESSION_COOKIE, {
      path: "/",
    });
  }

  private setLoginCookie(
    response: Response,
    userId: string,
  ): void {
    response.cookie(
      ACTIVITY_SESSION_COOKIE,
      userId,
      {
        httpOnly: true,
        signed: true,
        sameSite: isProductionEnvironment() ? "none" : "lax",
        secure: isProductionEnvironment(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      },
    );
  }
}
