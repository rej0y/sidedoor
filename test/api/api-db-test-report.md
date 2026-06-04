# API vs Postgres Test Report

## Summary

The deployed API was compared against direct Postgres query output using the test harness in `test/api/`.

The main API-vs-DB checks passed:

- `GET /professors`: match, 433 rows
- `GET /buildings`: match, 15 rows
- `GET /rooms`: match, 426 rows
- `GET /professors/436`: match, not-found JSON
- `GET /office-hours/436`: match, empty array

The professor detail endpoint consistency check also passed:

- All 433 `GET /professors/:id` responses match the corresponding object from `GET /professors`.

## Test Environment

- API base URL: `http://66.112.209.106:3000`
- SSH target: `john@66.112.209.106`
- SSH port: `29955`
- Postgres user: `postgres`
- Postgres database: `university`
- Local test directory: `test/api/`
- Backend source used for SQL reference: `/home/harim/professor-finder-api/server.js`

Passwords were entered interactively and were not saved in the repository.

## Test Method

For each API-vs-DB comparison:

1. The script calls the live API endpoint.
2. The script runs the matching SQL query directly against Postgres.
3. Both JSON outputs are normalized with `jq -S`.
4. The normalized JSON outputs are compared with `diff`.
5. A test passes only when the full JSON output matches.

The SQL files are based on the deployed `server.js` route queries:

- `test/api/sql/professors.sql`
- `test/api/sql/professor-by-id.sql`
- `test/api/sql/buildings.sql`
- `test/api/sql/rooms.sql`
- `test/api/sql/office-hours-by-professor.sql`

ID fields are cast to text in the SQL wrappers where needed so direct `psql` JSON matches the Node/Postgres API output.

## Results

| Endpoint | Command | API Count | DB Count | Result | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `GET /professors` | `env PGUSER=postgres PGDATABASE=university ./test/api/run-remote-api-db.sh professors` | 433 | 433 | Match | Full professor list matched direct Postgres query output. |
| `GET /buildings` | `env PGUSER=postgres PGDATABASE=university ./test/api/run-remote-api-db.sh buildings` | 15 | 15 | Match | Building list matched direct Postgres query output. |
| `GET /rooms` | `env PGUSER=postgres PGDATABASE=university ./test/api/run-remote-api-db.sh rooms` | 426 | 426 | Match | Room list matched direct Postgres query output. |
| `GET /professors/436` | `env PGUSER=postgres PGDATABASE=university PROFESSOR_ID=436 ./test/api/run-remote-api-db.sh professor` | 1 | 1 | Match | API returned HTTP `404`; DB wrapper returned matching `{"error":"Professor not found"}` JSON. |
| `GET /office-hours/436` | `env PGUSER=postgres PGDATABASE=university PROFESSOR_ID=436 ./test/api/run-remote-api-db.sh office-hours` | 0 | 0 | Match | Both API and DB query returned an empty array. |

## API Consistency Check

Command:

```bash
./test/api/compare-api-db.sh professor-endpoints
```

Result:

```text
Result: MATCH (all 433 professor detail endpoints match /professors)
```

This verifies that each professor returned by `GET /professors` has a matching `GET /professors/:id` response.

## Other Endpoints

### `GET /`

This is an API health/root endpoint. It does not return JSON and does not use a Postgres query.

Observed response:

```text
Professor Finder API is running.
```

Status: working.

### `GET /db-test`

The deployed server query is:

```sql
SELECT 1 AS ok
```

Expected JSON:

```json
{
  "ok": 1
}
```

The test harness includes this check:

```fish
env PGUSER=postgres PGDATABASE=university ./test/api/run-remote-api-db.sh db-test
```

## Conclusion

For the tested scope, the API output matches the direct Postgres query output.

The strongest verified coverage is for:

- full professor list
- professor detail behavior for every ID returned by the list endpoint
- buildings
- rooms
- professor `436` not-found behavior
- office hours for professor `436`

Remaining optional improvement: run `office-hours` for more professor IDs if the project needs broad office-hours coverage beyond professor `436`.
