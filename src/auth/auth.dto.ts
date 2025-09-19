import { ApiProperty } from '@nestjs/swagger';

export class TokenRequestDto {
  @ApiProperty({
    description: 'Authorization code returned from Keycloak',
    example: 'abc123',
  })
  code: string;

  @ApiProperty({
    description: 'PKCE code verifier used for exchange',
    example: 'randomlyGeneratedCodeVerifier123',
  })
  codeVerifier: string;

  @ApiProperty({
    description: 'Redirect uri',
    example: 'http://localhost:5473',
  })
  redirectUri: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'Access token issued by Keycloak' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token issued by Keycloak' })
  refreshToken: string;

  @ApiProperty({ description: 'ID token issued by Keycloak' })
  idToken: string;

  @ApiProperty({ description: 'Token expiration in seconds', example: 300 })
  expiresIn: number;

  @ApiProperty({
    description: 'Refresh token expiration in seconds',
    example: 1800,
  })
  refreshExpiresIn: number;
}
