#!/usr/bin/env bash
set -euo pipefail

SSH_TARGET="${SSH_TARGET:-john@66.112.209.106}"
SSH_PORT="${SSH_PORT:-29955}"
CONTROL_PATH="${CONTROL_PATH:-/tmp/sidedoor-fetch-server-js-ssh-%r@%h:%p}"
REMOTE_SERVER_JS="${REMOTE_SERVER_JS:-}"
OUTPUT_FILE="${OUTPUT_FILE:-test/api/remote-server.js}"
USE_SUDO="${USE_SUDO:-0}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cleanup() {
  ssh -S "$CONTROL_PATH" -p "$SSH_PORT" -O exit "$SSH_TARGET" >/dev/null 2>&1 || true
}
trap cleanup EXIT

usage() {
  cat <<'USAGE'
Usage:
  test/api/fetch-remote-server-js.sh

Fetches the deployed backend JS file from the remote host into test/api/remote-server.js.
The output file is gitignored because backend files often contain credentials.

Environment:
  SSH_TARGET        Optional. Defaults to john@66.112.209.106
  SSH_PORT          Optional. Defaults to 29955
  REMOTE_SERVER_JS  Optional. Exact remote path to the backend JS file.
  OUTPUT_FILE       Optional. Defaults to test/api/remote-server.js
  CONTROL_PATH      Optional. SSH control socket path.
  USE_SUDO          Optional. Set to 1 if john cannot read the backend file.

Examples:
  test/api/fetch-remote-server-js.sh
  REMOTE_SERVER_JS=/home/john/app/server.js test/api/fetch-remote-server-js.sh
  USE_SUDO=1 REMOTE_SERVER_JS=/home/harim/professor-finder-api/server.js test/api/fetch-remote-server-js.sh
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ssh -M -S "$CONTROL_PATH" -fN -p "$SSH_PORT" "$SSH_TARGET"

if [[ -z "$REMOTE_SERVER_JS" ]]; then
  mapfile -t candidates < <(
    ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
      "find /home /srv /var/www /opt /usr/local -path '*/node_modules' -prune -o -type f \\( -name server.js -o -name app.js -o -name index.js -o -name api.js -o -name main.js \\) -print 2>/dev/null | xargs -r grep -IlE 'Professor Finder API is running|/professors|/office-hours|/db-test|/buildings|/rooms' 2>/dev/null" || true
  )

  if [[ "${#candidates[@]}" -eq 0 ]]; then
    mapfile -t candidates < <(
      ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
        "ps -eo args 2>/dev/null | sed -nE 's#^node[[:space:]]+([^[:space:]]+\\.js).*#\\1#p' | sort -u" || true
    )
  fi

  if [[ "${#candidates[@]}" -eq 0 ]]; then
    echo "No backend JS file containing the known API route strings was found." >&2
    echo "Run test/api/discover-remote-backend.sh, then set REMOTE_SERVER_JS=/path/to/backend.js and run again." >&2
    exit 1
  fi

  if [[ "${#candidates[@]}" -eq 1 ]]; then
    REMOTE_SERVER_JS="${candidates[0]}"
  else
    echo "Multiple server.js files found:"
    printf '  %s\n' "${candidates[@]}"
    echo
    echo "Set REMOTE_SERVER_JS to the deployed backend path and run again."
    exit 1
  fi
fi

mkdir -p "$ROOT_DIR/$(dirname "$OUTPUT_FILE")"

if [[ "$USE_SUDO" == "1" ]]; then
  remote_tmp="/tmp/sidedoor-remote-server-js.$$"
  ssh -t -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
    "sudo cp '$REMOTE_SERVER_JS' '$remote_tmp' && sudo chown \"\$(id -un):\$(id -gn)\" '$remote_tmp' && chmod 600 '$remote_tmp'"
  ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
    "cat '$remote_tmp' && rm -f '$remote_tmp'" > "$ROOT_DIR/$OUTPUT_FILE"
else
  ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
    "cat '$REMOTE_SERVER_JS'" > "$ROOT_DIR/$OUTPUT_FILE"
fi

echo "Fetched $REMOTE_SERVER_JS -> $OUTPUT_FILE"
echo "Review it locally, then copy the exact SQL into test/sql/*.sql."
