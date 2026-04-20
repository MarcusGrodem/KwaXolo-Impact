# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

KwaXolo Impact Challenge — a collaboration between Microsoft for Startups, INCVABATE, and KwaXolo (April 2026). Project briefings and case study materials are in `docs/briefings/`:

- `docs/briefings/KwaXolo_Project_Briefing.pdf` — project scope and requirements
- `docs/briefings/KwaXolo Impact Challenge :: Case.pdf` — case study
- `docs/briefings/Microsoft for Startup x INCVABATE x KwaXolo_April2026.pdf` — partnership context

Research reports (PDFs + MDs) are in `docs/research/`. Design artifacts and sparring docs are in `design/`. Project context summaries are in `context/`.

## Focus Area

Two pain points identified: **Phase 1** (basic PC literacy) and **Phase 6** (entrepreneurship). Phase 6 assumes English proficiency — but only 11% can use email and the population is predominantly isiZulu-speaking. The team is focused on solving **Phase 1**.

Phase 1 is KwaXolo's direct responsibility: getting ~7,000 students (65 per PC) and ~200 teachers to basic PC literacy under extreme constraints — no stable internet, up to 6h/day load shedding, 8–12 year old hardware, no IT support.

Language is a core design constraint: solutions must account for isiZulu as the primary language, not assume English literacy. English learning should be embedded unconsciously within the PC literacy content.

## Device Strategy

- **Primary:** Laptops/PCs (108 total, ~12 per school) — stable internet available at schools
- **Secondary:** Mobile phones (24% currently, ~87% projected by 2030) — supplementary access only
- Laptop-first to avoid excluding students without phones
- Mobile extends reach outside school hours but is not the core delivery mechanism

## Status

Greenfield repository — brainstorming/design phase. No tech stack or source code yet. Commands (build, test, lint) to be added once scaffolded.
