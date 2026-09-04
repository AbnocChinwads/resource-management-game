# Resource Management Game

A browser-based resource management simulation built as a personal learning project.

The goal is to create a resource management game that I would genuinely enjoy playing while using the project to explore game systems, backend development, database design, simulation, frontend architecture, and long-term project maintenance.

Players begin by manually gathering resources before expanding their settlement through buildings, population growth, worker automation, and automated production systems.

## Play Online

**Live Game:** https://icecream.abnoc.dev

> The game is currently in active alpha development. Core gameplay systems are functional, but balancing, progression, and interface improvements are still ongoing.

---

# Current Version

**Alpha v0.5.2**

---

# Recent Updates

## Alpha v0.5.2 — Building Management

### Grouped Buildings

Buildings are now grouped together by building type.

Instead of displaying every building as a separate entry, buildings of the same type are organised into a single expandable group.

This makes the building interface easier to manage as your settlement grows and you construct multiple copies of the same building.

### Collapsible Building Groups

Building groups are collapsed by default and can be expanded when you need to manage individual buildings.

Each group displays the number of buildings it contains, allowing you to see the size of your settlement without opening every group.

Individual buildings remain available when expanded, including their health, production information, worker assignments, and management controls.

### Production Overview

Production building groups now provide an overview of their combined production and resource consumption.

This allows you to see the overall output and resource requirements of a group without having to expand it and inspect each building individually.

Individual production buildings continue to display their own production status and resource requirements when the group is expanded.

### A More Manageable Settlement

The building interface is now designed to remain useful as the number of buildings in your settlement increases.

Groups provide a quick overview of your buildings, while the expanded view provides access to the detailed information and controls needed to manage individual buildings.

### Why This Matters

As your settlement grows, managing every building individually becomes increasingly difficult.

Grouping buildings reduces the amount of information displayed at once while keeping the details available when they are needed.

You can now get a quick overview of how many buildings you have and how your production groups are performing, while expanding a group only when you need to make individual management decisions.

---

## Alpha v0.5.1 — Settlement Overview

### Settlement Status

Your settlement's most important information is now available at a glance.

The new settlement status panel continuously displays:

Population — your current population and maximum population capacity.
Workers — the number of idle and assigned workers.
Resources — the current amount of each discovered resource.
Resource Flow — whether each resource is currently increasing, decreasing, or remaining stable.
Storage — how much storage is currently being used in each resource category.

This information remains visible while you manage the rest of your settlement.

### Game Navigation

The detailed settlement information has been reorganised into separate tabs.

Resources — detailed information about your resources and their production and consumption.
Storage — detailed information about your storage capacity and the buildings providing it.
Recipes — available production and construction options.
Tasks — available manual tasks.

This keeps the main settlement view focused while still allowing you to access detailed information when you need it.

### Buildings

Population and production buildings are now kept visible while navigating between the detailed settlement views.

This allows you to continue managing your workforce while checking resources, storage, recipes, or tasks without having to leave the building interface.

### A Better Settlement Overview

The settlement view is now organised around two levels of information.

The settlement status panel provides the information you need to monitor continuously, while the detailed interfaces provide the information needed to make individual management decisions.

This means you can see the current state of your settlement while making decisions about what to produce, build, store, or assign workers to.

### Why This Matters

As your settlement grows, there is more information to keep track of.

The new layout keeps the information that is most important to your settlement's ongoing operation visible at all times, while moving less frequently needed detail into dedicated views.

You can now monitor your population, workforce, resources, and storage while using the detailed settlement interfaces to decide what your settlement needs next.

## This forms the foundation for expanding the settlement interface as new management systems are introduced.

---

## Alpha v0.5.0 — Storage Expansion

### Storage

Storage is now divided into categories based on the role of each resource within your settlement.

- **Material** — resources used for construction and processing, such as Stone, Ore, Wood, Logs and Planks.
- **Ingredient** — resources used as ingredients in production, such as Flour.
- **Food** — resources that can directly provide nutrition to your population.
- **Fuel** — resources used to power production.
- **Tool** — equipment used by your settlement.
- **Grain** — harvested grain resources such as Wheat.

Each storage category has its own capacity.

When a storage category reaches its capacity, production of resources belonging to that category can be prevented until space becomes available.

### Expanding Storage

Your settlement can now build dedicated storage buildings to increase its storage capacity.

- **Storehouse** — increases Material storage capacity.
- **Granary** — increases Grain storage capacity.
- **Pantry** — increases Ingredient storage capacity.
- **Food Store** — increases Food storage capacity.

Each storage building adds capacity to its associated storage category when constructed.

Multiple storage buildings can be built to continue expanding your settlement's storage capacity.

### Storage Buildings

Storage buildings are now part of the settlement's infrastructure rather than simply increasing the default storage limits.

Building additional storage allows your production chains to continue operating as your settlement grows and produces larger quantities of resources.

Storage buildings also create a new construction decision: expanding production may require expanding the infrastructure needed to store what your settlement produces.

### Why This Matters

Storage is now connected to the wider settlement economy.

Your production buildings determine what your settlement can produce, while your storage capacity determines how much of those resources your settlement can hold.

As production increases and new resources become available, expanding your storage infrastructure becomes an important part of maintaining a functioning settlement.

## This forms the foundation for future storage upgrades and more specialised settlement infrastructure.

---

## Alpha v0.4.10 — Ingredient Storage

### Storage Categories

- Added **Ingredient** as a new storage category.
- **Flour** has been moved from **Material** storage to **Ingredient** storage.
- Ingredient storage starts with a capacity of **100**.

### Resource Management

Flour is now treated separately from general construction and manufacturing materials, reflecting its role as an intermediate resource in food production.

This keeps **Material** storage focused on resources used for construction and manufacturing, while allowing food-production resources to be managed independently as the settlement develops.

---

## Alpha v0.4.9 — Building Construction Rebalance

### Building Costs

Building requirements have been rebalanced to make settlement progression more consistent.

- Basic resource buildings remain accessible early in the game.
- More advanced buildings now require a wider range of resources.
- **Sawmills** now require **Ore** for their metal cutting equipment.
- **Blacksmiths** now require **Ore** as part of their initial construction.
- **Cottages** now require **Planks**, reflecting their more substantial construction.
- **Bakery** construction now uses more **Stone** and less **Logs**.
- **Lumber Camps** now require **Stone** as well as Wood.

These changes are intended to make building progression feel more natural while giving processed resources such as **Logs** and **Planks**, and raw resources such as **Ore**, more meaningful roles in settlement development.

### Settlement Progression

Construction requirements now better reflect the increasing complexity of your settlement.

Basic resource buildings provide the foundations for your economy, while later buildings increasingly depend on resources produced by other parts of your settlement.

This creates a more interconnected progression as your settlement develops.

---

## Alpha v0.4.8 — Charcoal & Kiln Rework

### Production

- Added **Charcoal** as a new resource.
- Reworked the **Kiln** to produce Charcoal from Wood.
- Added Charcoal as a required input for **Bread** production.
- Added Charcoal as a required input for **Tools** production.
- Updated production chains to introduce fuel requirements where appropriate.

### Kiln

The Kiln has been repurposed as the settlement's basic charcoal production building.

- Assign a worker to the Kiln to produce Charcoal.
- Each production cycle consumes Wood and produces Charcoal.
- Charcoal can then be used by other production buildings.

This update expands the production chain and introduces the first step towards more interconnected production requirements.

---

## Alpha v0.4.7 — Interface Refinement

- Simplified the population display by combining idle and assigned workers, and combining current and max population.
- Added population growth and starvation countdowns to the population display.
- Simplified the food display by combining supply and demand values.
- Combined production and consumption information for production buildings.
- Simplified the storage display by combining stored and capacity values.
- Reduced unnecessary table columns while retaining the same gameplay information.
- Improved accessibility for dynamic population and food status information.

---

## Alpha v0.4.6 — Population & Food Overhaul

### Population

Population is now tied directly to the housing available in your settlement.

- **Current** — the number of people currently living in your settlement.
- **Maximum** — the maximum population your buildings can support.
- **Workers** — the number of people available to work.
- **Idle** — workers who aren't currently assigned to a building.
- **Assigned** — workers currently assigned to production buildings.

Your settlement also remembers the highest population you have reached.

### Growing Your Population

A sustained food surplus will now allow your population to grow.

As long as:

- You have food available.
- Your settlement has enough food production capacity to meet its population's needs.
- There is available housing capacity.

your population can gradually increase.

Building additional housing increases your maximum population and gives your settlement room to grow.

### Food

Food is now displayed separately from population, with a clearer breakdown of your settlement's food situation:

- **Food** — your current stored food.
- **Food Required** — how much food your population needs.
- **Food Supplied** — how much food your production can supply.
- **Food Balance** — the difference between food supplied and food required.

Food storage capacity can temporarily stop production when your stores are full. This does not prevent population growth if your settlement has sufficient production capacity and stored food.

### Starvation

Starvation now depends on **actually running out of food**, rather than simply having a food balance of zero.

A food balance of `0` means your settlement is producing exactly enough food to meet its current requirements. It does **not** mean your population is starving.

If your stored food reaches zero and your settlement cannot sustain its population, starvation begins.

During starvation:

- Recovering your food supply stops the starvation process.
- Once food conditions recover, population can begin rebuilding through the normal growth system.

### Why This Matters

Population, workers and food are now connected systems rather than separate numbers.

Your housing determines how many people you can support, your population determines how much food you need, your workers determine how much production you can maintain, and your food supply determines whether your settlement can continue to grow or begins to starve.

This forms the foundation for the settlement's future population and survival mechanics.

---

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
- Charcoal production

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
- Manage interconnected production requirements.

The intended gameplay loop is centred around gradually reducing manual work while managing the increasingly complex interactions between resources, production, workers, population, food, and storage.

The game is designed around **persistent settlement progression** rather than a traditional map-based strategy system.

---

# Development Roadmap

The project is being developed incrementally rather than attempting to implement the complete game at once.

## v0.4.x - Core Systems & Foundations

This phase focuses on establishing the core systems that future settlement-management mechanics will build upon.

### Completed

- [x] Core resource management
- [x] Resource production and consumption
- [x] Basic storage capacity
- [x] Worker assignment and availability
- [x] Population capacity and housing
- [x] Population growth and starvation mechanics
- [x] Basic food consumption and production
- [x] Player-facing population and food information
- [x] Initial gameplay balancing
- [x] Further refinement of core settlement systems

---

## v0.5.x - Storage & Resource Management

The 0.5.x development phase expands storage from a simple capacity limit into a more active part of settlement management.

### Completed / In Progress

- [x] Storage expansion
- [x] Storage buildings
- [ ] Storage upgrades
- [x] Improved storage management interface
- [x] More meaningful storage categories
- [x] Better handling of production when storage is unavailable
- [x] Production buildings displaying clear idle or blocked states
- [x] Improved player-facing automation feedback
- [x] Better interaction between production chains and storage capacity
- [ ] More advanced storage management and prioritisation
- [ ] Storage buildings with specialised or upgraded capacity
- [ ] Improved visibility of storage pressure across the settlement

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
