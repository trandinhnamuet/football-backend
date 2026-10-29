import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LIVE_EVENT_TYPES, LiveEventType, MatchLiveEvent } from '../../entities/match-live-event.entity';
import { MatchLivePosition } from '../../entities/match-live-position.entity';
import { UserAccount } from '../../entities/user-account.entity';
import { AttendanceService, actorName } from './attendance.service';

const PLAYER_TYPES: LiveEventType[] = ['in', 'out', 'sub', 'pass'];

/**
 * Vận hành trận trực tiếp. Server chỉ lưu nhật ký sự kiện; thời gian thi đấu,
 * ai đang trên sân, số đường chuyền đều tính lại ở client từ nhật ký. Các máy
 * thành viên hỏi lại định kỳ (?since=version) nên một người tắt máy, người khác
 * mở ra là thấy đúng trạng thái và vận hành tiếp.
 */
@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(MatchLiveEvent) private events: Repository<MatchLiveEvent>,
    @InjectRepository(MatchLivePosition) private positions: Repository<MatchLivePosition>,
    private attendance: AttendanceService,
  ) {}

  async view(matchId: number, since?: string) {
    const match = await this.attendance.getMatch(matchId);
    const events = await this.events.find({ where: { match_id: matchId }, order: { id: 'ASC' } });
    const attending = await this.attendance.attendingIds(matchId);
    const positions = await this.positions.find({ where: { match_id: matchId } });
    const lastId = events.length ? events[events.length - 1].id : 0;
    const voided = events.filter(e => e.voided_at).length;
    const posStamp = positions.reduce((m, p) => Math.max(m, new Date(p.updated_at).getTime()), 0);
    const version = `${lastId}.${voided}.${attending.version}.${positions.length}-${posStamp}`;
    const server_now = new Date().toISOString();
    if (since && since === version) return { version, server_now, unchanged: true };
    return {
      version,
      server_now,
      match: { id: match.id, week: match.week, date: match.date, time: match.time, opponent: match.opponent, venue: match.venue, pitch_size: match.pitch_size },
      attending: attending.ids,
      positions: positions.map(p => ({ player_id: p.player_id, x: p.x, y: p.y })),
      events: events.map(e => ({
        id: e.id, type: e.type, player_id: e.player_id, player_out_id: e.player_out_id,
        actor_name: e.actor_name, voided_at: e.voided_at, voided_by: e.voided_by, created_at: e.created_at,
      })),
    };
  }

  async add(matchId: number, user: UserAccount, body: { type?: string; player_id?: number; player_out_id?: number }) {
    await this.attendance.getMatch(matchId);
    const type = body?.type as LiveEventType;
    if (!LIVE_EVENT_TYPES.includes(type)) throw new BadRequestException('Loại sự kiện không hợp lệ');
    const playerId = Number(body.player_id) || null;
    const outId = Number(body.player_out_id) || null;
    if (PLAYER_TYPES.includes(type) && !playerId) throw new BadRequestException('Thiếu cầu thủ');
    if (type === 'sub' && (!outId || outId === playerId)) throw new BadRequestException('Thiếu cầu thủ ra sân');
    // Người vào thay đứng đúng chỗ người ra trên sơ đồ sân.
    if (type === 'sub') {
      const from = await this.positions.findOne({ where: { match_id: matchId, player_id: outId! } });
      if (from) await this.savePosition(matchId, playerId!, from.x, from.y, user);
    }
    await this.events.save(this.events.create({
      match_id: matchId,
      type,
      player_id: PLAYER_TYPES.includes(type) ? playerId : null,
      player_out_id: type === 'sub' ? outId : null,
      actor_user_id: user.id,
      actor_name: actorName(user),
    }));
    return this.view(matchId);
  }

  async setPosition(matchId: number, user: UserAccount, body: { player_id?: number; x?: number; y?: number }) {
    await this.attendance.getMatch(matchId);
    const playerId = Number(body?.player_id);
    const x = Number(body?.x);
    const y = Number(body?.y);
    if (!playerId || !Number.isFinite(x) || !Number.isFinite(y)) throw new BadRequestException('Thiếu cầu thủ hoặc toạ độ');
    await this.savePosition(matchId, playerId, x, y, user);
    return this.view(matchId);
  }

  private async savePosition(matchId: number, playerId: number, x: number, y: number, user: UserAccount) {
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    await this.positions.save(this.positions.create({
      match_id: matchId, player_id: playerId, x: clamp(x), y: clamp(y),
      updated_by: actorName(user), updated_at: new Date(),
    }));
  }

  async void(matchId: number, eventId: number, user: UserAccount) {
    const ev = await this.events.findOne({ where: { id: eventId, match_id: matchId } });
    if (!ev) throw new NotFoundException('Không tìm thấy sự kiện');
    if (!ev.voided_at) {
      ev.voided_at = new Date();
      ev.voided_by = actorName(user);
      await this.events.save(ev);
    }
    return this.view(matchId);
  }
}
