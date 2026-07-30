# Changelog

## [0.2.5]

### Added
- Player Inspector on developer dashboard.
- Bug report viewer.
- Gameplay suggestion viewer.

### Changed
- Refactored developer dashboard into partials.

### Fixed
- Building health now correctly initialises from `buildings.max_health`.

## [0.2.6]

### Added
- Player inspector on developer dashboard.
- Clickable player names in feedback reports.

### Reason
- Reduced time needed to investigate player-reported issues.

### [0.2.7]

### Added
- UI polish for buildings

## [0.3.0]

### Added
- Server-side simulation tick system for automated gameplay systems.
- Live resource flow display showing:
  - current storage
  - production rates
  - consumption rates
  - net resource changes.

### Changed
- Refactored building production to run independently from manual player tasks.
- Updated resource and population displays to use live simulation data.

### Fixed
- Worker assignment when creating production buildings now respects available workers.
- Resource values no longer display excessive decimal precision.
- Multiple active manual tasks can now run correctly.

### Reason
- Separated automated simulation systems from player-driven actions to provide a cleaner foundation for future gameplay systems.

### [0.3.1]

### Changed
- Renamed `active-tasks` to `manual-tasks` to better reflect that player-initiated tasks are separate from automated production simulation.

## [0.3.2]

### Changed
- Redesigned resource display table to reduce UI clutter.
- Moved production and consumption rates from resources into production building displays.
- Added dynamic production and consumption information to production buildings.
- Improved accessibility of resource flow indicators with screen-reader labels.

### [0.3.3]

### Fixed
- Prevented overlapping simulation ticks to improve stability.