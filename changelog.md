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

## [0.3.3]

### Fixed
- Prevented overlapping simulation ticks to improve stability.

## [0.3.4]

### Changed
- Improved game layout responsiveness by restructuring Bootstrap columns.
- Moved settlement resources into a full-width status section.
- Updated dashboard sections to stack correctly on smaller screens.

## [0.3.5]

### Changed

#### Frontend / UI
- Restructured the main game page layout to improve responsive behaviour across desktop, tablet, and mobile screen sizes.
- Moved the resources and population overview into a full-width status section rather than forcing them into dashboard columns.
- Updated Bootstrap column usage to allow dashboard sections to stack naturally on smaller screens.
- Improved production building table responsiveness by hiding lower-priority detail columns at smaller breakpoints while preserving full information on larger displays.
- Improved table markup consistency and accessibility support.
- Added clearer screen reader handling for dynamic values and worker controls.

### Notes
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

# [0.4.6] — Population & Food System Overhaul

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

# [0.4.7] — Interface Refinement

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

# [0.4.8] — Charcoal & Kiln Rework

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

# [0.4.9] — Building Construction Rebalance

## Changed

- Rebalanced construction requirements for all existing buildings.
- Reduced the construction cost of the basic resource buildings to reflect their role as Tier 1 infrastructure.
- Reclassified the Mine as a Tier 1 resource building alongside the Farm, Quarry, and Woodcutter's Hut.
- Rebalanced the Mine construction requirements while retaining its existing total resource cost.
- Increased the construction requirements of the Lumber Camp to distinguish it from the basic Woodcutter's Hut.
- Added Stone to the Lumber Camp construction requirements.
- Added Ore to the Sawmill construction requirements to represent the metal components required for its cutting equipment.
- Rebalanced the Bakery construction requirements to favour Stone over Logs, reflecting the structural requirements of a building containing an oven and hearth.
- Added Ore to the Blacksmith construction requirements to represent the initial metal required for basic metalworking equipment.
- Increased the construction requirements of the Blacksmith to make it a more substantial Tier 2 building.
- Added Planks to the Cottage construction requirements.
- Rebalanced the Cottage as a more substantial housing building capable of supporting 5 population.
- Retained the Hut's existing construction requirements of 2 Wheat + 4 Wood.

## Construction Progression

Construction requirements are now intended to reflect both the progression role and physical nature of each building.

- Tier 1 buildings provide access to fundamental resources and basic settlement infrastructure.
- Tier 2 buildings primarily process existing resources into more specialised resources or products.
- Construction costs are balanced as approximate ranges rather than requiring every building within a tier to have identical costs.
- Raw resources such as Ore can be used directly in construction where a building would reasonably require basic metal components.
- Processed resources such as Planks can be used where they represent more substantial construction materials.

## Testing

- Tested revised construction recipes in the development database.
- Verified all construction recipes contain the intended resource inputs and quantities.
- Tested construction requirements for the revised buildings.
- Verified the revised requirements do not introduce circular dependencies between buildings and production chains.
- Verified the Blacksmith can be constructed without requiring Tools.
- Verified the Sawmill can be constructed using raw Ore without requiring Tools.
- Verified the Cottage uses Planks as a construction requirement.

# [0.4.10] — Ingredient Storage Reclassification

## Added

- Added `ingredient` as a new storage category.
- Added an initial capacity of 100 for `ingredient` storage.
- Added a settlement migration to initialise `ingredient` storage for existing players.

## Changed

- Reclassified `Flour` from the `material` storage category to the `ingredient` storage category.
- Updated storage category definitions to support the new `ingredient` category.
- Updated existing player storage states through migration to ensure Flour is stored against the new category.

## Storage Categories

Storage categories now distinguish between general materials and intermediate food-production resources.

- `grain` — Wheat
- `ingredient` — Flour
- `food` — Bread
- `fuel` — Charcoal
- `tool` — Tools
- `material` — Stone, Ore, Wood, Logs, Planks

## Testing

- Tested the new `ingredient` storage category.
- Verified Flour uses `ingredient` storage rather than `material` storage.
- Verified the initial ingredient storage capacity is 100.
- Tested the settlement migration for existing players.
- Verified existing Flour quantities remain available after the category migration.
- Verified the reduced load on `material` storage after moving Flour to `ingredient` storage.

# [0.5.0] — Storage Expansion

## Added

- Added storage capacity to building definitions.
- Added storage category and storage capacity properties to buildings.
- Added four dedicated storage buildings:
  - Storehouse
  - Granary
  - Pantry
  - Food Store
- Added construction recipes for the new storage buildings.
- Added storage capacity bonuses to the new storage buildings.
- Added storage category information to building construction recipes.
- Added storage capacity information to the player-facing recipe interface.

## Changed

- Building a storage building now increases the player's capacity for its associated storage category.
- Storage capacity is now expanded through settlement infrastructure rather than only through fixed base capacities.
- Storage buildings now contribute their capacity bonus to the appropriate `player_storage` category when constructed.
- Construction recipes for storage buildings now communicate the storage category and capacity they provide.
- Updated recipe data to expose storage building information to the frontend.
- Updated the storage interface to display buildings contributing capacity to each storage category.

## Storage Buildings

The initial storage buildings provide specialised capacity increases for different resource categories.

- `Storehouse` — increases `material` storage.
- `Granary` — increases `grain` storage.
- `Pantry` — increases `ingredient` storage.
- `Food Store` — increases `food` storage.

Storage buildings can be built alongside existing production and housing buildings, allowing storage capacity to scale with the needs of the settlement.

## Storage Management

Storage capacity is now directly connected to settlement expansion and production.

As production increases, players can construct appropriate storage buildings to prevent storage limitations from blocking their production chains.

The storage interface now shows which buildings are contributing capacity to each storage category, while construction recipes indicate the capacity provided by storage buildings before they are built.

## Testing

- Tested construction of all four storage buildings.
- Verified each storage building increases the correct `player_storage` category.
- Verified storage capacity increases are applied when construction completes.
- Verified storage capacity remains correctly associated with the relevant category.
- Tested storage buildings alongside existing production chains.
- Verified production can resume when additional storage capacity becomes available.
- Verified storage building information is displayed in the construction recipes.
- Verified storage category and capacity information is displayed correctly in the storage interface.
- Verified existing players retain their current storage state when the new storage building system is introduced.

# [0.5.1] — Player Interface & Developer Dashboard

## Added

- Added a persistent player status interface to the main game view.
- Added population and worker information to the player status interface.
- Added current resource amounts and resource flow indicators to the player status interface.
- Added storage usage and capacity information for each storage category to the player status interface.
- Added tabbed navigation for detailed player-facing game information.
- Added dedicated tabs for Resources, Storage, Recipes, and Tasks.
- Added persistent building interfaces beneath the game navigation.
- Added increasing, decreasing, and stable indicators for player resource flows.
- Added accessible text descriptions for resource flow indicators.

## Changed

- Reorganised the main game interface to separate persistent settlement information from detailed management interfaces.
- Player population and worker information is now visible without navigating away from the current game view.
- Resource amounts and their current net flow are now visible without opening the detailed Resources interface.
- Storage usage by category is now visible without opening the detailed Storage interface.
- Detailed Resources, Storage, Recipes, and Tasks information is now accessed through tabs rather than being displayed simultaneously.
- Population and production buildings remain visible while navigating between the detailed game information tabs.
- Reorganised the game view layout to make better use of available screen space while retaining access to frequently used settlement information.
- Updated the player-facing interface to use the existing `getPlayerStats()` data rather than introducing additional database queries for the new status information.
- Refactored player status rendering into a dedicated `playerStatus.js` module.

## Player Status

The new player status interface provides a persistent overview of the settlement's current state.

The interface displays:

- Population and population capacity.
- Idle and assigned workers.
- Current amount of every discovered resource.
- Whether each resource is currently increasing, decreasing, or stable.
- Storage used and available capacity for each storage category.

This information remains visible while players navigate between the detailed management interfaces.

## Game Navigation

Detailed settlement management information has been reorganised into dedicated tabs:

- `Resources` — detailed resource information and production/consumption rates.
- `Storage` — detailed storage information and contributing storage buildings.
- `Recipes` — available construction and production recipes.
- `Tasks` — active and available manual tasks.

Population and production buildings remain permanently visible beneath the navigation so that workers can be reassigned without leaving the current game context.

## Developer Dashboard

- Improved the developer settlement view to provide a more useful overview of player state.
- Added persistent population and worker information to the developer view.
- Added resource amounts and resource flow information to the developer view.
- Added storage usage and capacity information to the developer view.
- Retained detailed storage and building information within the developer interface for debugging and inspection.

## Testing

- Tested the new player status interface in-game.
- Verified population and population capacity display correctly.
- Verified idle and assigned worker counts display correctly.
- Verified all discovered resources and their current amounts are displayed correctly.
- Verified positive resource flows display as increasing.
- Verified negative resource flows display as decreasing.
- Verified zero resource flows display as stable.
- Verified storage usage and capacity display correctly for each storage category.
- Tested navigation between all game information tabs.
- Verified buildings remain visible while switching between tabs.
- Verified the interface behaves correctly when individual tab contents have different heights.
- Verified the page footer remains correctly positioned for both short and long views.
- Verified the new player status information uses the existing player statistics data.
- Tested the improved developer settlement view successfully.


# [0.5.2] — Building Groups & Settlement Interface

## Added

- Added grouped building displays for population, production, and storage buildings.
- Added collapsible building groups to reduce the amount of information displayed in the settlement interface.
- Added building counts to each building group.
- Added aggregate production and consumption summaries to production building groups.
- Added individual building visibility when a building group is expanded.
- Added production building group summaries showing combined production and resource consumption rates.

## Changed

- Reorganised population, production, and storage buildings into named building groups.
- Building groups are now collapsed by default when the game interface is loaded.
- Individual buildings are now displayed beneath their corresponding building group when expanded.
- Production building groups now provide a summary of their combined production and resource consumption.
- Building groups are now sorted alphabetically, with individual buildings sorted by building number within each group.
- Updated the building interface to make better use of available space when multiple buildings of the same type are present.
- Retained the existing individual building controls and production status information when groups are expanded.
- Updated building group rendering to prevent duplicate buildings from affecting group counts or production summaries.

## Building Management

The building interface now groups buildings of the same type together.

Each group displays the number of buildings it contains and can be expanded to view and manage individual buildings.

Production building groups also display their combined production and resource consumption while collapsed, providing an overview of production without requiring every building to be expanded.

## Testing

- Tested population buildings with grouped and collapsed displays.
- Tested production buildings with grouped and collapsed displays.
- Tested storage buildings with grouped and collapsed displays.
- Verified building counts match the number of individual buildings displayed when groups are expanded.
- Verified production group summaries correctly combine production rates.
- Verified production group summaries correctly combine resource consumption rates.
- Verified idle production buildings do not contribute to production or consumption summaries.
- Verified individual building worker controls continue to function when groups are expanded.
- Verified building groups remain collapsed after a page refresh.
- Verified building groups sort correctly by building name.
- Verified individual buildings sort correctly by building number within their groups.
- Verified repeated game updates do not create duplicate building rows or incorrectly increase building group counts.

# [0.5.3] — Integrated Recipe Actions & Task Interface

## Added

- Added inline task progress displays to recipe actions.
- Added progress bars showing the current progress of active recipe tasks.
- Added inline Complete buttons for finished recipe tasks.
- Added active-task state handling to recipe rendering.
- Added one-active-task-per-recipe behaviour in the recipe interface.

## Changed

- Recipe actions now display their active task state directly within the corresponding recipe.
- Starting a recipe now replaces its action button with a progress bar.
- Finished recipe tasks now replace the progress bar with a Complete button.
- Recipe action buttons are hidden while their corresponding task is active.
- Recipe action buttons are restored after the active task is completed.
- Recipe availability is now recalculated during game updates and applied to the recipe action button.
- Removed the separate Current Tasks table from the player interface.
- Removed the frontend task table rendering and associated task display code.
- Removed the obsolete `renderResources()` function from the resource display module.
- Retained the underlying `player_tasks` database system and task services.
- Retained task creation and completion through the existing task system.
- Updated the recipe interface so task state and recipe actions are managed in the same location.

## Recipe Actions

Recipe actions now contain their own task state.

When a recipe is started, its action button is replaced by a progress bar. Once the task is finished, the progress display is replaced by a Complete button.

A recipe cannot be started again while it already has an active task. This prevents the same recipe from being repeatedly added to the task system through the interface.

The separate Current Tasks table has been removed, as active tasks are now represented directly by the recipes they belong to.

The underlying task system remains unchanged and continues to record tasks in `player_tasks` and process their completion.

## Task Management

Task management has been consolidated into the recipe interface.

Previously, recipes were started from the recipe list while their active tasks were displayed separately in the Current Tasks table. This allowed multiple instances of the same recipe to be started and displayed as separate tasks.

Active recipe tasks are now represented directly by their recipe, providing a single location for starting, monitoring, and completing an action.

## Testing

- Tested starting recipes and verified the action button is replaced by a progress bar.
- Tested recipe progress updates correctly over time.
- Tested finished recipe tasks display a Complete button.
- Tested completing a recipe task restores the recipe action button.
- Verified an active recipe cannot be started again while its task is in progress.
- Verified the same recipe cannot be repeatedly added through the recipe interface.
- Verified active recipe tasks remain associated with their correct recipes after game updates.
- Verified recipe progress survives repeated game-data updates.
- Verified recipe action buttons correctly enable when required resources become available.
- Verified recipe action buttons correctly disable when required resources are insufficient.
- Verified the Current Tasks table is no longer displayed.
- Verified removing the task table does not affect task creation or completion.
- Verified tasks continue to be recorded in `player_tasks`.
- Verified task completion continues to apply recipe outputs correctly.
- Verified the obsolete `renderResources()` function has no remaining references.
- Verified repeated game updates do not create duplicate recipe task displays.

# [0.5.4] — Storage Capacity Feedback

## Added

- Added proactive storage capacity warnings to the player interface.
- Added **Nearly full** warnings when storage reaches 80% capacity.
- Added **Full** warnings when storage reaches 100% capacity.
- Added in-page feedback for actions blocked by insufficient storage capacity.
- Added Bootstrap Icons for storage warning indicators.

## Changed

- Storage warnings are now displayed directly alongside the affected storage category.
- Storage warnings use different severity levels for approaching and reached capacity.
- Replaced browser alerts for storage-related action failures with in-page feedback.
- Storage action feedback is now cleared automatically when storage is successfully refreshed.
- Updated storage warning indicators to use Bootstrap Icons rather than emoji characters.
- Storage warning icons inherit the colour of their associated warning state.

## Storage Feedback

Storage now provides both proactive and reactive feedback.

When a storage category reaches 80% capacity, it displays a **Nearly full** warning. When it reaches or exceeds its capacity limit, the warning changes to **Full**.

Actions that fail because their resulting resources cannot be stored now display their error message within the Storage section rather than using a browser alert.

Successful game-data refreshes automatically clear any previous storage action feedback.

## Storage Warnings

Storage warnings are calculated from the current used and available capacity of each storage category.

The warning states are:

- Below 80% — no warning.
- 80% to below 100% — **Nearly full**.
- 100% or above — **Full**.

The warning indicators use Bootstrap Icons so that their colour follows the warning severity consistently.

## Testing

- Tested storage approaching capacity displays the **Nearly full** warning.
- Verified **Nearly full** warnings appear at the intended 80% threshold.
- Tested storage reaching capacity displays the **Full** warning.
- Verified **Full** warnings use the danger styling.
- Verified warning indicators display correctly using Bootstrap Icons.
- Verified warning icons inherit the correct warning colour.
- Verified storage warnings are displayed alongside the affected storage category.
- Tested an action failing because of insufficient storage capacity.
- Verified storage failures display in-page feedback rather than a browser alert.
- Verified storage feedback remains visible after a failed action.
- Verified successful actions refresh storage data and clear previous feedback.
- Verified storage warnings disappear when storage falls below the warning threshold.
- Verified storage warnings update correctly as resource amounts change.
- Verified existing storage displays continue to show current used and maximum capacity.
- Verified adding storage feedback does not interfere with existing resource or recipe interactions.

# [0.5.5] — Tool Shed Building

## Added

- Added the Tool Shed building.
- Added the Build Tool Shed recipe.
- Added 20 additional tool storage capacity through the Tool Shed.
- Added the Tool Shed construction cost of 10 Planks and 10 Stone.
- Added a 30-second construction time for the Tool Shed.

## Changed

- Added tool storage expansion through the existing storage building system.
- Updated the available building recipes to include the Tool Shed.
- Updated storage capacity calculations so Tool Shed capacity contributes to the player's shared tool storage.
- Integrated the Tool Shed with the existing storage display and capacity warning system.
- Changed the Mine Ore recipe type from `crafting` to `gathering` to reflect its current resource-gathering behaviour.

## Tool Shed

The Tool Shed provides an additional 20 units of shared tool storage capacity.

The building does not provide production capacity and does not create a separate storage pool. Tools continue to use the existing shared tool storage system.

The initial tool storage capacity remains unchanged, while building a Tool Shed expands the settlement's total available tool storage.

## Construction

The Tool Shed is constructed through the existing recipe system.

The Build Tool Shed recipe requires:

- 10 Planks
- 10 Stone

Construction takes 30 seconds to complete.

## Testing

- Verified the Tool Shed is available as a buildable building.
- Verified the Build Tool Shed recipe displays correctly.
- Verified the recipe requires 10 Planks and 10 Stone.
- Verified the recipe takes 30 seconds to complete.
- Verified completing the recipe creates a Tool Shed.
- Verified the Tool Shed provides 20 additional tool storage capacity.
- Verified Tool Shed storage capacity is included in the player's shared tool storage.
- Verified building a Tool Shed increases the displayed tool storage capacity.
- Verified the Tool Shed does not create a separate tool storage pool.
- Verified existing storage warnings continue to work with the increased tool capacity.
- Verified the Mine Ore recipe is categorised as `gathering`.

# [0.6.0] — Building Degradation & Repairs

## Added

- Added building degradation over time.
- Added additional degradation for production buildings while actively working.
- Added health-based effective worker capacity.
- Added automatic reduction of assigned workers when building health reduces available capacity.
- Added building repair mechanics.
- Added Tool consumption for building repairs.
- Added 10 health restored per Tool during repairs.
- Added repair health capped at the building's maximum health.
- Added persistent degradation timing for buildings.

## Changed

- Updated building production so buildings at 0 health cannot operate.
- Updated building worker capacity calculations to account for current building health.
- Updated building displays to show current health and effective worker capacity.
- Updated building displays so health and worker capacity refresh automatically as buildings degrade.
- Updated Tool usage so Tools can be used to maintain building health.
- Changed passive building degradation to occur at a slower rate while keeping health stored as whole numbers.
- Added separate production wear timing so active production causes additional wear without doubling the normal degradation rate.

## Building Degradation

Buildings gradually lose health over time.

All buildings experience passive degradation. Production buildings receive additional wear while actively producing resources.

Passive degradation occurs once every 4 simulation ticks, while active production adds an additional point of degradation every 5 working ticks.

Building health remains stored as a whole number.

## Worker Capacity

Building health affects the number of workers a building can effectively support.

As health decreases, effective worker capacity decreases.

Assigned workers are automatically reduced if building health falls below the level required to support the current number of workers.

Buildings at 0 health have no effective worker capacity.

## Repairs

Damaged buildings can be repaired using Tools.

Each repair consumes 1 Tool and restores 10 health, up to the building's maximum health.

Repairs restore building health only. Effective worker capacity increases naturally as the building's health is restored.

## Testing

- Verified buildings lose health through passive degradation.
- Verified passive degradation occurs at the intended interval.
- Verified actively working production buildings receive additional degradation.
- Verified idle production buildings do not receive active production wear.
- Verified production wear uses a separate timing counter.
- Verified building health never falls below 0.
- Verified buildings at 0 health have no effective worker capacity.
- Verified damaged buildings reduce their effective worker capacity.
- Verified assigned workers are automatically reduced when building health reduces available capacity.
- Verified production stops when a building reaches 0 health.
- Verified the Repair button is available for damaged buildings.
- Verified repairing a building restores 10 health.
- Verified repairing a building consumes 1 Tool.
- Verified repair health is capped at the building's maximum health.
- Verified attempting to repair without sufficient Tools does not consume a Tool.
- Verified building health updates automatically in the building interface.
- Verified effective worker capacity updates automatically as building health changes.
- Verified the database continues to store building health as whole numbers.
