import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/** Mật khẩu cấp sẵn cho mọi tài khoản cầu thủ; admin reset cũng về giá trị này. */
export const DEFAULT_PASSWORD = '123123123';

export const MIN_PASSWORD_LENGTH = 6;

/** scrypt + salt ngẫu nhiên, lưu dạng "scrypt$<salt>$<hash>". Không cần thêm dependency. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
