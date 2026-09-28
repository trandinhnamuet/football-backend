import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Token phiên đăng nhập: payload base64url + chữ ký HMAC-SHA256, không lưu DB.
 * Đăng xuất = client bỏ token. Đổi/reset mật khẩu làm tăng password_version
 * nên token cũ tự hết hiệu lực.
 */
export interface TokenPayload {
  /** id tài khoản */
  uid: number;
  /** password_version tại thời điểm cấp token */
  pv: number;
  /** hạn (ms epoch) */
  exp: number;
}

const TOKEN_TTL_MS = 30 * 24 * 3600 * 1000;

function secret(): string {
  // AUTH_SECRET riêng nếu có; không thì suy ra từ ADMIN_PASSWORD để khỏi phải
  // thêm biến môi trường trên server.
  return (
    process.env.AUTH_SECRET ||
    createHash('sha256').update(`lffc-auth:${process.env.ADMIN_PASSWORD || ''}`).digest('hex')
  );
}

export function signToken(payload: Omit<TokenPayload, 'exp'>): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined | null): TokenPayload | null {
  const [body, sig] = (token || '').split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', secret()).update(body).digest();
  const given = Buffer.from(sig, 'base64url');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (!p.uid || !p.exp || Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}
