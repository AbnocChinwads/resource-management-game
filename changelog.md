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

### [0.3.4]

### Changed
- Improved game layout responsiveness by restructuring Bootstrap columns.
- Moved settlement resources into a full-width status section.
- Updated dashboard sections to stack correctly on smaller screens.

### [0.3.5]

### Changed
## Frontend / UI
- Restructured the main game page layout to improve responsive behaviour across desktop, tablet, and mobile screen sizes.
- Moved the resources and population overview into a full-width status section rather than forcing them into dashboard columns.
- Updated Bootstrap column usage to allow dashboard sections to stack naturally on smaller screens.
- Improved production building table responsiveness by hiding lower-priority detail columns at smaller breakpoints while preserving full information on larger displays.
- Improved table markup consistency and accessibility support.
- Added clearer screen reader handling for dynamic values and worker controls.

## Notes
- This update focuses on improving usability and layout stability rather than adding new gameplay systems.
- The current building tables remain in place, with future plans to introduce grouped/collapsible building management views as the number of buildings and production chains increase.

## [0.3.6]

### Changed
- Reworked recipe display into grouped Bootstrap accordions by recipe type:
  - Gather
  - Craft
  - Build
- Updated recipe presentation to separate action type from recipe name.
- Improved recipe list readability on desktop and mobile layouts.
- Added recipe state tracking to prevent unnecessary recipe list refreshes.
- Preserved open recipe accordion sections when recipe data updates.

### Fixed
- Fixed recipe list collapsing during regular simulation updates.
- Fixed recipe naming display by removing internal action prefixes from player-facing names.