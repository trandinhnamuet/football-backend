import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccount } from '../../entities/user-account.entity';
import { Player } from '../../entities/player.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserGuard } from './user.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, Player])],
  controllers: [AuthController],
  providers: [AuthService, UserGuard],
  exports: [AuthService, UserGuard],
})
export class AuthModule {}
