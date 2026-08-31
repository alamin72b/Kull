import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';

import { randomBytes } from 'node:crypto';

import type { Response } from 'express';

import { ActivityAuthGuard } from '../auth/activity-auth.guard';

import type { AuthenticatedRequest } from '../auth/authenticated-request';

import { CheckDrivePathDto } from './dto/check-drive-path.dto';

import { UploadToDriveDto } from './dto/upload-to-drive.dto';

import { DriveService } from './drive.service';

const DRIVE_STATE_COOKIE = 'kull_drive_oauth_state';

@Controller('drive')
@UseGuards(ActivityAuthGuard)
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  /*
   * ---------------------------------------------------------
   * CONNECT GOOGLE DRIVE
   * ---------------------------------------------------------
   *
   * GET /api/drive/connect
   */
  @Get('connect')
  connectGoogleDrive(
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    /*
     * Create a random value.
     *
     * We use it to make sure the
     * OAuth callback belongs to
     * the connection we just started.
     */
    const state = randomBytes(32).toString('hex');

    /*
     * Save the state in a signed,
     * HTTP-only cookie.
     */
    response.cookie(DRIVE_STATE_COOKIE, state, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    /*
     * Create Google's login URL.
     */
    const url = this.driveService.getGoogleAuthorizationUrl(state);

    return {
      url,
    };
  }

  /*
   * ---------------------------------------------------------
   * GOOGLE CALLBACK
   * ---------------------------------------------------------
   *
   * Google redirects back here.
   *
   * GET /api/drive/callback
   */
  @Get('callback')
  async googleCallback(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    /*
     * Make sure Google sent both values.
     */
    if (!code || !state) {
      return response
        .status(400)
        .send('Google authorization was not completed.');
    }

    /*
     * Read our saved state.
     */
    const savedState = request.signedCookies?.[DRIVE_STATE_COOKIE];

    /*
     * Check that the two states match.
     */
    if (typeof savedState !== 'string' || savedState !== state) {
      return response
        .status(400)
        .send('Google connection could not be verified.');
    }

    /*
     * The ActivityAuthGuard already
     * identified the logged-in user.
     */
    const userId = request.activityUser.id;

    try {
      /*
       * Exchange Google's code
       * for the refresh token.
       */
      const refreshToken =
        await this.driveService.getRefreshTokenFromCode(code);

      /*
       * Save it to THIS Kull user's row.
       */
      await this.driveService.saveRefreshToken(userId, refreshToken);

      /*
       * Remove temporary state cookie.
       */
      response.clearCookie(DRIVE_STATE_COOKIE, {
        path: '/',
      });

      /*
       * Send user back to Kull.
       */
      const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';

      return response.redirect(`${webUrl}/drive-upload?connected=true`);
    } catch {
      return response.status(400).send('Google Drive connection failed.');
    }
  }

  /*
   * ---------------------------------------------------------
   * CHECK CONNECTION
   * ---------------------------------------------------------
   *
   * GET /api/drive/status
   */
  @Get('status')
  status(@Req() request: AuthenticatedRequest) {
    const userId = request.activityUser.id;

    return this.driveService.getStatus(userId);
  }

  /*
   * ---------------------------------------------------------
   * CHECK PATH
   * ---------------------------------------------------------
   *
   * POST /api/drive/check-path
   */
  @Post('check-path')
  checkPath(
    @Req() request: AuthenticatedRequest,

    @Body()
    dto: CheckDrivePathDto,
  ) {
    const userId = request.activityUser.id;

    return this.driveService.checkFolderPath(userId, dto.folderPath);
  }

  /*
   * ---------------------------------------------------------
   * UPLOAD
   * ---------------------------------------------------------
   *
   * POST /api/drive/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),

      /*
       * Simple safety limit.
       *
       * The selected file is held
       * temporarily in memory.
       */
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  upload(
    @Req() request: AuthenticatedRequest,

    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    dto: UploadToDriveDto,
  ) {
    const userId = request.activityUser.id;

    return this.driveService.uploadFile(
      userId,
      file,
      dto.folderPath,
      dto.confirmed,
    );
  }
}
