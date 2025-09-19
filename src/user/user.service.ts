import { Injectable } from '@nestjs/common';
import axios from 'axios';
import https from 'https';

@Injectable()
export class UserService {
  private readonly keycloakUrl = process.env.KEYCLOAK_URL || '';
  private readonly realm = process.env.KEYCLOAK_REALM || '';
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID || '';
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

  async logout(refreshToken: string) {
    const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
      await axios.post(
        logoutUrl,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          httpsAgent: agent,
        },
      );
      return { message: 'User logged out successfully' };
    } catch (err) {
      return {
        message: 'Keycloak logout failed',
        error: err.response?.data || err.message,
      };
    }
  }
}
