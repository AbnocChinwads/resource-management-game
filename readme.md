# Resource Management Game

A browser-based resource management simulation built as a personal learning project.

The goal is to create a resource management game that I would genuinely enjoy playing while using the project to explore game systems, backend development, database design, simulation, frontend architecture, and long-term project maintenance.

Players begin by manually gathering resources before expanding their settlement through buildings, population growth, worker automation, and automated production systems.

## Play Online

**Live Game:** https://icecream.abnoc.dev

> The game is currently in active alpha development. Core gameplay systems are functional, but balancing, progression, and interface improvements are still ongoing.

---

# Current Version

**Alpha v0.6.1**

---

# Current Features

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

<details>

<summary>Account Systems</summary>

- Registration and login
- Email verification
- Account detail changes
- Persistent player data

</details>

<details>

<summary>Gameplay Systems</summary>

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

</details>

<details>

<summary>Interface Systems</summary>

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

</details>

<details>

<summary>Development Systems</summary>

- Bug reporting
- Gameplay suggestions
- Developer dashboard
- Player settlement inspection tools
- Database migrations
- Per-player settlement migrations

</details>

# Recent Updates

<details>

<summary>Alpha v0.6.1 — Automated Building Maintenance</summary>

### Maintenance Buildings

A new **Maintenance** building type has been introduced.

Maintenance buildings allow the settlement to automatically maintain damaged buildings without requiring the player to manually repair each one.

A functioning Maintenance building is required before automatic maintenance can be enabled.

### Automatic Maintenance

Buildings can now be individually assigned to automatic maintenance.

When maintenance is enabled for a building, the settlement will automatically repair it when required, using the same repair resources as manual repairs.

Maintenance can be enabled or disabled using the **Maintenance** switch displayed alongside each building's health.

This allows players to choose which buildings should be maintained automatically rather than applying maintenance to the entire settlement.

### Maintenance Availability

Automatic maintenance depends on having a functioning Maintenance building.

If all Maintenance buildings reach **0 health**, automatic maintenance becomes unavailable and the Maintenance controls are hidden.

Once a Maintenance building is repaired and becomes operational again, the controls automatically become available.

This means the settlement's maintenance infrastructure must itself be kept operational.

### Building Management Interface

Maintenance buildings now have their own building section alongside Population, Worker and Storage buildings.

Building lists continue to group multiple buildings of the same type together, while individual buildings can be expanded and managed separately.

Maintenance controls have also been integrated directly into the existing building health display.

### Why This Matters

Building degradation introduced an ongoing cost to settlement expansion.

Automatic maintenance now gives players a way to manage that growing workload without constantly repairing buildings by hand.

However, automation still depends on functioning maintenance infrastructure and a sufficient supply of repair resources, making settlement upkeep another system that must be planned and supported.

---

</details>

<details>

<summary>Alpha v0.6.0 — Building Degradation & Repairs</summary>

### Building Degradation

Buildings now gradually lose health over time.

All buildings experience normal wear, while production buildings experience additional wear while actively producing resources.

As a building's health decreases, its ability to support workers is also reduced.

### Building Health

Building health is displayed for each building as its current health compared to its maximum health.

For example:

**75/100**

As health decreases, larger buildings may support fewer workers.

A building with 0 health cannot operate and provides no worker capacity.

### Building Repairs

Damaged buildings can now be repaired using **Tools**.

Each repair uses **1 Tool** and restores **10 health**, up to the building's maximum health.

For example:

**75/100 → 85/100**

If a building is only 5 health below its maximum, a repair restores it to full health rather than exceeding its maximum.

### Tool Usage

Tools now have an active use within the settlement.

Players must maintain a supply of Tools to repair damaged buildings and keep their settlement operating effectively.

### Building Maintenance

Building condition is now an ongoing part of settlement management.

Allowing buildings to become damaged can reduce their available worker capacity and eventually stop production entirely.

Maintaining buildings therefore becomes an additional consideration when managing resources and expanding the settlement.

### Why This Matters

Buildings are no longer completely static once constructed.

Settlement expansion now comes with an ongoing maintenance requirement, giving Tools a practical purpose while making building condition another part of managing production and available workers.

</details>

<details>

<summary>Alpha v0.5.5 — Tool Shed Building</summary>

### Tool Shed

A new **Tool Shed** building has been added to provide additional storage capacity for tools.

The Tool Shed provides **20 additional tool storage capacity**, increasing the amount of tools the settlement can retain beyond its initial storage limit.

### Tool Shed Construction

The Tool Shed can be constructed through the existing building recipe system.

The **Build Tool Shed** recipe requires:

* **10 Planks**
* **10 Stone**

Construction takes **30 seconds** to complete.

### Expanded Tool Storage

Building a Tool Shed increases the settlement's available tool storage capacity by 20.

The Tool Shed uses the existing storage system, so tool capacity is automatically reflected in the player's Storage display and existing storage warnings.

### Tool Storage Progression

The Tool Shed provides the first dedicated expansion to tool storage.

The initial tool storage capacity remains limited, while the Tool Shed gives the player a way to expand that capacity when increased tool production makes the original limit insufficient.

### Why This Matters

Tool storage is now something the player can actively expand rather than being limited to the initial capacity indefinitely.

The Tool Shed provides a clear progression from producing tools to having enough storage space to maintain a larger stockpile, while keeping storage buildings separate from production buildings.

</details>


<details>

<summary>Alpha v0.5.4 — Storage Capacity Feedback</summary>

### Storage Capacity Warnings

The player interface now provides warnings when resource storage approaches its capacity limit.

Storage reaching 80% capacity is displayed as a **Nearly full** warning, giving the player an indication that additional storage may soon be required.

Once storage reaches its capacity limit, the warning changes to **Full**.

These warnings are displayed directly alongside the affected storage category so the player can immediately see which resources are approaching their limits.

### Improved Storage Blocked-State Feedback

Actions that cannot be completed because there is insufficient storage space now provide feedback directly within the player interface.

Previously, attempting an action that could not store its resulting resources used a browser alert to display the error.

The feedback is now displayed within the Storage section of the interface, keeping the player informed without interrupting the game with a browser dialog.

### Automatic Feedback Clearing

Storage-related action feedback is automatically cleared when the player's storage state is successfully refreshed.

This prevents outdated error messages from remaining visible after the player has taken an action that resolves the storage problem.

### Bootstrap Icons

Bootstrap Icons have been added to the player interface to provide consistent visual indicators for storage warnings.

Warning indicators now use Bootstrap's icon font rather than emoji characters, allowing the warning icon to follow the same colour styling as the associated message.

### A More Informative Storage Interface

The Storage section now communicates both the player's current storage levels and potential capacity problems.

Players can see when storage is approaching its limit before an action is blocked, while failed actions provide clear feedback when storage capacity has already become a problem.

### Why This Matters

Previously, the player could only discover a storage problem when an action attempted to produce more resources than the available storage could hold.

The storage interface now provides earlier warning when capacity is becoming limited and clearer feedback when an action is blocked.

This gives the player more information to manage their storage before it becomes a direct obstacle to production and other actions.

</details>

<details>

<summary>Alpha v0.5.3 — Integrated Recipe Actions</summary>

### Recipe Progress

Recipe actions now display their progress directly within the recipe interface.

When an action is started, its action button is replaced by a progress bar showing how far the action has progressed.

Once the action has finished, the progress bar is replaced by a Complete button.

### Integrated Task Management

Active recipe tasks are now managed directly from the recipe they belong to.

This removes the need to switch between the recipe list and a separate task list to check the status of an action.

Starting, monitoring, and completing a recipe action can now all be handled from the same place.

### One Active Task Per Recipe

A recipe can no longer be started again while it already has an active task.

Previously, repeatedly starting a recipe could add multiple instances of the same recipe to the Current Tasks table.

Now, once a recipe has been started, its action is replaced by its progress and completion controls until that task has been completed.

This makes the current state of each recipe immediately visible and prevents recipes from being repeatedly queued through the interface.

### Removed Current Tasks Display

The separate Current Tasks table has been removed from the player interface.

The underlying task system and `player_tasks` database records remain in place, so tasks continue to be tracked by the game even though they are no longer displayed in a separate list.

### Improved Recipe Availability

Recipe action buttons now update their availability as the player's resources and buildings change.

Recipes that require resources will automatically become available when the required resources are obtained, rather than remaining disabled from their initial state.

### A More Focused Recipe Interface

Recipes now provide both the action itself and its current status in one place.

This reduces duplicated information in the interface and makes the relationship between a recipe and its active task clearer.

### Why This Matters

Previously, starting a recipe created a task that was displayed separately in the Current Tasks table.

This meant the player could start the same recipe multiple times and then manage those tasks separately.

Recipe actions now contain their own task status, keeping the information and controls together while ensuring that each recipe can only have one active task at a time.

The result is a more focused interface where the recipe itself tells you whether it is available, in progress, or ready to complete.

</details>

<details>

<summary>Alpha v0.5.2 — Building Management</summary>

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

</details>

<details>

<summary>Alpha v0.5.1 — Settlement Overview</summary>

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

### This forms the foundation for expanding the settlement interface as new management systems are introduced.

</details>

<details>

<summary>Alpha v0.5.0 — Storage Expansion</summary>

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

### This forms the foundation for future storage upgrades and more specialised settlement infrastructure.

</details>

<details>

<summary>Alpha v0.4.10 — Ingredient Storage</summary>

### Storage Categories

- Added **Ingredient** as a new storage category.
- **Flour** has been moved from **Material** storage to **Ingredient** storage.
- Ingredient storage starts with a capacity of **100**.

### Resource Management

Flour is now treated separately from general construction and manufacturing materials, reflecting its role as an intermediate resource in food production.

This keeps **Material** storage focused on resources used for construction and manufacturing, while allowing food-production resources to be managed independently as the settlement develops.

</details>

<details>

<summary>Alpha v0.4.9 — Building Construction Rebalance</summary>

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

</details>

<details>

<summary>Alpha v0.4.8 — Charcoal & Kiln Rework</summary>

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

</details>

<details>

<summary>Alpha v0.4.7 — Interface Refinement</summary>

- Simplified the population display by combining idle and assigned workers, and combining current and max population.
- Added population growth and starvation countdowns to the population display.
- Simplified the food display by combining supply and demand values.
- Combined production and consumption information for production buildings.
- Simplified the storage display by combining stored and capacity values.
- Reduced unnecessary table columns while retaining the same gameplay information.
- Improved accessibility for dynamic population and food status information.

</details>

<details>

<summary>Alpha v0.4.6 — Population & Food Overhaul</summary>

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

</details>

<details>

<summary>Alpha v0.4.5 - Production State</summary>

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

</details>

<details>

<summary>Alpha v0.4.4 - Storage Capacity Enforcement</summary>

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

</details>

<details>

<summary>Alpha v0.4.3 - Live State Rebase & Frontend Architecture Completion</summary>

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

</details>

<details>

<summary>Alpha v0.4.2 - Frontend JavaScript Refactor</summary>

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

</details>

<details>

<summary>Alpha v0.4.1 - Settlement Migration System</summary>

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

</details>

<details>

<summary>Alpha v0.4.0 - Resource Storage Foundation</summary>

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

</details>

<details>

<summary>Alpha v0.3.6 - Responsive Settlement Interface</summary>

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

</details>

# Development Roadmap

The project is being developed incrementally rather than attempting to implement the complete game at once.

<details>

<summary>v0.4.x - Core Systems & Foundations</summary>

This phase focuses on establishing the core systems that future settlement-management mechanics will build upon.

### Completed

* [x] Core resource management
* [x] Resource production and consumption
* [x] Basic storage capacity
* [x] Worker assignment and availability
* [x] Population capacity and housing
* [x] Population growth and starvation mechanics
* [x] Basic food consumption and production
* [x] Player-facing population and food information
* [x] Initial gameplay balancing
* [x] Further refinement of core settlement systems

---

</details>

<details>

<summary>v0.5.x - Storage & Resource Management</summary>

The 0.5.x development phase expands storage from a simple capacity limit into a more active part of settlement management.

### Completed / In Progress

* [x] Storage expansion
* [x] Storage buildings
* [x] Improved storage management interface
* [x] More meaningful storage categories
* [x] Better handling of production when storage is unavailable
* [x] Production buildings displaying clear idle or blocked states
* [x] Improved player-facing automation feedback
* [x] Better interaction between production chains and storage capacity
* [ ] Expand storage capacity through additional storage progression
* [ ] More advanced storage management and prioritisation
* [x] Improve storage capacity warnings and blocked-state feedback

---

</details>

<details>

<summary>v0.6.x - Tools, Automation & Population</summary>

## v0.6.x - Tools, Automation & Population

This phase will introduce meaningful uses for tools, expand settlement automation, and introduce a more detailed population lifecycle.

### Planned

* [x] Add building degradation
* [x] Add building repair mechanics requiring tools
* [ ] Add tool-based worker efficiency
* [ ] Introduce tools as a resource with competing uses between production and repairs
* [x] Introduce additional automation options
* [ ] Introduce child, adult and elderly population categories
* [ ] Add population ageing between life stages
* [ ] Add player-facing population age breakdown
* [ ] Make adult population determine available workers
* [ ] Make population growth depend on adult population

---

</details>

<details>

<summary>v0.7.x - Production & Settlement Expansion</summary>

This phase will expand production systems and introduce additional resource and consumable choices that give the player more meaningful decisions.

### Planned

* [ ] Expand production chains
* [ ] Introduce more resource interactions
* [ ] Introduce additional consumable resources and production choices

---

</details>

<summary>v0.8.x - Reliability, Architecture & Polish</summary>

This phase will focus on improving the reliability, architecture and maintainability of the existing game systems rather than introducing large new mechanics.

### Planned

* [ ] Improve simulation reliability and concurrency
* [ ] Reduce unnecessary database queries and improve data access efficiency
* [ ] Introduce a proper database connection pool
* [ ] Move game logic out of middleware where appropriate
* [ ] Move JavaScript behaviour out of EJS templates where possible
* [ ] Improve handling of interrupted or failed actions
* [ ] Improve consistency between server state and displayed state
* [ ] Improve error handling and player-facing feedback
* [ ] Improve recovery from connection or request failures
* [ ] Improve database migration reliability
* [ ] Improve testing coverage for important gameplay systems
* [ ] Improve interface polish
* [ ] Accessibility improvements
* [ ] Performance improvements

---

</details>

<details>

<summary>v1.0.x - Core Game Release</summary>

The first major release will represent a stable, playable version of the core resource-management experience.

### Goals

* [ ] Core gameplay loop is stable.
* [ ] Resource management is meaningful.
* [ ] Storage systems are fully implemented.
* [ ] Production chains are reliable.
* [ ] Worker automation is reliable.
* [ ] Population and food systems are balanced.
* [ ] Progression provides meaningful long-term goals.
* [ ] Major gameplay systems have appropriate testing and error handling.
* [ ] Interface is consistent and usable across supported screen sizes.
* [ ] No major known gameplay-breaking issues.

---

</details>

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
