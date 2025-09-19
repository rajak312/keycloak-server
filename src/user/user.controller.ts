import { Controller, Get, Req } from '@nestjs/common';
import { Authenticate } from 'src/decorators/authenticate.decorator';
import { User } from 'src/decorators/user.decorator';
import type { Request } from 'express';
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
  async logout(@Req() req: Request) {
    const refreshToken = req.headers['x-refresh-token'] as string;
    const response = await this.userService.logout(refreshToken || '');
    return response;
  }
}
