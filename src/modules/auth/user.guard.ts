import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/** Yêu cầu header "Authorization: Bearer <token>" của một tài khoản còn hiệu lực. */
@Injectable()
export class UserGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string = request.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const user = token ? await this.auth.findByToken(token) : null;
    if (!user) throw new UnauthorizedException('Login required');
    request.user = user;
    return true;
  }
}
