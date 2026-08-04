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

## [0.3.7] - Recipe UI Improvements & Building Refactor Fixes

### Added
- Added recipe accordion state persistence using local storage.
  - Players now return to the recipe category they were viewing after page updates or actions.

### Changed
- Reworked recipe display into separate accordion categories:
  - Gather recipes
  - Craft recipes
  - Build recipes
- Improved recipe names shown to players by removing internal action prefixes (for example, "Gather Wheat" now displays as "Wheat").
- Separated population buildings and production buildings into different partial renders to prepare for future building expansion and UI improvements.

### Fixed
- Fixed recipe accordion sections resetting after selecting recipes.
- Fixed recipe availability updates interfering with the recipe UI state.
- Fixed production and consumption building information not rendering correctly after the building partial split.
- Fixed building partial refresh errors caused by incorrect partial routes.
- Fixed JavaScript errors caused by partial refresh refactoring.

## [0.4.0] - Resource Storage Foundation & Settlement Versioning

### Added
- Added version-based settlement reset handling.
- Added player announcements system for communicating major updates after version changes.
- Added resource storage tracking by storage category.
- Added storage capacity tracking for player settlements.
- Added storage display showing category capacity and current usage.

### Changed
- Refactored resource flow handling to separate:
  - resource amounts
  - production rates
  - consumption rates
  - storage information
- Refactored resource flow services into separate modules:
  - resource handling
  - storage handling
  - production and consumption calculations
- Updated player stats responses to include storage information.

### Fixed
- Fixed resource and storage discovery displays requiring manual page refreshes.
- Fixed frontend resource partial handling after resource flow refactor.
- Fixed storage categories displaying incorrectly in the frontend.
- Fixed storage displays showing unavailable storage categories.

### Reason
- Established the foundation required for future storage buildings, more complex resource management, and larger settlement progression systems.
- Improved separation between backend simulation data and frontend presentation logic.