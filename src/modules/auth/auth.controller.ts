import {
  Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGuard } from './user.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { UserAccount } from '../../entities/user-account.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { username?: string; password?: string }) {
    return this.auth.login(body?.username || '', body?.password || '');
  }

  @Get('me')
  @UseGuards(UserGuard)
  me(@Req() req: { user: UserAccount }) {
    return this.auth.toPublic(req.user);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(UserGuard)
  changePassword(
    @Req() req: { user: UserAccount },
    @Body() body: { current_password?: string; new_password?: string },
  ) {
    return this.auth.changePassword(req.user, body?.current_password || '', body?.new_password || '');
  }

  // ---- Admin: quản lý tài khoản ----

  @Get('accounts')
  @UseGuards(AdminGuard)
  listAccounts() {
    return this.auth.listAccounts();
  }

  /** Tạo tài khoản cho cầu thủ nào chưa có (mật khẩu mặc định). */
  @Post('accounts/sync')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  syncAccounts() {
    return this.auth.ensureAccountsForPlayers();
  }

  @Post('accounts/:id/reset-password')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() body: { password?: string }) {
    return this.auth.resetPassword(id, body?.password);
  }

  @Patch('accounts/:id')
  @UseGuards(AdminGuard)
  updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { username?: string; is_active?: boolean; display_name?: string },
  ) {
    return this.auth.updateAccount(id, body || {});
  }
}
