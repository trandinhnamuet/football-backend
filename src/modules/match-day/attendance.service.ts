import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AttendanceLog } from '../../entities/attendance-log.entity';
import { Match } from '../../entities/match.entity';
import { Player } from '../../entities/player.entity';
import { UserAccount } from '../../entities/user-account.entity';

/** Trận kết thúc lúc 22:00 giờ Việt Nam ngày thi đấu — giống isMatchPast ở frontend. */
export function matchDayEnd(date: string): number {
  return Date.parse(`${String(date).slice(0, 10)}T22:00:00+07:00`);
}

export function actorName(user: UserAccount): string {
  const p = user.player;
  if (p) return `${p.first_name || ''} ${p.last_name || ''}`.trim() || user.username;
  return user.display_name || user.username;
}

interface LatestRow { id: number; player_id: number; action: string; created_at: Date }

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog) private logs: Repository<AttendanceLog>,
    @InjectRepository(Match) private matches: Repository<Match>,
    @InjectRepository(Player) private players: Repository<Player>,
  ) {}

  async getMatch(matchId: number): Promise<Match> {
    const match = await this.matches.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Không tìm thấy trận đấu');
    return match;
  }

  /** Còn điểm danh được: trận chưa hủy và chưa hết ngày thi đấu. */
  isOpen(match: Match): boolean {
    return match.result !== 'C' && Date.now() < matchDayEnd(match.date);
  }

  /** Lần điểm danh / hủy mới nhất của từng cầu thủ trong trận. */
  async latest(matchId: number): Promise<LatestRow[]> {
    return this.logs.query(
      `SELECT DISTINCT ON (player_id) id, player_id, action, created_at
         FROM football.attendance_logs WHERE match_id = $1
        ORDER BY player_id, id DESC`,
      [matchId],
    );
  }

  /** Cầu thủ đang điểm danh, theo thứ tự điểm danh trước-sau. */
  async attendingIds(matchId: number): Promise<{ ids: number[]; version: number }> {
    const rows = await this.latest(matchId);
    const version = rows.reduce((m, r) => Math.max(m, r.id), 0);
    const ids = rows
      .filter(r => r.action === 'checkin')
      .sort((a, b) => a.id - b.id)
      .map(r => r.player_id);
    return { ids, version };
  }

  async view(matchId: number, user: UserAccount) {
    const match = await this.getMatch(matchId);
    const rows = await this.latest(matchId);
    const byPlayer = new Map(rows.map(r => [r.player_id, r]));
    // Cả đội = cầu thủ đang hoạt động + ai đã từng điểm danh trận này (kể cả đã nghỉ).
    const active = await this.players.find({ where: { is_active: true } });
    const extraIds = rows.map(r => r.player_id).filter(id => !active.some(p => p.id === id));
    const extra = extraIds.length ? await this.players.find({ where: { id: In(extraIds) } }) : [];

    const rank = (s: string | null) => (s === 'in' ? 0 : s === 'out' ? 1 : 2);
    const players = [...active, ...extra]
      .map(p => {
        const r = byPlayer.get(p.id);
        const status = r ? (r.action === 'checkin' ? 'in' : 'out') : null;
        return {
          id: p.id, num: p.num, first_name: p.first_name, last_name: p.last_name,
          nick: p.nick, image_url: p.image_url,
          status, at: r ? r.created_at : null, log_id: r ? r.id : 0,
        };
      })
      .sort((a, b) => rank(a.status) - rank(b.status) || a.log_id - b.log_id || a.num - b.num)
      .map(({ log_id, ...p }) => p);

    return { match_id: match.id, open: this.isOpen(match), my_player_id: user.player_id ?? null, players };
  }

  async set(matchId: number, user: UserAccount, attending: boolean) {
    if (!user.player_id) throw new ForbiddenException('Tài khoản chưa gắn với cầu thủ nào');
    if (typeof attending !== 'boolean') throw new BadRequestException('attending phải là true/false');
    const match = await this.getMatch(matchId);
    if (!this.isOpen(match)) throw new BadRequestException('Trận này đã đóng điểm danh');

    const current = (await this.latest(matchId)).find(r => r.player_id === user.player_id);
    const isIn = current?.action === 'checkin';
    // Bấm lại đúng trạng thái đang có thì không ghi thêm dòng nào.
    if (attending !== isIn && (attending || current)) {
      await this.logs.save(this.logs.create({
        match_id: matchId,
        player_id: user.player_id,
        action: attending ? 'checkin' : 'cancel',
        actor_user_id: user.id,
        actor_name: actorName(user),
      }));
    }
    return this.view(matchId, user);
  }

  /** Toàn bộ lịch sử điểm danh / hủy của một trận, mới nhất trước — cho admin. */
  async adminLogs(matchId: number) {
    await this.getMatch(matchId);
    const logs = await this.logs.find({ where: { match_id: matchId }, order: { id: 'DESC' } });
    const ids = [...new Set(logs.map(l => l.player_id))];
    const players = ids.length ? await this.players.find({ where: { id: In(ids) } }) : [];
    const byId = new Map(players.map(p => [p.id, p]));
    const latest = await this.latest(matchId);
    return {
      current: latest
        .filter(r => r.action === 'checkin')
        .sort((a, b) => a.id - b.id)
        .map(r => ({ player_id: r.player_id, at: r.created_at })),
      logs: logs.map(l => {
        const p = byId.get(l.player_id);
        return {
          id: l.id,
          player_id: l.player_id,
          player_name: p ? `${p.first_name} ${p.last_name}`.trim() : `#${l.player_id}`,
          player_num: p?.num ?? null,
          action: l.action,
          actor_name: l.actor_name,
          created_at: l.created_at,
        };
      }),
    };
  }
}
