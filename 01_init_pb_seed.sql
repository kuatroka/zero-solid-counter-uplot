-- PocketBase-like seed mirrored from migrations.go
-- Creates tables and seeds deterministic sample data on first DB initialization.

create table if not exists value_quarters (
  quarter text primary key,
  value double precision not null
);

create table if not exists counters (
  id text primary key,
  value double precision not null
);

insert into counters (id, value)
values ('main', 0)
on conflict (id) do nothing;

-- Deterministic-ish random values for quarters 1999Q1..2025Q4.
select setseed(0.42);
with years as (
  select generate_series(1999, 2025) as y
), quarters as (
  values (1),(2),(3),(4)
), ranges as (
  select y, q
  from years cross join quarters
  where (y > 1999 or q >= 1)
    and (y < 2025 or q <= 4)
), to_insert as (
  select
    (y::text || 'Q' || q::text) as quarter,
    (random() * (500000000000.0 - 1.0) + 1.0) as value
  from ranges
)
insert into value_quarters (quarter, value)
select quarter, value from to_insert
on conflict (quarter) do nothing;

