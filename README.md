[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/cosmiklispos-design/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/cosmiklispos-design/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA 6 trophy guide and tracker

An entry for [make.fun's gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01?ref=fhhchmnw): an offline web app that is the best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI.

## What it covers

- **All 55 trophies** — official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze), verified against the starter list and Exophase/PSNProfiles.
- **A guide for each trophy** in our own words, with sources cited (PowerPyx, Push Square, GTABase, KeenGamer, Sixshore).
- **Roadmap to the platinum** — 4 stages, ~200 hours, 1 playthrough, 0 online trophies.
- **Missable flags** — including Positive Mental Attitude (Chapter 1 balcony meditation).
- **Tracker** — checklist saved in localStorage, export/import JSON, filters by kind and grade, spoiler setting that hides story trophy names and descriptions until earned.

## Run it

Static files under `app/` — no build step, works offline in a desktop browser:

```sh
npx serve app
# or: python3 -m http.server -d app
```

## Hand it in

`main.ts` (Node 22) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` via `vendor/makefun-app.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Original design — no Rockstar logos, artwork or game screenshots. Built by an AI agent (Muse Spark) for [make.fun](https://make.fun/r/fhhchmnw).
