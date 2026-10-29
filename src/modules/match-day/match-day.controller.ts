import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserAccount } from '../../entities/user-account.entity';
import { AdminGuard } from '../../guards/admin.guard';
import { UserGuard } from '../auth/user.guard';
import { AttendanceService } from './attendance.service';
import { LiveService } from './live.service';

/** Điểm danh: chỉ thành viên đã đăng nhập; lịch sử chi tiết chỉ admin xem. */
@Controller('api/attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Get(':matchId/logs')
  @UseGuards(AdminGuard)
  logs(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.service.adminLogs(matchId);
  }

  @Get(':matchId')
  @UseGuards(UserGuard)
  view(@Param('matchId', ParseIntPipe) matchId: number, @Req() req: { user: UserAccount }) {
    return this.service.view(matchId, req.user);
  }

  @Post(':matchId')
  @UseGuards(UserGuard)
  set(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: { attending: boolean },
    @Req() req: { user: UserAccount },
  ) {
    return this.service.set(matchId, req.user, body?.attending);
  }
}

/** Vận hành trận trực tiếp — mọi thành viên đã đăng nhập đều xem và bấm được. */
@Controller('api/live')
@UseGuards(UserGuard)
export class LiveController {
  constructor(private service: LiveService) {}

  @Get(':matchId')
  view(@Param('matchId', ParseIntPipe) matchId: number, @Query('since') since?: string) {
    return this.service.view(matchId, since);
  }

  @Post(':matchId/events')
  add(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: { type: string; player_id?: number; player_out_id?: number },
    @Req() req: { user: UserAccount },
  ) {
    return this.service.add(matchId, req.user, body);
  }

  @Post(':matchId/positions')
  setPosition(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: { player_id: number; x: number; y: number },
    @Req() req: { user: UserAccount },
  ) {
    return this.service.setPosition(matchId, req.user, body);
  }

  @Post(':matchId/events/:eventId/void')
  void(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: { user: UserAccount },
  ) {
    return this.service.void(matchId, eventId, req.user);
  }
}
