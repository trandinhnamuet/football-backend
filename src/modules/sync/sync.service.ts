import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { Player } from '../../entities/player.entity';
import { Match } from '../../entities/match.entity';
import { SyncCache } from '../../entities/sync-cache.entity';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private lastSyncHash = '';
  private lastSyncTime = 0;
  private readonly SYNC_COOLDOWN = 5 * 60 * 1000;

  constructor(
    @InjectRepository(Player) private playerRepo: Repository<Player>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(SyncCache) private cacheRepo: Repository<SyncCache>,
    private config: ConfigService,
  ) {}

  private getExportUrl(dataUrl: string): string {
    const match = dataUrl.match(/\/spreadsheets\/d\/([^/]+)/);
    const gidMatch = dataUrl.match(/[?&#]gid=(\d+)/);
    if (!match) throw new Error('Invalid Google Sheets URL');
    const id = match[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  }

  private md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private splitLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }

  private parseCSVRows(csv: string): string[][] {
    return csv.trim().split(/\r?\n/).map(line => this.splitLine(line));
  }

  private toInt(v: string | undefined): number {
    if (!v) return 0;
    const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }

  private toFloat(v: string | undefined): number {
    if (!v) return 0;
    const n = parseFloat(v.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  private parseScore(score: string): { gf: number; ga: number; result: string } | null {
    if (!score || score.trim() === '') return null;
    // Handle "5 - 4" or "5-4"
    const m = score.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (m) {
      const gf = parseInt(m[1]);
      const ga = parseInt(m[2]);
      return { gf, ga, result: gf > ga ? 'W' : gf < ga ? 'L' : 'D' };
    }
    return null;
  }

  private parseDateVN(dateStr: string): string | null {
    if (!dateStr) return null;
    // Handles "12/05/2026" (DD/MM/YYYY)
    const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return null;
  }

  private splitFullName(name: string): { first_name: string; last_name: string } {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { first_name: parts[0], last_name: '' };
    // Vietnamese: family name first, given name last
    const last_name = parts[parts.length - 1];
    const first_name = parts.slice(0, -1).join(' ');
    return { first_name, last_name };
  }

  async syncFromExcel(force = false): Promise<{ synced: boolean; message: string; count?: number }> {
    const now = Date.now();
    if (!force && now - this.lastSyncTime < this.SYNC_COOLDOWN) {
      return { synced: false, message: 'Sync cooldown active, skipped' };
    }

    const dataUrl = this.config.get<string>('DATA_URL');
    if (!dataUrl) return { synced: false, message: 'DATA_URL not configured' };

    let csvData: string;
    try {
      const exportUrl = this.getExportUrl(dataUrl);
      const response = await axios.get(exportUrl, {
        timeout: 15000,
        maxRedirects: 5,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      csvData = typeof response.data === 'string' ? response.data : String(response.data);
    } catch (err) {
      this.logger.error('Failed to fetch Excel:', err.message);
      return { synced: false, message: `Fetch failed: ${err.message}` };
    }

    const hash = this.md5(csvData);
    if (!force && hash === this.lastSyncHash) {
      this.lastSyncTime = now;
      return { synced: false, message: 'Data unchanged' };
    }

    const rows = this.parseCSVRows(csvData);

    // Find header row: the row that starts with "STT"
    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0]?.toLowerCase() === 'stt' || rows[i][0] === 'STT') {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx < 0) {
      return { synced: false, message: 'Cannot find STT header row in CSV' };
    }

    // Parse match metadata from rows above header
    await this.syncMatches(rows, headerIdx);

    // Parse player data from rows after header
    const playerRows = rows.slice(headerIdx + 1).filter(row => {
      const stt = this.toInt(row[0]);
      return stt > 0 && row[1] && row[1].trim() !== '';
    });

    if (playerRows.length === 0) {
      return { synced: false, message: 'No player rows found' };
    }

    const excelNums = new Set<number>();

    for (const row of playerRows) {
      const num = this.toInt(row[0]);
      const fullName = row[1]?.trim();
      if (!num || !fullName) continue;

      excelNums.add(num);
      const { first_name, last_name } = this.splitFullName(fullName);

      // Aggregate stats: col[2]=attendance, col[3]=goals, col[4]=assists
      const attendance = this.toInt(row[2]);
      const goals = this.toInt(row[3]);
      const assists = this.toInt(row[4]);

      // Calculate points
      const points = goals * 5 + assists * 3 + attendance * 2;

      // Count total matches played = number of match columns with any data (Có/Không)
      const totalMatchCols = rows[headerIdx].slice(6).filter((h, i) => i % 3 === 0 && h).length;

      const existing = await this.playerRepo.findOne({ where: { num } });

      if (existing) {
        await this.playerRepo.update(existing.id, {
          first_name: first_name || existing.first_name,
          last_name: last_name !== undefined ? last_name : existing.last_name,
          is_active: true,
          stat_goals: goals,
          stat_assists: assists,
          stat_attendance: attendance,
          stat_points: points,
          stat_matches: totalMatchCols || existing.stat_matches,
        });
      } else {
        await this.playerRepo.save({
          num,
          first_name,
          last_name,
          role: 'Tự do',
          joined: new Date().getFullYear().toString(),
          boots: 'Phải',
          nick: last_name || first_name,
          is_active: true,
          stat_goals: goals,
          stat_assists: assists,
          stat_attendance: attendance,
          stat_points: points,
          stat_matches: totalMatchCols,
        });
      }
    }

    // Deactivate players not in Excel
    const allActive = await this.playerRepo.find({ where: { is_active: true } });
    for (const p of allActive) {
      if (!excelNums.has(p.num)) {
        await this.playerRepo.update(p.id, { is_active: false });
        this.logger.log(`Deactivated player #${p.num} ${p.first_name} ${p.last_name}`);
      }
    }

    this.lastSyncHash = hash;
    this.lastSyncTime = now;

    this.logger.log(`Sync complete: ${playerRows.length} players processed`);
    return { synced: true, message: 'Sync successful', count: playerRows.length };
  }

  private async syncMatches(rows: string[][], headerIdx: number) {
    // Dates are in row 0 (first row), starting at column 6 (every 3 cols)
    // Opponents in row above the score row, scores are 2 rows above header
    if (headerIdx < 3) return;

    const dateRow = rows[0];
    const opponentRow = rows[headerIdx - 2];
    const scoreRow = rows[headerIdx - 1];

    // Match columns start at index 6, every 3 cols
    let week = 1;
    for (let col = 6; col < dateRow.length; col += 3) {
      const dateStr = dateRow[col];
      const opponent = opponentRow?.[col] || '';
      const scoreStr = scoreRow?.[col] || '';

      const date = this.parseDateVN(dateStr);
      if (!date || !opponent) continue;

      // Skip "Chia đôi" (internal matches) or empty opponents
      if (opponent.toLowerCase().includes('chia đôi')) {
        week++;
        continue;
      }

      const score = this.parseScore(scoreStr);
      const isUpcoming = !score;
      const today = new Date().toISOString().slice(0, 10);

      const existing = await this.matchRepo.findOne({ where: { date, opponent } });
      if (!existing) {
        const newMatch = this.matchRepo.create({
          week,
          date,
          opponent,
          venue: 'Sân Đầm Hồng',
          result: score?.result || undefined,
          score: scoreStr || undefined,
          goals_for: score?.gf || 0,
          goals_against: score?.ga || 0,
          is_upcoming: isUpcoming || date > today,
          time: '17:30',
        });
        await this.matchRepo.save(newMatch);
      } else if (score && !existing.result) {
        await this.matchRepo.update(existing.id, {
          result: score.result,
          score: scoreStr,
          goals_for: score.gf,
          goals_against: score.ga,
          is_upcoming: false,
        });
      }
      week++;
    }
  }
}
