import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceLog } from '../../entities/attendance-log.entity';
import { MatchLiveEvent } from '../../entities/match-live-event.entity';
import { Match } from '../../entities/match.entity';
import { Player } from '../../entities/player.entity';
import { AuthModule } from '../auth/auth.module';
import { AttendanceService } from './attendance.service';
import { LiveService } from './live.service';
import { AttendanceController, LiveController } from './match-day.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceLog, MatchLiveEvent, Match, Player]), AuthModule],
  controllers: [AttendanceController, LiveController],
  providers: [AttendanceService, LiveService],
})
export class MatchDayModule {}
