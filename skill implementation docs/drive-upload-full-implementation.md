# Drive Upload — Full Implementation

## Implementation Summary

- Feature: authenticated Google Drive folder-path upload.
- Existing conventions: NestJS, Prisma, class-validator, Next.js client components, CSS modules, and shared TypeScript contracts.
- Authorization: Kull session authentication followed by separate Google Drive OAuth consent.
- Drive scopes: `drive.file` and `drive.metadata.readonly`; full Drive access is not requested.
- Behavior: verify existing paths, show missing folders, create missing folders after confirmation, and upload one file.
- Limit: 20 MiB per file; empty files are rejected.
- Excluded: shared drives, multiple-file upload, duplicate detection, and disconnect UI.
- This document contains complete final contents for every listed application file.

## Environment Variables

The API source reads the following names:

```env
DATABASE_URL=your-database-url
PORT=4000
WEB_URL=http://localhost:3000
COOKIE_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:4000/api/drive/callback
```

The Google login and Drive connection use the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Only the callback URI is separate. Do not commit real credentials.

The web source reads:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Register these exact Google OAuth redirect URIs:

```text
http://localhost:4000/api/auth/google/callback
http://localhost:4000/api/drive/callback
```

## Complete File Contents

### `apps/api/src/drive/drive.controller.ts`

```typescript
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
```

### `apps/api/src/drive/drive.service.ts`

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

import { google } from 'googleapis';



import { Readable } from 'node:stream';

import type { Express } from 'express';

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

@Injectable()
export class DriveService {
  /*
   * Google Drive uses this MIME type
   * for folders.
   */
  private readonly folderMimeType = 'application/vnd.google-apps.folder';

  /*
   * ---------------------------------------------------------
   * HELPER 1
   * ---------------------------------------------------------
   *
   * Creates the Google OAuth client.
   */
  private createGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('Google Drive settings are missing.');
    }

    const googleClient = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    return googleClient;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 2
   * ---------------------------------------------------------
   *
   * Gets the logged-in Kull user.
   */
  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User was not found.');
    }

    return user;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 3
   * ---------------------------------------------------------
   *
   * Creates a Google Drive client
   * for ONE Kull user.
   *
   * This is where the user's own
   * refresh token is used.
   */
  private async createDriveClient(userId: string) {
    const user = await this.getUser(userId);

    if (!user.googleRefreshToken) {
      throw new BadRequestException(
        'Google Drive is not connected. Connect Google Drive first.',
      );
    }

    const googleClient = this.createGoogleClient();

    /*
     * VERY IMPORTANT:
     *
     * This token belongs to this user.
     */
    googleClient.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    const drive = google.drive({
      version: 'v3',
      auth: googleClient,
    });

    return drive;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 4
   * ---------------------------------------------------------
   *
   * Cleans the folder path.
   *
   * Example:
   *
   * /Projects//Kull/Reports/
   *
   * becomes:
   *
   * Projects/Kull/Reports
   */
  private cleanFolderPath(folderPath: string): string {
    let path = folderPath.trim();

    /*
     * Allow both:
     *
     * /
     *
     * and
     *
     * \
     */
    path = path.replace(/\\/g, '/');

    /*
     * Remove beginning /
     */
    path = path.replace(/^\/+/, '');

    /*
     * Remove ending /
     */
    path = path.replace(/\/+$/, '');

    /*
     * Turn the path into parts.
     */
    const parts = path
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    /*
     * User can type:
     *
     * My Drive/Projects/Kull
     *
     * We do not need "My Drive".
     */
    if (parts.length > 0 && parts[0].toLowerCase() === 'my drive') {
      parts.shift();
    }

    if (parts.length === 0) {
      throw new BadRequestException('Please enter a Drive folder path.');
    }

    /*
     * Do not allow "." or ".."
     */
    for (const part of parts) {
      if (part === '.' || part === '..' || part.includes('\0')) {
        throw new BadRequestException(
          'The folder path contains an invalid part.',
        );
      }
    }

    return parts.join('/');
  }

  /*
   * ---------------------------------------------------------
   * HELPER 5
   * ---------------------------------------------------------
   *
   * Converts:
   *
   * Projects/Kull/Reports
   *
   * into:
   *
   * ["Projects", "Kull", "Reports"]
   */
  private getFolderParts(folderPath: string): string[] {
    const cleanPath = this.cleanFolderPath(folderPath);

    return cleanPath.split('/');
  }

  /*
   * ---------------------------------------------------------
   * HELPER 6
   * ---------------------------------------------------------
   *
   * Escapes special characters for
   * a Google Drive search query.
   */
  private escapeDriveName(name: string): string {
    return name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  /*
   * ---------------------------------------------------------
   * HELPER 7
   * ---------------------------------------------------------
   *
   * Finds ONE folder with this name
   * inside the given parent folder.
   */
  private async findFolder(
    userId: string,
    parentId: string,
    folderName: string,
  ) {
    const drive = await this.createDriveClient(userId);

    const safeName = this.escapeDriveName(folderName);

    const response = await drive.files.list({
      q:
        `'${parentId}' in parents ` +
        `and name = '${safeName}' ` +
        `and mimeType = '${this.folderMimeType}' ` +
        `and trashed = false`,

      spaces: 'drive',

      fields: 'files(id, name, mimeType)',

      pageSize: 10,
    });

    const folders = response.data.files ?? [];

    /*
     * No folder.
     */
    if (folders.length === 0) {
      return null;
    }

    /*
     * More than one matching folder.
     *
     * We do not guess.
     */
    if (folders.length > 1) {
      throw new BadRequestException(
        `More than one folder named "${folderName}" exists in this location.`,
      );
    }

    return folders[0];
  }

  /*
   * ---------------------------------------------------------
   * HELPER 8
   * ---------------------------------------------------------
   *
   * Creates one folder.
   */
  private async createFolder(
    userId: string,
    parentId: string,
    folderName: string,
  ) {
    const drive = await this.createDriveClient(userId);

    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: this.folderMimeType,
        parents: [parentId],
      },

      fields: 'id, name, mimeType',
    });

    return response.data;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 9
   * ---------------------------------------------------------
   *
   * Gets the final folder.
   *
   * If folders do not exist,
   * this method creates them.
   */
  private async getOrCreateFolderPath(
    userId: string,
    folderPath: string,
  ): Promise<string> {
    const parts = this.getFolderParts(folderPath);

    /*
     * "root" means the user's
     * My Drive root folder.
     */
    let parentId = 'root';

    for (const part of parts) {
      const existingFolder = await this.findFolder(userId, parentId, part);

      if (existingFolder) {
        parentId = existingFolder.id!;

        continue;
      }

      /*
       * Folder does not exist.
       *
       * Create it.
       */
      const newFolder = await this.createFolder(userId, parentId, part);

      parentId = newFolder.id!;
    }

    return parentId;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 10
   * ---------------------------------------------------------
   *
   * Checks a folder path.
   *
   * IMPORTANT:
   *
   * This method does NOT create folders.
   */
  async checkFolderPath(userId: string, folderPath: string) {
    const cleanPath = this.cleanFolderPath(folderPath);

    const parts = this.getFolderParts(cleanPath);

    let parentId = 'root';

    const pathParts = [];

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];

      const folder = await this.findFolder(userId, parentId, part);

      /*
       * Folder exists.
       */
      if (folder) {
        pathParts.push({
          name: part,
          exists: true,
        });

        parentId = folder.id!;

        continue;
      }

      /*
       * Folder does not exist.
       */
      pathParts.push({
        name: part,
        exists: false,
      });

      /*
       * Everything after this
       * also needs to be created.
       */
      for (let nextIndex = index + 1; nextIndex < parts.length; nextIndex++) {
        pathParts.push({
          name: parts[nextIndex],
          exists: false,
        });
      }

      break;
    }

    const missingFolders = pathParts
      .filter((part) => !part.exists)
      .map((part) => part.name);

    return {
      folderPath: cleanPath,

      folderExists: missingFolders.length === 0,

      missingFolders,

      parts: pathParts,
    };
  }

  /*
   * ---------------------------------------------------------
   * HELPER 11
   * ---------------------------------------------------------
   *
   * Gets the refresh token from
   * the Google OAuth authorization code.
   */
  async getRefreshTokenFromCode(code: string): Promise<string> {
    const googleClient = this.createGoogleClient();

    const result = await googleClient.getToken(code);

    const refreshToken = result.tokens.refresh_token;

    if (!refreshToken) {
      throw new BadRequestException(
        'Google did not return a refresh token. Please connect Google Drive again.',
      );
    }

    return refreshToken;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 12
   * ---------------------------------------------------------
   *
   * Saves the Google refresh token
   * to the correct Kull user.
   */
  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        googleRefreshToken: refreshToken,
      },
    });
  }

  /*
   * ---------------------------------------------------------
   * ACTUAL FEATURE 1
   * ---------------------------------------------------------
   *
   * Gets the Google OAuth URL.
   */
  getGoogleAuthorizationUrl(state: string): string {
    const googleClient = this.createGoogleClient();

    return googleClient.generateAuthUrl({
      access_type: 'offline',

      prompt: 'consent',

      scope: DRIVE_SCOPES,

      state,
    });
  }

  /*
   * ---------------------------------------------------------
   * ACTUAL FEATURE 2
   * ---------------------------------------------------------
   *
   * Checks whether this user has
   * connected Google Drive.
   */
  async getStatus(userId: string) {
    const user = await this.getUser(userId);

    return {
      connected: Boolean(user.googleRefreshToken),
    };
  }

  /*
   * ---------------------------------------------------------
   * ACTUAL FEATURE 3
   * ---------------------------------------------------------
   *
   * Uploads a file.
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    folderPath: string,
    confirmed: string,
  ) {
    /*
     * The user must confirm.
     */
    if (confirmed !== 'true') {
      throw new BadRequestException('Please confirm the folder path first.');
    }

    /*
     * A file is required.
     */
    if (!file) {
      throw new BadRequestException('Please choose a file.');
    }

    /*
     * Empty files are not useful.
     */
    if (file.size === 0) {
      throw new BadRequestException('The selected file is empty.');
    }

    /*
     * Get the final folder.
     *
     * This checks again.
     *
     * It also creates missing folders.
     */
    const folderId = await this.getOrCreateFolderPath(userId, folderPath);

    const drive = await this.createDriveClient(userId);

    /*
     * Upload the file.
     *
     * The folder ID goes into "parents".
     */
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },

      media: {
        mimeType: file.mimetype || 'application/octet-stream',

        body: Readable.from(file.buffer),
      },

 


      fields: 'id, name, mimeType, size, webViewLink',
    });

    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,

      size: response.data.size,

      webViewLink: response.data.webViewLink,

      folderPath: this.cleanFolderPath(folderPath),
    };
  }

  constructor(private readonly prisma: PrismaService) {}
}
```

### `apps/api/src/drive/dto/check-drive-path.dto.ts`

```typescript
import {
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CheckDrivePathDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  folderPath!: string;
}
```

### `apps/api/src/drive/dto/upload-to-drive.dto.ts`

```typescript
import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UploadToDriveDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  folderPath!: string;

  @IsString()
  @IsIn(["true"])
  confirmed!: string;
}
```

### `apps/web/src/features/drive-upload/drive-upload.api.ts`

```typescript
import type {
  DrivePathCheckResult,
  DriveStatus,
  DriveUploadResult,
} from '@kull/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/*
 * ---------------------------------------------------------
 * HELPER
 * ---------------------------------------------------------
 *
 * Reads the error returned by NestJS.
 */
async function getErrorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) {
    return data.message.join(' ');
  }

  if (typeof data?.message === 'string') {
    return data.message;
  }

  return 'Something went wrong.';
}

/*
 * ---------------------------------------------------------
 * HELPER
 * ---------------------------------------------------------
 *
 * Handles 401 and normal errors.
 */
async function checkResponse(response: Response) {
  if (response.status === 401) {
    window.location.href = '/activities/login';

    throw new Error('Please log in first.');
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

/*
 * ---------------------------------------------------------
 * CHECK GOOGLE DRIVE CONNECTION
 * ---------------------------------------------------------
 */
export async function getDriveStatus(): Promise<DriveStatus> {
  const response = await fetch(`${API_URL}/drive/status`, {
    credentials: 'include',
    cache: 'no-store',
  });

  await checkResponse(response);

  return response.json();
}

/*
 * ---------------------------------------------------------
 * CONNECT GOOGLE DRIVE
 * ---------------------------------------------------------
 */
export async function connectGoogleDrive() {
  const response = await fetch(`${API_URL}/drive/connect`, {
    credentials: 'include',
    cache: 'no-store',
  });

  await checkResponse(response);

  const data = await response.json();

  /*
   * Send the browser to Google.
   */
  window.location.href = data.url;
}

/*
 * ---------------------------------------------------------
 * CHECK FOLDER PATH
 * ---------------------------------------------------------
 */
export async function checkDrivePath(
  folderPath: string,
): Promise<DrivePathCheckResult> {
  const response = await fetch(`${API_URL}/drive/check-path`, {
    method: 'POST',

    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      folderPath,
    }),
  });

  await checkResponse(response);

  return response.json();
}

/*
 * ---------------------------------------------------------
 * UPLOAD FILE
 * ---------------------------------------------------------
 */
export async function uploadToDrive(
  file: File,
  folderPath: string,
): Promise<DriveUploadResult> {
  const formData = new FormData();

  formData.append('file', file);

  formData.append('folderPath', folderPath);

  /*
   * The user has already
   * confirmed the path in the UI.
   */
  formData.append('confirmed', 'true');

  const response = await fetch(`${API_URL}/drive/upload`, {
    method: 'POST',

    credentials: 'include',

    body: formData,
  });

  await checkResponse(response);

  return response.json();
}
```

### `apps/web/src/app/drive-upload/page.tsx`

```tsx

"use client";

import type {
  DrivePathCheckResult,
  DriveUploadResult,
} from "@kull/contracts";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  checkDrivePath,
  connectGoogleDrive,
  getDriveStatus,
  uploadToDrive,
} from "../../features/drive-upload/drive-upload.api";

import styles from "../../features/drive-upload/drive-upload.module.css";

export default function DriveUploadPage() {
  /*
   * ---------------------------------------------------------
   * FILE
   * ---------------------------------------------------------
   */
  const [file, setFile] =
    useState<File | null>(null);

  /*
   * ---------------------------------------------------------
   * GOOGLE DRIVE CONNECTION
   * ---------------------------------------------------------
   */
  const [isConnected, setIsConnected] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * PATH
   * ---------------------------------------------------------
   */
  const [folderPath, setFolderPath] =
    useState("");

  /*
   * Result of path checking.
   */
  const [pathCheck, setPathCheck] =
    useState<DrivePathCheckResult | null>(
      null,
    );

  /*
   * Upload result.
   */
  const [uploadedFile, setUploadedFile] =
    useState<DriveUploadResult | null>(
      null,
    );

  /*
   * ---------------------------------------------------------
   * LOADING STATES
   * ---------------------------------------------------------
   */
  const [isLoadingStatus, setIsLoadingStatus] =
    useState(true);

  const [isChecking, setIsChecking] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */
  const [error, setError] =
    useState("");

  /*
   * ---------------------------------------------------------
   * SUCCESS MESSAGE
   * ---------------------------------------------------------
   */
  const [connectedMessage, setConnectedMessage] =
    useState("");

  /*
   * ---------------------------------------------------------
   * LOAD DRIVE STATUS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadStatus() {
      try {
        const result =
          await getDriveStatus();

        setIsConnected(
          result.connected,
        );

        const params =
          new URLSearchParams(
            window.location.search,
          );

        if (
          params.get("connected") ===
          "true"
        ) {
          setConnectedMessage(
            "Google Drive connected successfully.",
          );

          window.history.replaceState(
            {},
            "",
            "/drive-upload",
          );
        }
      } catch (caughtError) {
        if (
          caughtError instanceof Error
        ) {
          setError(
            caughtError.message,
          );
        } else {
          setError(
            "Could not check Google Drive connection.",
          );
        }
      } finally {
        setIsLoadingStatus(
          false,
        );
      }
    }

    loadStatus();
  }, []);

  /*
   * ---------------------------------------------------------
   * HELPER
   * ---------------------------------------------------------
   *
   * When the path changes,
   * the old path-check becomes invalid.
   */
  function changeFolderPath(
    value: string,
  ) {
    setFolderPath(value);

    setPathCheck(null);

    setUploadedFile(null);

    setError("");
  }

  /*
   * ---------------------------------------------------------
   * CHOOSE FILE
   * ---------------------------------------------------------
   */
  function chooseFile(
    selectedFile: File | null,
  ) {
    setFile(selectedFile);

    setUploadedFile(null);

    setError("");
  }

  /*
   * ---------------------------------------------------------
   * CONNECT
   * ---------------------------------------------------------
   */
  function handleConnect() {
    setError("");

    connectGoogleDrive();
  }

  /*
   * ---------------------------------------------------------
   * CHECK PATH
   * ---------------------------------------------------------
   */
  async function handleCheckPath() {
    setError("");

    setUploadedFile(null);

    if (!isConnected) {
      setError(
        "Connect Google Drive first.",
      );

      return;
    }

    if (
      !folderPath.trim()
    ) {
      setError(
        "Enter a Google Drive folder path.",
      );

      return;
    }

    setIsChecking(true);

    try {
      const result =
        await checkDrivePath(
          folderPath,
        );

      setPathCheck(result);
    } catch (caughtError) {
      if (
        caughtError instanceof Error
      ) {
        setError(
          caughtError.message,
        );
      } else {
        setError(
          "The folder path could not be checked.",
        );
      }

      setPathCheck(null);
    } finally {
      setIsChecking(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * UPLOAD
   * ---------------------------------------------------------
   */
  async function handleUpload() {
    setError("");

    setUploadedFile(null);

    if (!file) {
      setError(
        "Choose a file first.",
      );

      return;
    }

    if (!pathCheck) {
      setError(
        "Check the folder path first.",
      );

      return;
    }

    /*
     * Show the path one final time.
     */
    const confirmed =
      window.confirm(
        `Please confirm this Google Drive destination:\n\nMy Drive / ${pathCheck.folderPath}\n\nFile: ${file.name}\n\nUpload this file?`,
      );

    if (!confirmed) {
      return;
    }

    setIsUploading(true);

    try {
      const result =
        await uploadToDrive(
          file,
          pathCheck.folderPath,
        );

      setUploadedFile(
        result,
      );
    } catch (caughtError) {
      if (
        caughtError instanceof Error
      ) {
        setError(
          caughtError.message,
        );
      } else {
        setError(
          "The file could not be uploaded.",
        );
      }
    } finally {
      setIsUploading(
        false,
      );
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          className={styles.backLink}
          href="/"
        >
          ← Kull home
        </Link>

        <p className={styles.eyebrow}>
          Kull / Drive Upload
        </p>

        <h1>
          Upload to Google Drive
        </h1>

        <p>
          Choose a file, enter its
          destination path, check the path,
          confirm it, and upload.
        </p>
      </header>

      {connectedMessage && (
        <div
          className={styles.successMessage}
        >
          {connectedMessage}
        </div>
      )}

      <section className={styles.card}>
        <h2>
          1. Connect Google Drive
        </h2>

        {isLoadingStatus ? (
          <p>
            Checking connection...
          </p>
        ) : isConnected ? (
          <div
            className={styles.connected}
          >
            Google Drive is connected.
          </div>
        ) : (
          <>
            <p>
              Connect your own Google account
              before uploading.
            </p>

            <button
              className={
                styles.primaryButton
              }
              onClick={
                handleConnect
              }
              type="button"
            >
              Connect Google Drive
            </button>
          </>
        )}
      </section>

      <section className={styles.card}>
        <h2>
          2. Choose a file
        </h2>

        <label className={styles.fileBox}>
          <span>
            {file
              ? file.name
              : "Choose a file"}
          </span>

          <input
            type="file"
            onChange={(event) => {
              chooseFile(
                event.target.files?.[0] ??
                  null,
              );
            }}
          />
        </label>

        {file && (
          <p>
            Selected:
            <strong>
              {" "}
              {file.name}
            </strong>
          </p>
        )}
      </section>

      <section className={styles.card}>
        <h2>
          3. Enter the Drive folder path
        </h2>

        <p className={styles.helpText}>
          Example:
        </p>

        <code>
          Projects/Kull/Reports
        </code>

        <label className={styles.field}>
          Destination folder path

          <input
            value={folderPath}
            onChange={(event) =>
              changeFolderPath(
                event.target.value,
              )
            }
            placeholder="Projects/Kull/Reports"
          />
        </label>

        <button
          className={
            styles.primaryButton
          }
          disabled={
            isChecking ||
            !isConnected
          }
          onClick={
            handleCheckPath
          }
          type="button"
        >
          {isChecking
            ? "Checking..."
            : "Check path"}
        </button>
      </section>

      {pathCheck && (
        <section
          className={
            styles.confirmationCard
          }
        >
          <h2>
            4. Review the path
          </h2>

          <div
            className={
              styles.pathDisplay
            }
          >
            My Drive /{" "}
            {pathCheck.folderPath}
          </div>

          {pathCheck.folderExists ? (
            <div
              className={
                styles.successBox
              }
            >
              <strong>
                This folder path already
                exists.
              </strong>

              <p>
                No folders will be created.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.warningBox
              }
            >
              <strong>
                Some folders do not exist.
              </strong>

              <p>
                Kull will create:
              </p>

              <ul>
                {pathCheck.missingFolders.map(
                  (folder) => (
                    <li key={folder}>
                      {folder}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <p className={styles.confirmText}>
            Check the complete path before
            uploading.
          </p>

          <button
            className={
              styles.uploadButton
            }
            disabled={isUploading}
            onClick={
              handleUpload
            }
            type="button"
          >
            {isUploading
              ? "Uploading..."
              : "Confirm path & upload"}
          </button>
        </section>
      )}

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {uploadedFile && (
        <section
          className={
            styles.successCard
          }
        >
          <h2>
            Upload complete
          </h2>

          <p>
            <strong>
              {uploadedFile.name}
            </strong>{" "}
            was uploaded successfully.
          </p>

          <p>
            Destination:
          </p>

          <div
            className={
              styles.pathDisplay
            }
          >
            My Drive /{" "}
            {uploadedFile.folderPath}
          </div>

          {uploadedFile.webViewLink && (
            <a
              className={
                styles.primaryButton
              }
              href={
                uploadedFile.webViewLink
              }
              target="_blank"
              rel="noreferrer"
            >
              Open file in Drive
            </a>
          )}
        </section>
      )}
    </main>
  );
}
```

### `apps/web/src/features/drive-upload/drive-upload.module.css`

```css
.page {
  width: min(
    800px,
    calc(100% - 32px)
  );

  margin: 0 auto;

  padding: 40px 0 80px;
}

.header {
  margin-bottom: 30px;
}

.backLink {
  color: #475467;
  font-weight: 700;
  text-decoration: none;
}

.backLink:hover {
  color: #6941c6;
}

.eyebrow {
  margin-top: 20px;

  color: #6941c6;

  font-size: 0.8rem;

  font-weight: 800;

  text-transform: uppercase;
}

.header h1 {
  margin: 8px 0 12px;

  color: #101828;

  font-size: 2.7rem;

  line-height: 1;
}

.header p {
  color: #667085;

  line-height: 1.7;
}

.card,
.confirmationCard,
.successCard {
  margin-top: 20px;

  border: 1px solid #e4e7ec;

  border-radius: 14px;

  padding: 22px;

  background: white;

  box-shadow:
    0 8px 30px
    rgba(16, 24, 40, 0.04);
}

.card h2,
.confirmationCard h2,
.successCard h2 {
  margin-top: 0;

  color: #101828;

  font-size: 1.15rem;
}

.connected {
  color: #027a48;

  font-weight: 700;
}

.fileBox {
  display: flex;

  min-height: 120px;

  align-items: center;

  justify-content: center;

  margin-top: 18px;

  border: 2px dashed #c7b5ef;

  border-radius: 10px;

  background: #fcfaff;

  color: #6941c6;

  font-weight: 750;

  cursor: pointer;
}

.fileBox input {
  display: none;
}

.fileBox + p {
  color: #667085;
}

.helpText {
  margin-bottom: 5px;

  color: #667085;
}

.card code {
  display: block;

  margin-bottom: 18px;

  border-radius: 7px;

  padding: 10px;

  background: #f2f4f7;

  color: #475467;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-bottom: 18px;

  color: #344054;

  font-weight: 700;
}

.field input {
  min-height: 44px;

  border: 1px solid #d0d5dd;

  border-radius: 8px;

  padding: 10px 12px;

  font: inherit;

  outline: none;
}

.field input:focus {
  border-color: #9e77ed;

  box-shadow:
    0 0 0 4px #f4ebff;
}

.primaryButton,
.uploadButton {
  display: inline-flex;

  min-height: 43px;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  padding: 9px 16px;

  font: inherit;

  font-weight: 750;

  cursor: pointer;
}

.primaryButton {
  border: 1px solid #6941c6;

  background: #6941c6;

  color: white;

  text-decoration: none;
}

.primaryButton:hover {
  background: #53389e;
}

.uploadButton {
  border: 1px solid #027a48;

  background: #027a48;

  color: white;
}

.uploadButton:hover {
  background: #05603a;
}

.primaryButton:disabled,
.uploadButton:disabled {
  cursor: not-allowed;

  opacity: 0.55;
}

.confirmationCard {
  border-color: #d6bbfb;
}

.pathDisplay {
  margin: 15px 0;

  border-radius: 8px;

  padding: 13px;

  background: #f2f4f7;

  color: #344054;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  word-break: break-word;
}

.successBox,
.warningBox {
  margin-top: 16px;

  border-radius: 9px;

  padding: 14px;
}

.successBox {
  background: #ecfdf3;

  color: #027a48;
}

.warningBox {
  background: #fffaeb;

  color: #b54708;
}

.successBox p,
.warningBox p {
  line-height: 1.6;
}

.warningBox ul {
  margin-bottom: 0;
}

.confirmText {
  color: #667085;

  line-height: 1.6;
}

.errorBox {
  margin-top: 20px;

  border: 1px solid #fecdca;

  border-radius: 9px;

  padding: 13px;

  background: #fef3f2;

  color: #b42318;
}

.successMessage {
  margin-bottom: 18px;

  border: 1px solid #abefc6;

  border-radius: 9px;

  padding: 13px;

  background: #ecfdf3;

  color: #027a48;
}

.successCard {
  border-color: #abefc6;

  background: #f6fef9;
}

@media (max-width: 600px) {
  .page {
    width:
      min(
        calc(100% - 20px),
        800px
      );

    padding-top: 25px;
  }

  .header h1 {
    font-size: 2.2rem;
  }

  .primaryButton,
  .uploadButton {
    width: 100%;
  }
}
```

### `packages/contracts/src/drive.ts`

```typescript
export interface DrivePathPart {
  name: string;
  exists: boolean;
}

export interface DrivePathCheckResult {
  folderPath: string;
  folderExists: boolean;
  missingFolders: string[];
  parts: DrivePathPart[];
}

export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  folderPath: string;
}

export interface DriveStatus {
  connected: boolean;
}
```

## Verification

```bash
pnpm --filter @kull/api prisma:generate
pnpm --filter @kull/api typecheck
pnpm --filter @kull/api lint
pnpm --filter @kull/web typecheck
pnpm --filter @kull/web lint
pnpm typecheck
pnpm lint
```

Manual verification:

1. Log in with Google.
2. Open `/drive-upload`.
3. Connect Google Drive and approve the limited scopes.
4. Check an existing folder path.
5. Check a path containing missing folders.
6. Confirm the path and upload a non-empty file under 20 MiB.
7. Confirm missing folders are created and the Drive link opens.
8. Log out and confirm Drive endpoints reject unauthenticated requests.
