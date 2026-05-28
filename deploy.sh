#!/bin/bash
set -e

# ── Màu sắc output ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[✔]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }

# ── Đường dẫn ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/football-backend"
FRONTEND_DIR="$SCRIPT_DIR/football-frontend"

[ -d "$BACKEND_DIR" ]  || err "Không tìm thấy thư mục: $BACKEND_DIR"
[ -d "$FRONTEND_DIR" ] || err "Không tìm thấy thư mục: $FRONTEND_DIR"

# ── Tùy chọn: chỉ deploy backend hoặc frontend ──────────────────────────────
TARGET="${1:-all}"   # all | backend | frontend

# ════════════════════════════════════════════════════════════════════════════
deploy_backend() {
  log "═══ BACKEND ═══════════════════════════════════"
  cd "$BACKEND_DIR"

  log "Dừng process: football-backend"
  pm2 stop football-backend 2>/dev/null || warn "Process chưa chạy, bỏ qua stop"

  log "Git pull..."
  git pull || err "git pull backend thất bại"

  log "Cài dependencies (production)..."
  npm ci --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev

  log "Build NestJS..."
  npm run build || err "Build backend thất bại"

  log "Khởi động lại backend..."
  pm2 start ecosystem.config.js --only football-backend 2>/dev/null \
    || pm2 restart football-backend

  ok "Backend deploy xong!"
}

# ════════════════════════════════════════════════════════════════════════════
deploy_frontend() {
  log "═══ FRONTEND ══════════════════════════════════"
  cd "$FRONTEND_DIR"

  log "Dừng process: football-frontend"
  pm2 stop football-frontend 2>/dev/null || warn "Process chưa chạy, bỏ qua stop"

  log "Git pull..."
  git pull || err "git pull frontend thất bại"

  log "Cài dependencies..."
  npm ci --prefer-offline 2>/dev/null || npm install

  log "Build Next.js..."
  npm run build || err "Build frontend thất bại"

  log "Khởi động lại frontend..."
  pm2 start ecosystem.config.js --only football-frontend 2>/dev/null \
    || pm2 restart football-frontend

  ok "Frontend deploy xong!"
}

# ════════════════════════════════════════════════════════════════════════════
log "Bắt đầu deploy — target: $TARGET"
echo ""

case "$TARGET" in
  backend)  deploy_backend ;;
  frontend) deploy_frontend ;;
  all)
    deploy_backend
    echo ""
    deploy_frontend
    ;;
  *) err "Target không hợp lệ: '$TARGET'. Dùng: all | backend | frontend" ;;
esac

echo ""
log "═══ PM2 STATUS ════════════════════════════════"
pm2 list

echo ""
ok "Deploy hoàn tất!"
