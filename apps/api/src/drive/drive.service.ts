import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

import { google, type drive_v3 } from 'googleapis';

import { Readable } from 'node:stream';

import type { Express } from 'express';

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];
export interface FolderResolution {
  folderId: string | null;
  folderPath: string;
  createdFolders: string[];
}

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
  async getDriveClient(
    userId: string,
  ): Promise<drive_v3.Drive> {
    const user = await this.getUser(userId);

    if (!user.googleRefreshToken) {
      throw new BadRequestException(
        'Google Drive is not connected. Connect Google Drive first.',
      );
    }

    const client = this.createGoogleClient();

    /*
     * VERY IMPORTANT:
     *
     * This token belongs to this user.
     */
    client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    const drive = google.drive({
      version: 'v3',
      auth: client,
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
  cleanFolderPath(folderPath: string): string {
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
    drive: drive_v3.Drive,
    parentId: string,
    folderName: string,
  ) {
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
    drive: drive_v3.Drive,
    parentId: string,
    folderName: string,
  ) {
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
    const result = await this.resolveFolderPath(
      userId,
      folderPath,
      true,
    );

    return result.folderId!;
  }

  async resolveFolderPath(
    userId: string,
    folderPath: string,
    createMissing: boolean,
  ): Promise<FolderResolution> {
    const cleanPath = this.cleanFolderPath(folderPath);
    const parts = cleanPath.split('/');
    const drive = await this.getDriveClient(userId);
    const createdFolders: string[] = [];

    let parentId = 'root';

    for (const part of parts) {
      const existingFolder = await this.findFolder(
        drive,
        parentId,
        part,
      );

      if (existingFolder?.id) {
        parentId = existingFolder.id!;
        continue;
      }

      if (!createMissing) {
        return {
          folderId: null,
          folderPath: cleanPath,
          createdFolders,
        };
      }

      const newFolder = await this.createFolder(
        drive,
        parentId,
        part,
      );

      parentId = newFolder.id!;
      createdFolders.push(part);
    }

    return {
      folderId: parentId,
      folderPath: cleanPath,
      createdFolders,
    };
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
    const drive = await this.getDriveClient(userId);

    let parentId = 'root';

    const pathParts = [];

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];

      const folder = await this.findFolder(
        drive,
        parentId,
        part,
      );

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

    const drive = await this.getDriveClient(userId);

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
