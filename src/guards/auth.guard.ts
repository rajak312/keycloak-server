import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload, verify } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class AuthGuard implements CanActivate {
  private client;

  constructor() {
    this.client = jwksClient({
      jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
    });
  }

  private getKey(header, callback) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err, null);
      } else {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      }
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.cookies?.KEYCLOAK_ACCESS_TOKEN;

    if (!token) {
      throw new UnauthorizedException('No access token found');
    }

    try {
      const decoded = await new Promise<JwtPayload>((resolve, reject) => {
        verify(
          token,
          this.getKey.bind(this),
          {
            algorithms: ['RS256'],
            audience: process.env.KEYCLOAK_CLIENT_ID,
            issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
          },
          (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded as JwtPayload);
          },
        );
      });

      req.user = {
        id: decoded.sub,
        username: decoded.preferred_username,
        email: decoded.email,
        roles: decoded.realm_access?.roles || [],
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
