## ADDED Requirements

### Requirement: Counter Route with 10 Charts
The app SHALL provide a route at `/counter` that shows a persistent counter with increment/decrement controls and 10 uPlot charts visualizing quarterly data.

#### Scenario: Counter interaction
- **WHEN** the user clicks increment or decrement
- **THEN** the counter SHALL update optimistically and persist via the server API
- **AND** the value SHALL reflect the stored `counters.main` row.

#### Scenario: Ten charts
- **WHEN** visiting `/counter`
- **THEN** the page SHALL render ten charts (bars, line, area, scatter, step, spline, cumulative, moving average, band, dual-axis)
- **AND** all charts SHALL use the same quarterly dataset.

