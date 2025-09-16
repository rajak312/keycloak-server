import { Controller, Get } from '@nestjs/common';
import { Authenticate } from 'src/decorators/authenticate.decorator';
import { User } from 'src/decorators/user.decorator';

@Authenticate()
@Controller('user')
export class UserController {
  @Get('me')
  getMe(@User() user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }
}
