# Resource Management Game

A browser-based resource management game built as a personal learning project.

The goal is to create a resource management game that I would genuinely enjoy playing while using the project to explore game systems, backend development, database design, and long-term project maintenance.

Players begin by manually gathering resources before expanding their settlement through buildings, population growth, worker automation, and automated production systems.

## Play Online

**Live Game:** https://icecream.abnoc.dev

> The game is currently in active alpha development. Core gameplay systems are functional, but balancing, progression, and interface improvements are still ongoing.

---

# Current Version

Alpha v0.4.2

---

# Recent Updates

## Alpha v0.4.0 - Resource Storage & Settlement Reset Foundation

This update introduces the first major settlement progression infrastructure, adding the foundations required for future expansion of storage, automation, and progression systems.

### Gameplay System Improvements

* Added version-based settlement reset handling for major game updates.
* Added player announcements for communicating important updates after version changes.
* Added resource storage categories and capacity tracking.
* Added storage tracking for player settlements.
* Improved resource flow handling to separate resource amounts, production, consumption, and storage information.
* Prepared the game systems for future storage buildings and more complex resource management.

### Interface Improvements

* Added resource storage displays.
* Added storage category displays with capacity tracking.
* Added frontend displays for resource storage information.

This update focuses on improving the underlying game architecture and preparing settlements for future expansion rather than adding large amounts of new content.

## Alpha v0.3.6 - Responsive Settlement Interface

The settlement interface has been improved to provide a better experience across desktop, tablet, and mobile devices.

### Interface Improvements

* Updated the main game layout to adapt better across different screen sizes.
* Improved resource and population overview displays.
* Improved production building management tables on smaller screens.
* Improved Recipes & Actions with groupings and collapsible sections.
* Reduced interface clutter by prioritising important information when space is limited.
* Improved table structure and readability.
* Added accessibility improvements for dynamic information and worker controls.

This update focuses on improving usability and preparing the interface for future management features as settlements and production systems become more complex.

---

# Current Features

## Account Systems

* Registration and login
* Email verification
* Account detail changes
* Persistent player data

## Gameplay Systems

* Manual resource gathering
* Building construction
* Recipe discovery
* Worker assignment
* Automated production
* Server-side simulation tick
* Live resource production, consumption and flow tracking
* Population growth
* Food consumption
* Persistent game world

## Development Systems

* Bug reporting
* Gameplay suggestions
* Developer dashboard
* Player settlement inspection tools

---

# Gameplay Overview

Players begin with limited capabilities and gradually expand their settlement by discovering new resources, unlocking recipes, constructing buildings, and assigning workers.

The main focus is on:

* Building efficient production chains
* Managing resources
* Balancing expansion with sustainability
* Reducing manual work through automation

---

# Development Roadmap

## Gameplay

* [x] Manual gathering

* [x] Buildings

* [x] Worker automation

* [x] Automated production simulation

* [x] Food consumption

* [x] Population simulation

* [ ] Starvation consequences

* [ ] Starvation grace period

* [ ] Gameplay balancing

* [ ] Expanded production chains

* [ ] Additional buildings

* [ ] Late-game progression

## Interface

* [x] Navigation improvements

* [x] Responsive layout improvements

* [ ] Production statistics dashboard

* [ ] Improved management tools

* [ ] Visual polish

* [ ] Accessibility improvements

---

# Project Philosophy

The primary goal of this project is to create an enjoyable resource management game while continuing to improve my software development skills.

Rather than recreating an existing game, the focus is on designing and implementing gameplay systems from first principles. Features are developed incrementally, tested, and refined before additional complexity is introduced.

Gameplay always takes priority over presentation. Reliable systems, maintainable code, and enjoyable mechanics are considered more important than visual polish during development.
