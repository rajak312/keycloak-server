import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

export class TokenRequestDto {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async token(@Body() body: TokenRequestDto) {
    const { code, codeVerifier, redirectUri } = body;

    if (!code || !codeVerifier || !redirectUri) {
      throw new UnauthorizedException('Missing required parameters');
    }

    try {
      return await this.authService.exchangeCodeForToken(
        code,
        codeVerifier,
        redirectUri,
      );
    } catch (err) {
      console.error(
        'Token exchange failed:',
        err.response?.data || err.message,
      );
      throw new UnauthorizedException('Token exchange failed');
    }
  }
}
