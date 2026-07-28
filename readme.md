Resource Management Game
========================

A browser-based resource management game built as a personal learning project. Players begin by manually gathering resources before expanding their settlement through buildings, population growth, and worker automation.

Play Online
-----------

**Live Game:** [https://icecream.abnoc.dev](https://icecream.abnoc.dev)

> The game is currently in active alpha development. Core gameplay systems are functional, but balancing and interface improvements are still in progress.

* * * * *

Current Status
==============

The project is under active development and is being expanded incrementally. New systems are added only after the existing gameplay has been tested and proven stable.

Current priorities are:

-   Completing the remaining account management features.

-   Refining the core gameplay simulation.

-   Balancing production chains, food consumption, and progression.

-   Improving the user interface and overall player experience.

Visual polish remains secondary until the underlying gameplay systems feel rewarding and enjoyable.

* * * * *

Current Features
================

Account Management
------------------

-   User registration and login

-   Email verification

-   Change player name

-   Change email address

-   Change password

-   Persistent player data

-   Welcome emails on registration

Gameplay
--------

-   Manual resource gathering

-   Building construction

-   Recipe discovery

-   Worker assignment

-   Automated production

-   Food consumption simulation

-   Population simulation

-   Starvation mechanics (under development changes)

-   Persistent game world

Infrastructure
--------------

-   Automated deployment to a self-hosted Linux server

-   Docker-based deployment

-   GitHub Actions deployment pipeline

* * * * *

Gameplay Overview
=================

Players begin with only manual gathering available. As resources are collected, new crafting recipes and buildings become available.

Buildings can be staffed with workers to automate production, allowing increasingly complex production chains to emerge. Population growth introduces additional workers, but also increases food consumption, requiring players to carefully balance expansion against sustainability.

The game is designed around long-term planning, production efficiency, and gradually reducing manual work through automation.

* * * * *

Development Roadmap
===================

Core Gameplay
-------------

-[x]   Manual gathering

-[x]   Buildings

-[x]   Worker automation

-[x]   Food consumption

-[x]   Population simulation

-[x]   Starvation system

-[]    Starvation grace period

-[]   Gameplay balancing

-[]   Expanded production chains

-[]   Additional buildings

-[]   Late-game progression

Account Management
------------------

-[x]   Registration

-[x]   Email verification

-[x]   Change account details

-[]   Account deletion

User Interface
--------------

-[x]   Navigation improvements

-[]   Production statistics dashboard

-[]   Better management tools

-[]   Visual polish

-[]   Accessibility improvements

* * * * *

Project Philosophy
==================

The primary goal of this project is to create a genuinely enjoyable resource management game while continuing to improve my software engineering skills.

Rather than recreating an existing game, the focus is on designing and implementing gameplay systems from first principles. Features are developed incrementally, tested thoroughly, and refined before additional complexity is introduced.

Gameplay always takes priority over presentation. Reliable systems, maintainable code, and enjoyable mechanics are considered more important than visual polish during development.

The long-term aim is to build a stable, expandable game that players enjoy returning to while serving as a demonstration of backend application architecture, server-authoritative simulation, database design, authentication, deployment, and long-term project maintenance.