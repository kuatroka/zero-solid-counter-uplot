## ADDED Requirements

### Requirement: Counter API
The server SHALL expose `GET /api/counter` to return `{ value }` and `POST /api/counter` to mutate the counter.

#### Scenario: Get
- **WHEN** client calls `GET /api/counter`
- **THEN** server SHALL return the current value from `counters` id `main`, creating it with `0` if missing.

#### Scenario: Increment/Decrement
- **WHEN** client posts `{ op: 'inc'|'dec' }` to `POST /api/counter`
- **THEN** server SHALL atomically add/subtract 1 and return the new `{ value }`.

