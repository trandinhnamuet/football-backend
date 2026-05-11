import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const password = request.headers['x-admin-password'];
    const adminPassword = this.config.get('ADMIN_PASSWORD');

    if (!password || password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }
    return true;
  }
}
