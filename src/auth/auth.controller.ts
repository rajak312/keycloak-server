import {
  Controller,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  hello() {
    return {
      status: 'Up',
      code: 200,
    };
  }

  @Get('login')
  login(@Res() res: Response) {
    const { codeVerifier, codeChallenge } = this.authService.generatePKCE();
    const state = crypto.randomUUID();
    this.authService.saveCodeVerifier(state, codeVerifier);

    const authUrl =
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth` +
      `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
      `&response_type=code` +
      `&scope=openid profile email` +
      `&state=${state}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256` +
      `&redirect_uri=${encodeURIComponent(process.env.KEYCLOAK_REDIRECT_URI || '')}`;

    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code || !state) {
      throw new UnauthorizedException('Missing code or state');
    }

    const codeVerifier = this.authService.getCodeVerifier(state);
    if (!codeVerifier) {
      throw new UnauthorizedException('Invalid state');
    }

    try {
      const { access_token, refresh_token, id_token } =
        await this.authService.exchangeCodeForToken(code, codeVerifier);

      res.cookie('KEYCLOAK_ACCESS_TOKEN', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });
      res.cookie('KEYCLOAK_REFRESH_TOKEN', refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });
      res.cookie('KEYCLOAK_ID_TOKEN', id_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });

      return res.redirect(this.authService.getFrontendUrl() || '');
    } catch (err) {
      console.error(
        'Token exchange failed:',
        err.response?.data || err.message,
      );
      throw new UnauthorizedException('Token exchange failed');
    }
  }
}
