#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_JS="${1:-$SCRIPT_DIR/remote-server.js}"

if [[ ! -f "$SERVER_JS" ]]; then
  echo "Missing $SERVER_JS." >&2
  echo "Run test/api/fetch-remote-server-js.sh first, or pass a server.js path." >&2
  exit 2
fi

echo "Route and SQL-looking lines from $SERVER_JS:"
echo
rg -n \
  "app\\.(get|post|put|delete)|router\\.(get|post|put|delete)|pool\\.query|client\\.query|\\.query\\(|SELECT|FROM|JOIN|WHERE|GROUP BY|ORDER BY|json_agg|row_to_json|json_build_object" \
  "$SERVER_JS"
