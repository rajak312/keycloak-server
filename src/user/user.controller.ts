import { Controller, Get, Req, Res } from '@nestjs/common';
import { Authenticate } from 'src/decorators/authenticate.decorator';
import { User } from 'src/decorators/user.decorator';
import type { Request, Response } from 'express';
import { UserService } from './user.service';

@Authenticate()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@User() user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.KEYCLOAK_REFRESH_TOKEN;
    res.clearCookie('KEYCLOAK_ACCESS_TOKEN', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.clearCookie('KEYCLOAK_REFRESH_TOKEN', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.clearCookie('KEYCLOAK_ID_TOKEN', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    if (refreshToken) {
      await this.userService.logout(refreshToken);
    }
    return res.json({
      message: 'user logout successfully',
    });
  }
}
