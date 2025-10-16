## ADDED Requirements

### Requirement: Quarter Series API
The server SHALL expose `GET /api/quarters` returning `{ labels: string[], values: number[] }` derived from the `value_quarters` table sorted by quarter ascending.

#### Scenario: Success
- **WHEN** client calls `GET /api/quarters`
- **THEN** server SHALL return the series constructed from all rows available.

