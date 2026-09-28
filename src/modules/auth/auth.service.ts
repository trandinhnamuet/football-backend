import {
  BadRequestException, ConflictException, Injectable, Logger, NotFoundException,
  OnModuleInit, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserAccount } from '../../entities/user-account.entity';
import { Player } from '../../entities/player.entity';
import { DEFAULT_PASSWORD, MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from './password.util';
import { signToken, verifyToken } from './token.util';

const USERNAME_RE = /^[a-z0-9._]{3,50}$/;

/** "Ngô Thanh Tuấn" -> "ngothanhtuan": bỏ dấu, viết liền, chữ thường. */
export function usernameFromName(name: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export interface PublicUser {
  id: number;
  username: string;
  display_name: string | null;
  is_default_password: boolean;
  is_active: boolean;
  last_login_at: Date | null;
  player: {
    id: number; num: number; first_name: string; last_name: string;
    role: string | null; nick: string | null; image_url: string | null;
  } | null;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserAccount) private repo: Repository<UserAccount>,
    @InjectRepository(Player) private players: Repository<Player>,
  ) {}

  /** Khởi động là cấp tài khoản cho cầu thủ nào chưa có (cả cầu thủ thêm sau này). */
  async onModuleInit() {
    try {
      const r = await this.ensureAccountsForPlayers();
      if (r.created > 0) this.logger.log(`Created ${r.created} player account(s)`);
    } catch (e) {
      this.logger.error(`Seeding player accounts failed: ${(e as Error).message}`);
    }
  }

  async ensureAccountsForPlayers(): Promise<{ created: number; total: number }> {
    const players = await this.players.find();
    const accounts = await this.repo.find();
    const havePlayer = new Set(accounts.map(a => a.player_id));
    const taken = new Set(accounts.map(a => a.username));
    let created = 0;

    for (const p of players) {
      if (havePlayer.has(p.id)) continue;
      const base = usernameFromName(`${p.first_name} ${p.last_name}`) || `player${p.id}`;
      let username = base;
      if (taken.has(username)) username = `${base}${p.num}`;
      for (let n = 2; taken.has(username); n++) username = `${base}${n}`;
      taken.add(username);

      await this.repo.save(this.repo.create({
        player_id: p.id,
        username,
        password_hash: hashPassword(DEFAULT_PASSWORD),
        display_name: `${p.first_name} ${p.last_name}`.trim(),
        is_default_password: true,
      }));
      created++;
    }
    return { created, total: players.length };
  }

  toPublic(a: UserAccount): PublicUser {
    const p = a.player;
    return {
      id: a.id,
      username: a.username,
      display_name: a.display_name,
      is_default_password: a.is_default_password,
      is_active: a.is_active,
      last_login_at: a.last_login_at,
      player: p ? {
        id: p.id, num: p.num, first_name: p.first_name, last_name: p.last_name,
        role: p.role ?? null, nick: p.nick ?? null, image_url: p.image_url ?? null,
      } : null,
    };
  }

  private issue(a: UserAccount) {
    return { token: signToken({ uid: a.id, pv: a.password_version }), user: this.toPublic(a) };
  }

  async login(username: string, password: string) {
    const u = (username || '').trim().toLowerCase();
    const acc = u ? await this.repo.findOne({ where: { username: u }, relations: ['player'] }) : null;
    if (!acc || !acc.is_active || !verifyPassword(password || '', acc.password_hash)) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    acc.last_login_at = new Date();
    await this.repo.update(acc.id, { last_login_at: acc.last_login_at });
    return this.issue(acc);
  }

  async findByToken(token: string): Promise<UserAccount | null> {
    const payload = verifyToken(token);
    if (!payload) return null;
    const acc = await this.repo.findOne({ where: { id: payload.uid }, relations: ['player'] });
    if (!acc || !acc.is_active || acc.password_version !== payload.pv) return null;
    return acc;
  }

  async changePassword(acc: UserAccount, currentPassword: string, newPassword: string) {
    if (!verifyPassword(currentPassword || '', acc.password_hash)) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }
    this.assertPassword(newPassword);
    acc.password_hash = hashPassword(newPassword);
    acc.is_default_password = newPassword === DEFAULT_PASSWORD;
    acc.password_version += 1;
    await this.repo.update(acc.id, {
      password_hash: acc.password_hash,
      is_default_password: acc.is_default_password,
      password_version: acc.password_version,
    });
    return this.issue(acc);
  }

  private assertPassword(pw: string) {
    if (!pw || pw.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
    }
  }

  // ---- Admin ----

  async listAccounts(): Promise<PublicUser[]> {
    const list = await this.repo.find({ relations: ['player'], order: { username: 'ASC' } });
    return list.map(a => this.toPublic(a));
  }

  private async getAccount(id: number) {
    const acc = await this.repo.findOne({ where: { id }, relations: ['player'] });
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  /** Reset về mật khẩu mặc định, hoặc về mật khẩu admin chỉ định. */
  async resetPassword(id: number, password?: string) {
    const acc = await this.getAccount(id);
    const pw = password || DEFAULT_PASSWORD;
    this.assertPassword(pw);
    await this.repo.update(id, {
      password_hash: hashPassword(pw),
      is_default_password: pw === DEFAULT_PASSWORD,
      password_version: acc.password_version + 1,
    });
    return { ok: true, is_default_password: pw === DEFAULT_PASSWORD };
  }

  async updateAccount(id: number, data: { username?: string; is_active?: boolean; display_name?: string }) {
    const acc = await this.getAccount(id);
    const patch: Partial<UserAccount> = {};
    if (data.username !== undefined) {
      const u = String(data.username).trim().toLowerCase();
      if (!USERNAME_RE.test(u)) {
        throw new BadRequestException('Tên đăng nhập chỉ gồm a-z, 0-9, dấu chấm, gạch dưới; 3-50 ký tự');
      }
      const clash = await this.repo.findOne({ where: { username: u, id: Not(id) } });
      if (clash) throw new ConflictException('Tên đăng nhập đã tồn tại');
      patch.username = u;
    }
    if (data.is_active !== undefined) patch.is_active = !!data.is_active;
    if (data.display_name !== undefined) patch.display_name = String(data.display_name).trim() || null;
    if (Object.keys(patch).length) await this.repo.update(id, patch);
    return this.toPublic(await this.getAccount(acc.id));
  }
}
