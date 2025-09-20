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

    return await this.authService.exchangeCodeForToken(
      code,
      codeVerifier,
      redirectUri,
    );
  }
}
