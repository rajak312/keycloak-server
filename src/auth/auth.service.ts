import { Injectable } from '@nestjs/common';
import axios from 'axios';
import crypto from 'crypto';
import https from 'https';

@Injectable()
export class AuthService {
  private pkceStore: Record<string, string> = {};

  private readonly keycloakUrl = process.env.KEYCLOAK_URL || '';
  private readonly realm = process.env.KEYCLOAK_REALM || '';
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID || '';
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';
  private readonly redirectUri = process.env.KEYCLOAK_REDIRECT_URI || '';
  private readonly frontendUrl = process.env.FRONTEND_URL || '';

  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  saveCodeVerifier(state: string, verifier: string) {
    this.pkceStore[state] = verifier;
  }

  getCodeVerifier(state: string): string | undefined {
    return this.pkceStore[state];
  }

  async exchangeCodeForToken(code: string, codeVerifier: string) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent: agent,
      },
    );

    return response.data;
  }

  async getUserInfo(token: string) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;

    const response = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${token}` },
      httpsAgent: agent,
    });

    return response.data;
  }

  getFrontendUrl() {
    return this.frontendUrl;
  }
}
