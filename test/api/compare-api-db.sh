#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://66.112.209.106:3000}"
PROFESSOR_ID="${PROFESSOR_ID:-436}"
TEST_CASE="${1:-professors}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$SCRIPT_DIR/sql"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

usage() {
  cat <<'USAGE'
Usage:
  test/api/compare-api-db.sh <case>

Cases:
  db-test
  professors
  professor
  professor-endpoints
  buildings
  rooms
  office-hours

Environment:
  DATABASE_URL    Optional for DB comparison cases. Postgres connection string for psql.
  PGHOST          Optional when DATABASE_URL is not set. Defaults to libpq behavior.
  PGPORT          Optional when DATABASE_URL is not set. Defaults to libpq behavior.
  PGUSER          Optional when DATABASE_URL is not set. Defaults to libpq behavior.
  PGDATABASE      Required when DATABASE_URL is not set for DB comparison cases.
  PGPASSWORD      Optional. Lets psql authenticate without an interactive prompt.
  API_BASE_URL    Optional. Defaults to http://66.112.209.106:3000
  PROFESSOR_ID    Optional. Defaults to 436 for dynamic professor endpoints.

Examples:
  DATABASE_URL='postgres://user:pass@host:5432/db' test/api/compare-api-db.sh professors
  PGUSER=postgres PGDATABASE=university test/api/compare-api-db.sh professors
  PROFESSOR_ID=1 DATABASE_URL='postgres://user:pass@host:5432/db' test/api/compare-api-db.sh professor
  test/api/compare-api-db.sh professor-endpoints
USAGE
}

if [[ "${TEST_CASE}" == "-h" || "${TEST_CASE}" == "--help" ]]; then
  usage
  exit 0
fi

fetch_json() {
  local endpoint="$1"
  local body_file="$2"
  local status_file="$3"
  local json_file="$4"

  curl -sS \
    -w '%{http_code}' \
    -o "$body_file" \
    "$API_BASE_URL$endpoint" > "$status_file"

  if ! jq -S . "$body_file" > "$json_file"; then
    echo "API did not return JSON for $endpoint." >&2
    echo "HTTP status: $(cat "$status_file")" >&2
    cat "$body_file" >&2
    exit 1
  fi
}

run_professor_endpoint_consistency() {
  local list_raw="$TMP_DIR/professors.raw"
  local list_status="$TMP_DIR/professors.status"
  local list_json="$TMP_DIR/professors.json"
  local ids_file="$TMP_DIR/professor-ids.txt"
  local count
  local failures=0

  fetch_json "/professors" "$list_raw" "$list_status" "$list_json"

  if [[ "$(cat "$list_status")" != "200" ]]; then
    echo "GET /professors returned HTTP $(cat "$list_status"), expected 200." >&2
    exit 1
  fi

  if [[ "$(jq -r 'type' "$list_json")" != "array" ]]; then
    echo "GET /professors did not return a JSON array." >&2
    exit 1
  fi

  jq -r '.[].professor_id' "$list_json" > "$ids_file"
  count="$(wc -l < "$ids_file")"

  echo "Case: professor-endpoints"
  echo "Endpoint source: GET /professors"
  echo "Detail endpoint: GET /professors/:id"
  echo "Professor IDs to check: $count"

  while IFS= read -r professor_id; do
    local expected_json="$TMP_DIR/professor-$professor_id.expected.json"
    local actual_raw="$TMP_DIR/professor-$professor_id.raw"
    local actual_status="$TMP_DIR/professor-$professor_id.status"
    local actual_json="$TMP_DIR/professor-$professor_id.actual.json"

    jq -S --arg professor_id "$professor_id" \
      '.[] | select(.professor_id == $professor_id)' \
      "$list_json" > "$expected_json"

    fetch_json "/professors/$professor_id" "$actual_raw" "$actual_status" "$actual_json"

    if [[ "$(cat "$actual_status")" != "200" ]]; then
      echo "MISMATCH professor_id=$professor_id: HTTP $(cat "$actual_status"), expected 200." >&2
      failures=$((failures + 1))
      continue
    fi

    if ! diff -u "$expected_json" "$actual_json" > "$TMP_DIR/professor-$professor_id.diff"; then
      echo "MISMATCH professor_id=$professor_id" >&2
      cat "$TMP_DIR/professor-$professor_id.diff" >&2
      failures=$((failures + 1))
    fi
  done < "$ids_file"

  if [[ "$failures" -gt 0 ]]; then
    echo "Result: MISMATCH ($failures professor endpoint checks failed)"
    exit 1
  fi

  echo "Result: MATCH (all $count professor detail endpoints match /professors)"
}

if [[ "$TEST_CASE" == "professor-endpoints" ]]; then
  run_professor_endpoint_consistency
  exit 0
fi

if [[ -z "${DATABASE_URL:-}" && -z "${PGDATABASE:-}" ]]; then
  echo "DATABASE_URL or PGDATABASE is required for case: $TEST_CASE" >&2
  echo >&2
  usage >&2
  exit 2
fi

case "$TEST_CASE" in
  db-test)
    endpoint="/db-test"
    sql_file="$SQL_DIR/db-test.sql"
    ;;
  professors)
    endpoint="/professors"
    sql_file="$SQL_DIR/professors.sql"
    ;;
  professor)
    endpoint="/professors/$PROFESSOR_ID"
    sql_file="$SQL_DIR/professor-by-id.sql"
    ;;
  buildings)
    endpoint="/buildings"
    sql_file="$SQL_DIR/buildings.sql"
    ;;
  rooms)
    endpoint="/rooms"
    sql_file="$SQL_DIR/rooms.sql"
    ;;
  office-hours)
    endpoint="/office-hours/$PROFESSOR_ID"
    sql_file="$SQL_DIR/office-hours-by-professor.sql"
    ;;
  *)
    echo "Unknown case: $TEST_CASE" >&2
    echo >&2
    usage >&2
    exit 2
    ;;
esac

if [[ ! -f "$sql_file" ]]; then
  echo "Missing SQL file: $sql_file" >&2
  exit 2
fi

api_raw="$TMP_DIR/api.raw"
api_status="$TMP_DIR/api.status"
api_json="$TMP_DIR/api.json"
db_raw="$TMP_DIR/db.raw"
db_json="$TMP_DIR/db.json"

fetch_json "$endpoint" "$api_raw" "$api_status" "$api_json"

status="$(cat "$api_status")"

psql_target=()
if [[ -n "${DATABASE_URL:-}" ]]; then
  psql_target=("$DATABASE_URL")
fi

psql "${psql_target[@]}" \
  --no-align \
  --tuples-only \
  --quiet \
  --set=ON_ERROR_STOP=1 \
  --set=professor_id="$PROFESSOR_ID" \
  --file="$sql_file" > "$db_raw"

if ! jq -S . "$db_raw" > "$db_json"; then
  echo "Database query did not return valid JSON." >&2
  echo "SQL file: $sql_file" >&2
  cat "$db_raw" >&2
  exit 1
fi

api_count="$(jq 'if type == "array" then length else 1 end' "$api_json")"
db_count="$(jq 'if type == "array" then length else 1 end' "$db_json")"

echo "Case: $TEST_CASE"
echo "Endpoint: GET $endpoint"
echo "HTTP status: $status"
echo "API JSON count: $api_count"
echo "DB JSON count: $db_count"

if diff -u "$db_json" "$api_json"; then
  echo "Result: MATCH"
else
  echo "Result: MISMATCH"
  exit 1
fi
