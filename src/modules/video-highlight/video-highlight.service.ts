import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoHighlight } from '../../entities/video-highlight.entity';

const DEFAULT_CHANNEL_ID = 'UCMs2ne02YyiZskpiJ4lsxbw'; // @fclonfanta

export interface RecommendedVideo {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
}

@Injectable()
export class VideoHighlightService {
  constructor(
    @InjectRepository(VideoHighlight) private repo: Repository<VideoHighlight>,
  ) {}

  // In-memory cache for the RSS-derived recommendation list
  private recCache: { key: string; at: number; videos: RecommendedVideo[] } | null = null;
  private channelIdCache = new Map<string, string>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private async getRow(): Promise<VideoHighlight> {
    let row = await this.repo.findOneBy({ id: 1 });
    if (!row) {
      row = this.repo.create({ id: 1, youtube_url: '', title: 'Video Highlight', title_en: 'Video Highlight', is_active: true });
      row = await this.repo.save(row);
    }
    return row;
  }

  async get(): Promise<VideoHighlight> {
    return this.getRow();
  }

  async update(data: Partial<VideoHighlight>): Promise<VideoHighlight> {
    const row = await this.getRow();
    if (data.youtube_url !== undefined) row.youtube_url = data.youtube_url;
    if (data.title !== undefined) row.title = data.title;
    if (data.title_en !== undefined) row.title_en = data.title_en;
    if (data.is_active !== undefined) row.is_active = data.is_active;
    if (data.channel_url !== undefined) {
      row.channel_url = data.channel_url;
      this.recCache = null; // invalidate cache when channel changes
    }
    return this.repo.save(row);
  }

  /** Resolve a YouTube channel URL/handle to a channel ID (UC...). */
  private async resolveChannelId(channelUrl: string): Promise<string> {
    if (!channelUrl) return DEFAULT_CHANNEL_ID;

    // Already a channel ID URL
    const direct = channelUrl.match(/channel\/(UC[A-Za-z0-9_-]{22})/);
    if (direct) return direct[1];

    if (this.channelIdCache.has(channelUrl)) {
      return this.channelIdCache.get(channelUrl)!;
    }

    try {
      const res = await fetch(channelUrl, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
      });
      const html = await res.text();
      const m =
        html.match(/"externalId":"(UC[A-Za-z0-9_-]{22})"/) ||
        html.match(/channel\/(UC[A-Za-z0-9_-]{22})/);
      if (m) {
        this.channelIdCache.set(channelUrl, m[1]);
        return m[1];
      }
    } catch {
      // fall through to default
    }
    return DEFAULT_CHANNEL_ID;
  }

  private parseFeed(xml: string): RecommendedVideo[] {
    const videos: RecommendedVideo[] = [];
    // Each video is wrapped in an <entry>…</entry>
    const entries = xml.split('<entry>').slice(1);
    for (const entry of entries) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<media:title>([^<]+)<\/media:title>/)?.[1]
        || entry.match(/<title>([^<]+)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
      const thumb = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];
      if (!id || !title) continue;
      videos.push({
        videoId: id,
        title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        published,
        thumbnail: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      });
    }
    return videos;
  }

  /** Fetch the latest videos from the configured YouTube channel (RSS), cached. */
  async getRecommendations(): Promise<RecommendedVideo[]> {
    const row = await this.getRow();
    const channelUrl = row.channel_url || 'https://www.youtube.com/@fclonfanta';

    if (this.recCache && this.recCache.key === channelUrl && Date.now() - this.recCache.at < this.CACHE_TTL) {
      return this.recCache.videos;
    }

    try {
      const channelId = await this.resolveChannelId(channelUrl);
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const xml = await res.text();
      const videos = this.parseFeed(xml).slice(0, 15);
      this.recCache = { key: channelUrl, at: Date.now(), videos };
      return videos;
    } catch {
      // Serve stale cache if available, otherwise empty
      return this.recCache?.videos || [];
    }
  }
}
