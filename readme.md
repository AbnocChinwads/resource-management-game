# Resource Management Game

A browser-based resource management simulation built as a personal learning project.

The goal is to create a resource management game that I would genuinely enjoy playing while using the project to explore game systems, backend development, database design, simulation, frontend architecture, and long-term project maintenance.

Players begin by manually gathering resources before expanding their settlement through buildings, population growth, worker automation, and automated production systems.

## Play Online

**Live Game:** https://icecream.abnoc.dev

> The game is currently in active alpha development. Core gameplay systems are functional, but balancing, progression, and interface improvements are still ongoing.

---

# Current Version

**Alpha v0.4.6**

---

# Recent Updates

# 0.4.6 — Population & Food Overhaul

### Population

Population is now tied directly to the housing available in your settlement.

* **Current** — the number of people currently living in your settlement.
* **Maximum** — the maximum population your buildings can support.
* **Workers** — the number of people available to work.
* **Idle** — workers who aren't currently assigned to a building.
* **Assigned** — workers currently assigned to production buildings.

Your settlement also remembers the highest population you have reached.

### Growing Your Population

A sustained food surplus will now allow your population to grow.

As long as:

* You have food available.
* Your settlement has enough food production capacity to meet its population's needs.
* There is available housing capacity.

your population can gradually increase.

Building additional housing increases your maximum population and gives your settlement room to grow.

### Food

Food is now displayed separately from population, with a clearer breakdown of your settlement's food situation:

* **Food** — your current stored food.
* **Food Required** — how much food your population needs.
* **Food Supplied** — how much food your production can supply.
* **Food Balance** — the difference between food supplied and food required.

Food storage capacity can temporarily stop production when your stores are full. This does not prevent population growth if your settlement has sufficient production capacity and stored food.

### Starvation

Starvation now depends on **actually running out of food**, rather than simply having a food balance of zero.

A food balance of `0` means your settlement is producing exactly enough food to meet its current requirements. It does **not** mean your population is starving.

If your stored food reaches zero and your settlement cannot sustain its population, starvation begins.

During starvation:

* Recovering your food supply stops the starvation process.
* Once food conditions recover, population can begin rebuilding through the normal growth system.

### Why This Matters

Population, workers and food are now connected systems rather than separate numbers.

Your housing determines how many people you can support, your population determines how much food you need, your workers determine how much production you can maintain, and your food supply determines whether your settlement can continue to grow or begins to starve.

This forms the foundation for the settlement's future population and survival mechanics.


## Alpha v0.4.5 - Production State

This update builds on the storage capacity enforcement introduced in v0.4.4 by making production buildings explicitly aware of whether they can currently operate.

### Gameplay System Improvements

- Added explicit production states for production buildings.
- Production buildings can now become idle when:
  - no workers are assigned
  - required inputs are unavailable
  - output storage cannot accept the next production tick
  - the building is damaged

- Production buildings automatically return to a working state when the condition preventing production is resolved.
- Storage availability is now evaluated against the amount required by the next production tick, allowing fractional resource production to work correctly.

### Interface Improvements

- Production buildings now display an **Idle** state when they cannot produce.
- Idle buildings display the reason they are unable to operate.
- Production and consumption information is replaced by the idle state while production is blocked.
- Production and consumption displays automatically return when a building becomes productive again.

### Notes

- Production buildings currently recalculate their state as part of the normal live game-state updates.
- The current idle-state system does not generate player alerts.

This update establishes the production-state foundation required for clearer automation feedback and future game alerts.

---

## Alpha v0.4.4 - Storage Capacity Enforcement

This update turns the storage foundation introduced in v0.4.0 into an active gameplay mechanic.

### Gameplay System Improvements

- Resource additions now respect the capacity of their storage category.
- Manual tasks can no longer complete if their resource output would exceed available storage.
- Automated production now respects storage capacity.
- Resource production is prevented when the resulting output cannot be stored.
- Storage capacity is now treated as a gameplay constraint rather than display-only information.
- Storage categories remain available after discovery even when their current resource amounts reach zero.
- Added clearer handling of resources that cannot be added because their storage category is full.

### Interface Improvements

- Added player-facing feedback when a manual task cannot be completed because storage is full.
- Improved feedback for storage-related resource failures.

### Notes

- Automated production currently stops when storage is unavailable.
- Future work will make production buildings explicitly display an **idle** or **blocked** state when storage prevents production.
- Storage expansion and upgrades will be developed as part of the next major gameplay phase.

This update establishes the basic rules required for storage to become a meaningful part of settlement management.

---

## Alpha v0.4.3 - Live State Rebase & Frontend Architecture Completion

This update completed a major frontend architecture rework, moving the game away from repeatedly refreshing server-rendered sections and towards a client-driven live game state.

### Gameplay & Interface

- Added fully live updates for:

  - resources
  - recipes
  - tasks
  - buildings
  - storage
  - discovery states

- Newly discovered resources, recipes, tasks, and buildings can now appear in the interface without requiring a page refresh.
- Storage categories now persist after discovery even when the player's current amount of a resource reaches zero.
- Improved live updates for population and production buildings.

### Frontend Architecture

- Completed the migration away from server-rendered partial refreshes during normal gameplay.
- Centralised live game-state updates around API data.
- Separated frontend responsibilities into dedicated systems for:

  - resources
  - recipes
  - tasks
  - buildings
  - storage
  - discovery
  - player information
  - player actions

- Existing interface elements are now updated in place rather than repeatedly replaced.

### Fixed

- Resources no longer require a manual page refresh after being discovered or changed.
- Newly discovered recipes appear immediately.
- Newly completed tasks update the resource display immediately.
- Newly constructed buildings appear without requiring a page refresh.
- Population and production building displays remain synchronised with live game state.
- Recipe accordion state is preserved during live updates.
- Reduced UI inconsistencies caused by the previous partial-refresh architecture.

### Reason

The previous frontend architecture relied heavily on refreshing server-rendered sections whenever game state changed. This worked for early development but became increasingly difficult to maintain as more systems became interconnected.

The new architecture provides a more stable foundation for the next stage of development, particularly storage mechanics, expanded production systems, building improvements, and future settlement progression.

---

## Alpha v0.4.2 - Frontend JavaScript Refactor

### Added

- Extracted game update logic from EJS script partials into ES modules.
- Added dedicated frontend systems for:

  - player information
  - resources
  - storage
  - buildings
  - tasks
  - player actions
  - discovery states

- Added centralised game data fetching.

### Changed

- Reworked live game updates around a central coordinator.
- Moved worker assignment and task completion handling into dedicated frontend actions.
- Moved resource, storage, building, and player update logic into separate modules.
- Removed duplicated frontend update logic.
- Improved separation between server-rendered views and client-side behaviour.

### Removed

- Removed the legacy game action script partial.
- Removed unnecessary inline JavaScript dependencies.

### Reason

This established the frontend architecture required to support increasingly complex live game systems without relying on repeated page or partial refreshes.

---

## Alpha v0.4.1 - Settlement Migration System

### Added

- Added per-player settlement migration support.
- Added settlement migration tracking.
- Added a migration runner for applying missing settlement updates.
- Added an initial settlement migration baseline.

### Changed

- Replaced automatic settlement resets triggered by application version changes.
- Settlement changes are now handled through incremental migrations.
- Separated database migrations from player settlement migrations.
- Player progress is preserved across future game updates.

### Removed

- Removed application-version-based settlement reset handling.
- Removed settlement version tracking from players.

### Fixed

- Prevented future application updates from unintentionally resetting player settlements.

### Reason

Early development relied on destructive settlement resets when introducing significant gameplay changes. The migration system provides a safer way to evolve the game's database while preserving existing player progress.

---

## Alpha v0.4.0 - Resource Storage Foundation

This update introduced the initial storage infrastructure required for future resource-management mechanics.

### Added

- Added resource storage categories.
- Added storage capacity tracking for player settlements.
- Added storage displays showing capacity and current usage.
- Added player announcements for major game updates.
- Added initial settlement versioning infrastructure.

### Changed

- Refactored resource flow handling to separate:

  - resource amounts
  - production
  - consumption
  - storage

- Improved separation between simulation data and frontend presentation.

### Reason

This established the foundation for a proper storage system while avoiding prematurely implementing storage buildings and more complex capacity mechanics.

---

## Alpha v0.3.6 - Responsive Settlement Interface

The settlement interface was improved to provide a better experience across desktop, tablet, and mobile devices.

### Interface Improvements

- Updated the main game layout to adapt better across different screen sizes.
- Improved resource and population overview displays.
- Improved production building management tables on smaller screens.
- Improved Recipes & Actions with groupings and collapsible sections.
- Reduced interface clutter by prioritising important information when space is limited.
- Improved table structure and readability.
- Added accessibility improvements for dynamic information and worker controls.

This update focused on usability and preparing the interface for future management features as settlements and production systems become more complex.

---

# Current Features

## Account Systems

- Registration and login
- Email verification
- Account detail changes
- Persistent player data

## Gameplay Systems

- Manual resource gathering
- Resource discovery
- Recipe discovery
- Building construction
- Population buildings
- Worker assignment
- Worker automation
- Automated production
- Server-side simulation ticks
- Live resource production and consumption
- Resource flow tracking
- Resource storage categories
- Storage capacity enforcement
- Food consumption
- Population growth
- Persistent settlement state

## Interface Systems

- Live resource updates
- Live population updates
- Live building updates
- Live task updates
- Live recipe updates
- Live storage updates
- Dynamic discovery of new gameplay content
- Responsive settlement interface
- Grouped and collapsible recipe interface
- Accessible dynamic status indicators
- Worker management controls

## Development Systems

- Bug reporting
- Gameplay suggestions
- Developer dashboard
- Player settlement inspection tools
- Database migrations
- Per-player settlement migrations

---

# Gameplay Overview

Players begin with a small settlement and a limited selection of resources and actions.

As the settlement develops, players can:

- Discover new resources.
- Unlock new recipes.
- Gather resources manually.
- Construct buildings.
- Increase population.
- Gain additional workers.
- Assign workers to production buildings.
- Automate resource production.
- Balance resource production against consumption.
- Manage limited storage capacity.
- Expand production chains.

The intended gameplay loop is centred around gradually reducing manual work while managing the increasingly complex interactions between resources, production, workers, population, food, and storage.

The game is designed around **persistent settlement progression** rather than a traditional map-based strategy system.

---

# Development Roadmap

The project is being developed incrementally rather than attempting to implement the complete game at once.

## v0.4.x - Core Systems & Foundations

This phase focuses on establishing the core systems that future settlement-management mechanics will build upon.

### Completed / In Progress

- [x] Core resource management
- [x] Resource production and consumption
- [x] Basic storage capacity
- [x] Worker assignment and availability
- [x] Population capacity and housing
- [x] Population growth and starvation mechanics
- [x] Basic food consumption and production
- [x] Player-facing population and food information
- [ ] Further refinement of core settlement systems
- [ ] Initial gameplay balancing

## v0.5.x - Storage & Resource Management

The next major development phase will turn the current storage-capacity foundation into a more complete settlement management system.

### Planned

- [ ] Storage expansion
- [ ] Storage buildings and upgrades
- [ ] Improved storage management interface
- [ ] More meaningful storage categories
- [ ] Better handling of production when storage is unavailable
- [ ] Production buildings displaying clear idle or blocked states
- [ ] Improved player-facing automation feedback
- [ ] Better interaction between production chains and storage capacity
- [ ] Further resource-management improvements

---

## v0.6.x - Tools & Player Automation

This phase will expand the player's ability to interact with and automate the settlement.

### Planned

- [ ] Rework tools and gathering mechanics
- [ ] Expand tool progression
- [ ] Improve manual gathering interactions
- [ ] Introduce additional automation options
- [ ] Improve worker management
- [ ] Improve production building states
- [ ] Add clearer explanations for why automated systems are idle or blocked

---

## v0.7.x - Production & Settlement Expansion

### Planned

- [ ] Expand production chains
- [ ] Add additional buildings
- [ ] Introduce more resource interactions
- [ ] Expand population mechanics
- [ ] Expand food systems
- [ ] Add additional settlement progression systems
- [ ] Improve balancing between manual work and automation

---

## v0.8.x - Progression & Gameplay Depth

This phase will focus on making the existing systems work together as a more complete resource-management game.

### Planned

- [ ] More meaningful progression between settlement stages
- [ ] Additional resource tiers
- [ ] More complex production chains
- [ ] More specialised buildings
- [ ] Expanded worker and population management
- [ ] More meaningful resource-management decisions
- [ ] Gameplay balancing
- [ ] Improved long-term progression

---

## v0.9.x - Reliability & Polish

This phase will focus on making the existing game systems reliable and pleasant to use rather than introducing large new mechanics.

### Planned

- [ ] Improve simulation reliability
- [ ] Improve handling of interrupted or failed actions
- [ ] Improve consistency between server state and displayed state
- [ ] Improve error handling and player-facing feedback
- [ ] Improve recovery from connection or request failures
- [ ] Improve database migration reliability
- [ ] Improve testing coverage for important gameplay systems
- [ ] Improve interface polish
- [ ] Accessibility improvements
- [ ] Performance improvements

---

## v1.0.x - Core Game Release

The first major release will represent a stable, playable version of the core resource-management experience.

### Goals

- [ ] Core gameplay loop is stable.
- [ ] Resource management is meaningful.
- [ ] Storage systems are fully implemented.
- [ ] Production chains are reliable.
- [ ] Worker automation is reliable.
- [ ] Population and food systems are balanced.
- [ ] Progression provides meaningful long-term goals.
- [ ] Major gameplay systems have appropriate testing and error handling.
- [ ] Interface is consistent and usable across supported screen sizes.
- [ ] No major known gameplay-breaking issues.

---

# Future Gameplay Ideas

These ideas are deliberately separate from the core roadmap and may change significantly during development.

## Expeditions

Rather than introducing a traditional overworld or persistent game map, future exploration may be implemented as a **timed expedition system**.

Possible mechanics include:

- Selecting an expedition.
- Assigning workers or resources.
- Waiting for a timer to complete.
- Receiving resources, discoveries, or other rewards.
- Choosing between safer and more valuable expeditions.
- Unlocking new expedition opportunities through progression.

This would allow exploration to add strategic depth without turning the game into a traditional map-based strategy game.

The intention is for expeditions to complement the settlement rather than replace it with a conventional world map.

---

# Project Philosophy

The primary goal of this project is to create an enjoyable resource management game while continuing to improve my software development skills.

Rather than recreating an existing game, the focus is on designing and implementing gameplay systems from first principles.

Features are developed incrementally, tested, and refined before additional complexity is introduced.

Gameplay takes priority over presentation. Reliable systems, maintainable code, meaningful mechanics, and a clear player experience are considered more important than visual polish during development.

The project is intentionally being built as a **browser-based simulation** rather than a traditional downloadable strategy game. The design therefore focuses on:

- persistent settlement progression
- live simulation
- automation
- resource management
- production chains
- population management
- asynchronous activities
- timed expeditions

The game does not currently aim to provide a traditional downloadable-game save system or a conventional persistent overworld map. The settlement itself is the persistent game state, while future exploration is intended to be handled through asynchronous expedition-style activities.
