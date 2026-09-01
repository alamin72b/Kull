import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import {
  GOOGLE_NONCE_COOKIE,
  GOOGLE_STATE_COOKIE,
  KULL_SESSION_COOKIE,
  isProductionEnvironment,
} from './auth.constants';

import { ActivityAuthGuard } from './activity-auth.guard';

import { AuthService } from './auth.service';

type RequestWithSignedCookies = Request & {
  signedCookies?: Record<string, unknown>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  googleLogin(@Res() response: Response) {
    const state = this.authService.createState();
    const nonce = this.authService.createNonce();

    response.cookie(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: isProductionEnvironment(),
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    response.cookie(GOOGLE_NONCE_COOKIE, nonce, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: isProductionEnvironment(),
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    return response.redirect(
      this.authService.getGoogleLoginUrl(state, nonce),
    );
  }

  @Get('google/callback')
  async googleCallback(
    @Req() request: RequestWithSignedCookies,
    @Res() response: Response,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code || !state) {
      return response.status(400).send('Google login was not completed.');
    }

    const signedCookies = request.signedCookies as unknown as
      | Record<string, unknown>
      | undefined;
    const savedState = signedCookies?.[GOOGLE_STATE_COOKIE];
    const savedNonce = signedCookies?.[GOOGLE_NONCE_COOKIE];

    if (!savedState || savedState !== state) {
      return response.status(400).send('Google login could not be verified.');
    }

    if (!savedNonce || typeof savedNonce !== 'string') {
      return response.status(400).send('Google login session expired.');
    }

    try {
      const user = await this.authService.loginWithGoogle(code, savedNonce);

      response.cookie(KULL_SESSION_COOKIE, user.id, {
        httpOnly: true,
        signed: true,
        sameSite: isProductionEnvironment() ? 'none' : 'lax',
        secure: isProductionEnvironment(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      response.clearCookie(GOOGLE_STATE_COOKIE, { path: '/' });
      response.clearCookie(GOOGLE_NONCE_COOKIE, { path: '/' });

      const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
      return response.redirect(`${webUrl}/activities`);
    } catch {
      return response.status(400).send('Google login failed.');
    }
  }

  @Get('me')
  @UseGuards(ActivityAuthGuard)
  me(@Req() request: Request) {
    const userId = (
      request as Request & { activityUser: { id: string } }
    ).activityUser.id;

    return this.authService.getCurrentUser(userId);
  }

  @Post('logout')
  logout(@Res() response: Response) {
    response.clearCookie(KULL_SESSION_COOKIE, { path: '/' });
    return response.status(204).send();
  }
}
