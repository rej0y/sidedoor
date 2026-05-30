# API vs Postgres Tests

These tests compare live API output with the JSON returned by a Postgres query.

Run them from the Nix shell:

```bash
nix develop
```

Set the database connection string:

```bash
export DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/DB_NAME'
```

Run a comparison:

```bash
test/api/compare-api-db.sh professors
test/api/compare-api-db.sh buildings
test/api/compare-api-db.sh rooms
PROFESSOR_ID=436 test/api/compare-api-db.sh professor
PROFESSOR_ID=436 test/api/compare-api-db.sh office-hours
```

Run the stronger professor endpoint consistency check:

```bash
test/api/compare-api-db.sh professor-endpoints
```

That check does not require `DATABASE_URL`. It fetches `GET /professors`, then checks every returned `professor_id` against `GET /professors/:id` and diffs the JSON object.

The SQL files in `test/api/sql/` output exactly one JSON value. For array endpoints, they output a JSON array. For object endpoints, they output a JSON object.

The current SQL files are based on the deployed `server.js` route queries fetched from `/home/harim/professor-finder-api/server.js`. ID fields are cast to text where needed so `psql` JSON matches the Node Postgres API output.

## Getting the Real Server Queries

The frontend repo does not currently include `server.js`, so fetch the deployed backend file from the server:

```bash
nix develop
test/api/fetch-remote-server-js.sh
```

If more than one `server.js` is found, rerun with the deployed backend path:

```bash
REMOTE_SERVER_JS=/path/to/server.js test/api/fetch-remote-server-js.sh
```

If no backend file is found, run the discovery helper:

```bash
test/api/discover-remote-backend.sh
```

Look for the running Node process working directory or a JS file containing the known route strings, then fetch that file explicitly:

```bash
REMOTE_SERVER_JS=/path/from/discovery/output.js test/api/fetch-remote-server-js.sh
```

If the file exists under another user's home and `john` cannot read it, use sudo mode:

```bash
USE_SUDO=1 REMOTE_SERVER_JS=/home/harim/professor-finder-api/server.js test/api/fetch-remote-server-js.sh
```

The file is saved as `test/api/remote-server.js` and is intentionally gitignored because backend files may contain secrets.

After fetching it, inspect the routes and SQL-looking lines:

```bash
test/api/extract-route-sql.sh
```

Use the extracted route SQL to verify these files stay aligned with the server:

```text
test/api/sql/professors.sql
test/api/sql/professor-by-id.sql
test/api/sql/buildings.sql
test/api/sql/rooms.sql
test/api/sql/office-hours-by-professor.sql
```

Recommended workflow:

```bash
test/api/compare-api-db.sh professors
test/api/compare-api-db.sh professor-endpoints
```

If both pass, then the full professor list matches the database query and each individual professor endpoint matches its corresponding object from the list endpoint.

## Running on the Server

Use the remote runner when Postgres is only available from the server:

```bash
nix develop
PGUSER=postgres PGDATABASE=university test/api/run-remote-api-db.sh professors
```

The remote runner copies this `test/api/` folder to `/tmp/sidedoor-api-db-test` on the server, opens an SSH session, and prompts for the Postgres password interactively. The password is not saved in this repo or included in the command.

Examples:

```bash
PGUSER=postgres test/api/run-remote-api-db.sh list-dbs
PGUSER=postgres PGDATABASE=university test/api/run-remote-api-db.sh professors
PGUSER=postgres PGDATABASE=university PROFESSOR_ID=436 test/api/run-remote-api-db.sh professor
PGUSER=postgres PGDATABASE=university PROFESSOR_ID=436 test/api/run-remote-api-db.sh office-hours
```

For fish, use `env` instead of Bash-style variable prefixes:

```fish
env PGUSER=postgres PGDATABASE=university test/api/run-remote-api-db.sh professors
env PGUSER=postgres PGDATABASE=university PROFESSOR_ID=436 test/api/run-remote-api-db.sh professor
```
