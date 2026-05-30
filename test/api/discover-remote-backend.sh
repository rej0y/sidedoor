#!/usr/bin/env bash
set -euo pipefail

SSH_TARGET="${SSH_TARGET:-john@66.112.209.106}"
SSH_PORT="${SSH_PORT:-29955}"
CONTROL_PATH="${CONTROL_PATH:-/tmp/sidedoor-discover-backend-ssh-%r@%h:%p}"

cleanup() {
  ssh -S "$CONTROL_PATH" -p "$SSH_PORT" -O exit "$SSH_TARGET" >/dev/null 2>&1 || true
}
trap cleanup EXIT

usage() {
  cat <<'USAGE'
Usage:
  test/api/discover-remote-backend.sh

Prints remote backend clues over SSH:
  - Node/npm/PM2 process command lines
  - process working directories
  - systemd and Docker hints
  - likely JS entry files
  - JS files containing known API route strings

Environment:
  SSH_TARGET    Optional. Defaults to john@66.112.209.106
  SSH_PORT      Optional. Defaults to 29955
  CONTROL_PATH  Optional. SSH control socket path.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ssh -M -S "$CONTROL_PATH" -fN -p "$SSH_PORT" "$SSH_TARGET"

ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" 'bash -s' <<'REMOTE'
set -u

section() {
  printf '\n== %s ==\n' "$1"
}

section "Host"
hostname 2>/dev/null || true
pwd 2>/dev/null || true

section "Node-like processes"
ps -eo pid,user,comm,args 2>/dev/null | grep -Ei 'node|npm|pm2|bun|deno' | grep -v grep || true

section "Node process working directories"
for pid in $(pgrep -f 'node|npm|pm2|bun|deno' 2>/dev/null || true); do
  printf 'pid=%s\n' "$pid"
  printf 'cwd='
  readlink "/proc/$pid/cwd" 2>/dev/null || true
  printf 'cmd='
  tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true
  printf '\n'
done

section "PM2"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list 2>/dev/null || true
  pm2 describe all 2>/dev/null || true
else
  echo "pm2 not found"
fi

section "systemd services matching app names"
systemctl list-units --type=service --all --no-pager 2>/dev/null | grep -Ei 'node|npm|pm2|sidedoor|professor|api' || true
systemctl --user list-units --type=service --all --no-pager 2>/dev/null | grep -Ei 'node|npm|pm2|sidedoor|professor|api' || true

section "Docker"
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.ID}}\t{{.Image}}\t{{.Names}}\t{{.Ports}}\t{{.Command}}' 2>/dev/null || true
else
  echo "docker not found"
fi

section "Likely JS entry files"
find /home /srv /var/www /opt /usr/local \
  -path '*/node_modules' -prune -o \
  -type f \( -name 'server.js' -o -name 'app.js' -o -name 'index.js' -o -name 'api.js' -o -name 'main.js' \) \
  -print 2>/dev/null | sort || true

section "JS files containing known API strings"
find /home /srv /var/www /opt /usr/local \
  -path '*/node_modules' -prune -o \
  -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \) \
  -print 2>/dev/null |
  xargs -r grep -IlE 'Professor Finder API is running|/professors|/office-hours|/db-test|/buildings|/rooms' 2>/dev/null |
  sort || true
REMOTE
