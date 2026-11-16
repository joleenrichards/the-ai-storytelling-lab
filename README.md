# The AI Storytelling Lab

**An editorial creative workbench for turning raw campaign ideas into sharp social hooks, visual shot directions, and publication-ready post proofs.**

*Designed and prompted by **Joleen Richards**, social media strategist and visual storyteller.*

---

## Overview

Most AI writing tools churn out generic, bloated copy with zero visual context. **The AI Storytelling Lab** approaches social strategy like an editorial newsroom—separating hook ideation, visual framing, and live post proofing into a focused, tactile workspace.

Built using an **Editorial Field Guide** design system (Warm Alabaster `#F7F4EF`, Botanical Green `#1F5E4D`, Terracotta `#C85A32`, paired with editorial serif typography and crisp `lucide-react` iconography), the lab prioritizes human editorial voice, zero-clutter layout, and reliable client-side performance.

---

## Core Workflow

1. **Tab 01 — Angle & Hook Ideation:** Enter a campaign topic or raw note to generate distinct narrative angles, scroll-stopping hooks, and platform-aware drafts.
2. **Tab 02 — Art Direction & Visual Framing:** Pair copy with structured shot lists, aspect ratio presets (`1:1`, `4:5`, `9:16`, `16:9`), and editorial color grades.
3. **Tab 03 — Editorial Post Proof:** Preview the finished piece inside a distraction-free, publication-ready storyboard frame with dynamic visual cues and exportable copy.

---

## Architecture & Design Decisions

* **Zero-Credit Client-Side State:** Visual framing, aspect-ratio switching, color grading, and post proofing run 100% client-side in React state—eliminating unnecessary API calls and ensuring instant responsiveness.
* **Resilient Visual Framing:** Uses balanced `lucide-react` iconography inside hairline storyboard frames rather than unpredictable raw SVG generation, preventing aspect-ratio distortion across niche topics.
* **Tech Stack:** React, TypeScript, Tailwind CSS, `lucide-react`, Vite.

---

## Local Development

```bash
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
