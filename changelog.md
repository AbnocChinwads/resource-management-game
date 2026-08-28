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

## [0.4.1] - Settlement Migration System

### Added
- Added per-player settlement migration system.
- Added `settlement_migrations` tracking table to record completed settlement updates.
- Added settlement migration runner to apply only missing player settlement updates.
- Added initial settlement migration baseline.

### Changed
- Replaced automatic settlement resets triggered by application version changes.
- Settlement updates are now handled through incremental migrations rather than full settlement wipes.
- Separated database migrations from player settlement migrations.
- Updated settlement update flow to preserve player progress across future releases.

### Removed
- Removed `players.settlement_version` tracking.
- Removed application version changes as a trigger for settlement resets.

### Fixed
- Prevented future application updates from unintentionally resetting player settlements.

### Reason
- Previous version updates could require destructive settlement resets when new gameplay systems were introduced.
- The new migration system provides a safer way to evolve settlement data while preserving existing player progress.

## [0.4.2] - Frontend JavaScript Refactor

### Added
- Extracted game update logic from EJS script partials into ES modules
- Added dedicated frontend modules for:
  - player display updates
  - resource updates
  - storage updates
  - building updates
  - task updates
  - player actions
  - discovery checks
- Added centralised game data fetching through gameData.js

### Changed
- Reworked liveStats.ejs to act as the game update coordinator
- Moved worker assignment and task completion handlers from EJS scripts into actions.js
- Moved resource, storage, building and player UI update logic into dedicated modules
- Removed duplicated frontend update logic from liveStats.ejs
- Improved separation between server-rendered views and client-side behaviour

### Removed
- Removed gameActions.ejs
- Removed inline JavaScript dependencies from extracted systems

### Technical
- Frontend now uses ES module structure for game state updates
- Reduced reliance on global scripts loaded through partials
- Prepared frontend architecture for upcoming recipe discovery/UI rewrite

## [0.4.3] - Live State Rebase & Frontend Architecture Completion

### Added

- Added fully client-driven live updates for:
  - resources
  - recipes
  - tasks
  - buildings
  - storage
  - discovery states
- Added dynamic creation of frontend elements for newly discovered:
  - resources
  - recipes
  - tasks
  - buildings
- Added persistent storage category handling.
  - Storage categories remain available after discovery even when current resource amounts reach zero.

### Changed

- Completed migration away from server-rendered partial refreshes during gameplay.
- Reworked frontend game state handling so the API now acts as the source of truth.
- Updated liveStats.ejs to coordinate:
  - fetching current game data
  - triggering system updates
  - handling discovery changes
  - initialising player actions
- Reworked frontend modules to update existing DOM state instead of replacing rendered sections.

### Removed

- Removed legacy partial refresh system.
- Removed unused frontend partial rendering scripts.
- Removed obsolete refresh routes and dependencies.
- Removed reliance on page refreshes to display newly unlocked gameplay content.

### Fixed

- Fixed resources requiring manual page refreshes after gathering or production.
- Fixed recipes displaying unknown resource names after discovering new resources.
- Fixed recipe availability buttons not updating correctly after resource changes.
- Fixed completed tasks not updating resources immediately.
- Fixed newly created buildings only appearing after page reload.
- Fixed production and population building displays becoming out of sync with server state.
- Fixed accordion sections collapsing during gameplay updates.
- Fixed frontend state mismatches caused by partial refresh behaviour.

### Technical

- Frontend game systems now follow a consistent update architecture:
  API Game State
  |
  v
  Game Update Modules
  |
  v
  DOM Updates
- Improved separation between:
  - backend simulation logic
  - API responses
  - frontend rendering
  - player actions

### Reason

- Previous frontend architecture relied on refreshing server-rendered partials whenever game state changed.
- This caused UI state loss, unnecessary rendering, and delayed discovery updates.
- The new architecture provides a more stable foundation for future systems including:
  - expanded storage mechanics
  - building upgrades
  - production chains
  - settlement progression

## [0.4.4] - Storage Capacity Enforcement

### Added

* Added server-side storage capacity enforcement for resource production.
* Added centralised storage validation when resources are added to a player's settlement.
* Added storage capacity checks for both manual task completion and automated production.
* Added player-facing notifications when a manual task cannot be completed because storage is full.
* Added automatic initialisation of the appropriate player storage category when a resource is first discovered.
* Added persistent storage categories that remain available after the player's current amount of that resource reaches zero.

### Changed

* Resource additions now pass through storage capacity validation before being committed.
* Manual resource production now respects the capacity of the resource's storage category.
* Automated resource production now respects storage capacity rather than continuing to add resources beyond the limit.
* Expected storage-capacity failures are treated as gameplay conditions rather than application errors.

### Fixed

* Fixed resource production bypassing storage capacity.
* Fixed automated production repeatedly attempting to add resources when storage was already full.
* Fixed storage categories requiring frontend-only discovery logic to determine whether they existed.
* Fixed storage categories disappearing when the player no longer had any resources in that category.

### Technical

* Connected `storage_defaults` with per-player `player_storage` records.
* Added centralised resource storage validation to the resource service.
* Updated manual task completion to use the centralised resource addition logic.
* Updated automated resource production to use the same storage validation.
* Added database migration support for correcting existing player storage data.

### Notes

* Storage capacity is now an enforced gameplay constraint.
* Storage buildings and expandable storage capacity are not yet implemented.
* Automated production does not yet expose an explicit `Idle` state when production is blocked by storage capacity or missing inputs.
* Existing development settlements may contain resources above their current storage capacity because those resources were accumulated before storage enforcement was introduced.

### Reason

* Move storage from a display-only system into an actual gameplay constraint.
* Ensure manual and automated resource production use the same storage rules.
* Establish the backend foundation required for future storage buildings, upgrades, and more complex resource management.

## [0.4.5] - Production State

### Added

* Added production status tracking for production buildings.
* Added `working` and `idle` production states.
* Added idle reasons for unassigned workers, insufficient inputs, insufficient storage, and damaged buildings.
* Added storage availability to storage lookups.
* Added reusable production-rate and consumption-rate calculations.
* Added centralised production-state evaluation shared by the building data and simulation systems.
* Added frontend rendering for production building idle states.

### Changed

* Production buildings now determine whether the next production tick can be completed before production proceeds.
* Production state now considers workers, building health, required inputs, and available output storage.
* Production buildings return to `working` automatically when the blocking condition is resolved.
* Production and consumption displays now reflect the building's current production state.
* Flour was moved from the material storage category to the grain storage category.

### Fixed

* Fixed production buildings displaying normal production or consumption information when production was blocked by storage.
* Fixed production buildings failing to resume their normal production display after sufficient storage became available.
* Fixed storage checks relying on storage reaching an exact capacity value when resource amounts are fractional.
* Fixed the production interface displaying `0/min` without explaining why a production building was not operating.

### Technical

* Extracted storage-related functionality from `resourceService.js` into `storageService.js`.
* Added reusable storage availability calculations.
* Extracted production and consumption calculations into `productionService.js`.
* Centralised production-state evaluation so the simulation and building data use the same production rules.
* Removed duplicated production and consumption calculations from individual services.
* Removed duplicated storage eligibility checks from the resource simulation flow.
* Updated asynchronous building processing to support production-state evaluation.

### Notes

* Production state is currently recalculated as part of normal game-state processing.
* No player alert is generated simply because a building remains idle.
* The current frontend displays the idle state directly in the production and consumption columns.

### Reason

* Make production buildings explicitly represent whether they can currently operate.
* Provide players with a clear explanation when automated production is blocked.
* Centralise production rules so the simulation and frontend receive the same production state.

# 0.4.6 — Population & Food System Overhaul

## Added

* Population capacity is now provided by housing buildings.
* Added `historical_max_population` tracking to preserve a player's highest population reached.
* Added population growth based on sustained positive food conditions.
* Added starvation-based population loss.
* Population loss is calculated as 10% of current population, rounded up.
* Added a population floor of 10% of historical maximum population.
* Added `food_surplus_started_at` to track sustained food surplus.
* Added separate population and food information to the player stats display.
* Population display now shows:

  * Current population
  * Maximum population
  * Workers
  * Idle workers
  * Assigned workers
* Food display now shows:

  * Food
  * Food required
  * Food supplied
  * Food balance
* Added food production capacity as a separate concept from actual current food production.
* Population growth now uses potential food balance, preventing full food storage from incorrectly stopping population growth.

## Changed

* Population and worker management are now separated conceptually:

  * `populationService.js` manages population changes.
  * `workerService.js` manages worker availability and assignment.
* Starvation is triggered by actual stored food reaching zero, rather than food balance reaching zero.
* Food surplus is cancelled when stored food reaches zero.
* Worker counts are recalculated when population changes.
* Resource flow now distinguishes between:

  * Actual food production
  * Food production capacity
  * Food requirement
  * Actual food balance
  * Potential food balance
* Updated the player statistics frontend to reflect the new population and food systems.

## Database

* Added `historical_max_population` to `players`.
* Added `starvation_started_at` to `players`.
* Added `food_surplus_started_at` to `players`.

## Testing

* Tested population capacity increasing when housing is constructed.
* Tested sustained food surplus causing population growth.
* Tested population growth updating historical maximum population.
* Tested starvation causing population loss.
* Tested the 10% current-population loss rule.
* Tested the 10% historical-population floor.
* Tested worker recalculation following population changes.
* Tested food storage reaching capacity and production stopping.
* Tested production resuming after food is consumed.
* Tested that full food storage does not incorrectly prevent population growth.
* Tested accelerated food/simulation ticks for population growth and starvation.

# v0.4.7 — Interface Refinement

## Added

- Added population growth and starvation countdown timers.
- Added live population status updates showing time until the next population change.
- Added accessible labels for dynamic population and food information.

## Changed

- Refactored the population table to display idle and assigned workers in a single `Idle / Assigned` column, and current and max population in a single `Current / Max` column.
- Refactored the food table to display supplied and required nutrition in a single `Supply / Demand` column.
- Refactored the production building table to display production and consumption in a single `Production / Consumption` column.
- Refactored the storage table to display stored and capacity values in a single `Stored / Capacity` column.
- Kept the underlying API/service data unchanged; the changes are limited to frontend presentation.
- Removed redundant DOM elements and selectors associated with the previous table columns.
- Retained existing production, consumption, storage, and population calculations.
- Population status now reflects population capacity and the historical population floor when determining whether a growth or starvation countdown should be displayed.
- Population status updates independently of the normal game-state polling so countdowns update in real time.

## Fixed

- Fixed food consumption calculations incorrectly treating resources with zero nutritional value as food when no actual food was available.

# 0.4.8 — Charcoal & Kiln Rework

## Added

- Added `Charcoal` to `resource_types`.
- Added the `Produce Charcoal` recipe with a 10-second craft time and a Wood input.
- Added Charcoal as a required input to the Bread and Tools recipes.
- Added a settlement migration to initialise Charcoal in existing player resource states.

## Changed

- Reworked the Kiln to use the Charcoal production recipe.
- Updated the Kiln description to `Simple oven used to make charcoal`.
- Production buildings now initialise their output resource in `player_resources` when constructed if the resource is not already present.

## Fixed

- Fixed newly constructed production buildings being unable to operate when their output resource was absent from the player's resource state.

## Testing

- Tested the Charcoal resource and recipe in the production chain.
- Tested the Kiln producing Charcoal with an assigned worker.
- Tested Wood consumption during Charcoal production.
- Tested Charcoal consumption by Bread and Tools production.
- Tested newly constructed production buildings initialising their output resources.
- Tested existing settlements receiving Charcoal through settlement migration.
- Tested the Kiln's working and idle production states.
