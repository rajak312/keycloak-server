import { Injectable } from '@nestjs/common';
import axios from 'axios';
import https from 'https';

@Injectable()
export class AuthService {
  private readonly keycloakUrl = process.env.KEYCLOAK_URL || '';
  private readonly realm = process.env.KEYCLOAK_REALM || '';
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID || '';
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

  async exchangeCodeForToken(
    code: string,
    code_verifier: string,
    redirect_uri: string,
  ) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        code_verifier,
        redirect_uri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent: agent,
      },
    );
    const {
      access_token,
      id_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
    } = response.data;

    return {
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      refreshExpiresIn: refresh_expires_in,
    };
  }
}
