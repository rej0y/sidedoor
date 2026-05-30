#!/usr/bin/env bash
set -euo pipefail

SSH_TARGET="${SSH_TARGET:-john@66.112.209.106}"
SSH_PORT="${SSH_PORT:-29955}"
REMOTE_DIR="${REMOTE_DIR:-/tmp/sidedoor-api-db-test}"
TEST_CASE="${1:-professors}"
CONTROL_PATH="${CONTROL_PATH:-/tmp/sidedoor-api-db-test-ssh-%r@%h:%p}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_DIR="${TEST_DIR:-${SCRIPT_DIR#$ROOT_DIR/}}"

cleanup() {
  ssh -S "$CONTROL_PATH" -p "$SSH_PORT" -O exit "$SSH_TARGET" >/dev/null 2>&1 || true
}
trap cleanup EXIT

usage() {
  cat <<'USAGE'
Usage:
  test/api/run-remote-api-db.sh <case>

This copies the local test harness to the server over SSH, then runs the
selected comparison case on the server.

Cases:
  list-dbs
  db-test
  professors
  professor
  professor-endpoints
  buildings
  rooms
  office-hours

Environment:
  SSH_TARGET      Optional. Defaults to john@66.112.209.106
  SSH_PORT        Optional. Defaults to 29955
  REMOTE_DIR      Optional. Defaults to /tmp/sidedoor-api-db-test
  CONTROL_PATH    Optional. Defaults to /tmp/sidedoor-api-db-test-ssh-%r@%h:%p
  PGDATABASE      Required for DB comparison cases.
  PGUSER          Optional. Defaults to postgres.
  PGHOST          Optional. Defaults to localhost.
  PGPORT          Optional. Defaults to 5432.
  PROFESSOR_ID    Optional. Defaults to 436.

Examples:
  test/api/run-remote-api-db.sh list-dbs
  PGDATABASE=university test/api/run-remote-api-db.sh professors
  PGDATABASE=university PROFESSOR_ID=436 test/api/run-remote-api-db.sh professor
  test/api/run-remote-api-db.sh professor-endpoints
USAGE
}

if [[ "${TEST_CASE}" == "-h" || "${TEST_CASE}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$TEST_CASE" != "professor-endpoints" && "$TEST_CASE" != "list-dbs" && -z "${PGDATABASE:-}" ]]; then
  echo "PGDATABASE is required for DB comparison case: $TEST_CASE" >&2
  echo >&2
  usage >&2
  exit 2
fi

ssh -M -S "$CONTROL_PATH" -fN -p "$SSH_PORT" "$SSH_TARGET"

if [[ "$TEST_CASE" == "list-dbs" ]]; then
  ssh -t -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
    "export PGHOST='${PGHOST:-localhost}' && \
     export PGPORT='${PGPORT:-5432}' && \
     export PGUSER='${PGUSER:-postgres}' && \
     printf 'Postgres password for %s: ' \"\${PGUSER}\"; \
     stty -echo; read PGPASSWORD; stty echo; printf '\n'; \
     export PGPASSWORD; \
     psql -h \"\${PGHOST}\" -p \"\${PGPORT}\" -U \"\${PGUSER}\" -l"
  exit 0
fi

tar -C "$ROOT_DIR" -czf - "$TEST_DIR" | ssh -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
  "rm -rf '$REMOTE_DIR' && mkdir -p '$REMOTE_DIR' && tar -xzf - -C '$REMOTE_DIR'"

ssh -t -S "$CONTROL_PATH" -p "$SSH_PORT" "$SSH_TARGET" \
  "cd '$REMOTE_DIR' && \
   export API_BASE_URL='${API_BASE_URL:-http://66.112.209.106:3000}' && \
   export PGHOST='${PGHOST:-localhost}' && \
   export PGPORT='${PGPORT:-5432}' && \
   export PGUSER='${PGUSER:-postgres}' && \
   export PGDATABASE='${PGDATABASE:-}' && \
   export PROFESSOR_ID='${PROFESSOR_ID:-436}' && \
   if [ '$TEST_CASE' != 'professor-endpoints' ]; then \
     printf 'Postgres password for %s: ' \"\${PGUSER}\"; \
     stty -echo; read PGPASSWORD; stty echo; printf '\n'; \
     export PGPASSWORD; \
   fi; \
   bash '$TEST_DIR/compare-api-db.sh' '$TEST_CASE'"
