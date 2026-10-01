/** Độ dài tối đa của slug — đủ cho tiêu đề dài mà URL vẫn gọn. */
const MAX_SLUG_LENGTH = 80;

/**
 * "[MATCH RESULT] Lon Fanta 4-3 Okiwa" → "match-result-lon-fanta-4-3-okiwa".
 * Bỏ dấu tiếng Việt (kể cả đ/Đ), chỉ giữ a-z0-9 nối bằng "-", cắt ở ranh giới
 * từ để không bị nửa chữ.
 */
export function slugify(input: string): string {
  const base = (input || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= MAX_SLUG_LENGTH) return base;
  const cut = base.slice(0, MAX_SLUG_LENGTH);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
}

/** Thêm hậu tố -2, -3… cho tới khi không trùng slug nào đã dùng. */
export function uniqueSlug(base: string, taken: (slug: string) => boolean): string {
  const root = base || 'bai-viet';
  if (!taken(root)) return root;
  for (let i = 2; ; i++) {
    const candidate = `${root}-${i}`;
    if (!taken(candidate)) return candidate;
  }
}
