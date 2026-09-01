import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { google } from 'googleapis';

import { randomBytes } from 'node:crypto';

import { PrismaService } from '../common/prisma/prisma.service';

export interface ActivityUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

@Injectable()
export class AuthService {
  /*
   * ---------------------------------------------------------
   * HELPER 1
   * ---------------------------------------------------------
   *
   * Create the Google OAuth client.
   */
  private createGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('Google login settings are missing.');
    }

    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    return client;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 2
   * ---------------------------------------------------------
   *
   * Creates a random state value.
   *
   * Google sends this back to us.
   *
   * We use it to make sure the callback
   * belongs to the login request we started.
   */
  createState(): string {
    return randomBytes(32).toString('hex');
  }

  /*
   * ---------------------------------------------------------
   * HELPER 3
   * ---------------------------------------------------------
   *
   * Creates a random nonce.
   *
   * This helps us verify the Google ID token.
   */
  createNonce(): string {
    return randomBytes(32).toString('hex');
  }

  /*
   * ---------------------------------------------------------
   * HELPER 4
   * ---------------------------------------------------------
   *
   * Creates the Google login URL.
   */
  getGoogleLoginUrl(state: string, nonce: string): string {
    const client = this.createGoogleClient();

    return client.generateAuthUrl({
      /*
       * We only need login here.
       *
       * Drive permission will be requested
       * separately when the user connects Drive.
       */
      scope: ['openid', 'email', 'profile'],

      access_type: 'online',

      prompt: 'select_account',

      state,

      nonce,
    });
  }

  /*
   * ---------------------------------------------------------
   * HELPER 5
   * ---------------------------------------------------------
   *
   * Exchange Google's code for tokens.
   */
  private async getGoogleTokens(code: string) {
    const client = this.createGoogleClient();

    const result = await client.getToken(code);

    return result.tokens;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 6
   * ---------------------------------------------------------
   *
   * Verify Google's ID token.
   */
  private async verifyGoogleToken(idToken: string, nonce: string) {
    const client = this.createGoogleClient();

    const ticket = await client.verifyIdToken({
      idToken,

      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException(
        'Google account information was not found.',
      );
    }

    /*
     * Google's "sub" is the permanent
     * identifier for the Google account.
     */
    if (!payload.sub) {
      throw new UnauthorizedException('Google account ID was not found.');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Google email was not found.');
    }

    /*
     * Make sure Google says
     * the email is verified.
     */
    if (payload.email_verified !== true) {
      throw new UnauthorizedException('Your Google email is not verified.');
    }

    /*
     * Check the nonce.
     */
    if (payload.nonce !== nonce) {
      throw new UnauthorizedException('Google login could not be verified.');
    }

    return payload;
  }

  /*
   * ---------------------------------------------------------
   * HELPER 7
   * ---------------------------------------------------------
   *
   * Find an existing Kull user
   * or create a new one.
   */
  private async findOrCreateUser(
    googleId: string,
    email: string,
    name?: string,
    picture?: string,
  ): Promise<ActivityUser> {
    /*
     * First search by Google ID.
     */
    let user = await this.prisma.user.findUnique({
      where: {
        googleId,
      },
    });

    /*
     * Existing Google user.
     */
    if (user) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          email,
          name: name ?? null,
          picture: picture ?? null,
        },
      });

      return {
        id: user.id,
        email: user.email!,
        name: user.name,
        picture: user.picture,
      };
    }

    /*
     * Check whether this email already
     * belongs to an old Kull account.
     *
     * This is useful because you previously
     * had username/password authentication.
     */
    user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      /*
       * Link the old Kull user
       * to their Google account.
       */
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          googleId,
          name: name ?? null,
          picture: picture ?? null,
        },
      });

      return {
        id: user.id,
        email: user.email!,
        name: user.name,
        picture: user.picture,
      };
    }

    /*
     * No existing user.
     *
     * Create a new Kull user.
     */
    user = await this.prisma.user.create({
      data: {
        googleId,
        email,
        name: name ?? null,
        picture: picture ?? null,
      },
    });

    return {
      id: user.id,
      email: user.email!,
      name: user.name,
      picture: user.picture,
    };
  }

  /*
   * ---------------------------------------------------------
   * ACTUAL GOOGLE LOGIN
   * ---------------------------------------------------------
   */
  async loginWithGoogle(code: string, nonce: string): Promise<ActivityUser> {
    /*
     * Step 1:
     * Exchange the code for Google's tokens.
     */
    const tokens = await this.getGoogleTokens(code);

    if (!tokens.id_token) {
      throw new UnauthorizedException('Google did not return an ID token.');
    }

    /*
     * Step 2:
     * Verify the ID token.
     */
    const payload = await this.verifyGoogleToken(tokens.id_token, nonce);

    /*
     * Step 3:
     * Find or create the Kull user.
     */
    return this.findOrCreateUser(
      payload.sub,
      payload.email!,
      payload.name,
      payload.picture,
    );
  }

  /*
   * ---------------------------------------------------------
   * GET CURRENT KULL USER
   * ---------------------------------------------------------
   */
  async getCurrentUser(userId: string): Promise<ActivityUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
      },
    });

    if (!user || !user.email) {
      throw new UnauthorizedException('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  }

  constructor(private readonly prisma: PrismaService) {}
}
