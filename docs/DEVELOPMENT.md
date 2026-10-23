# Developing Movement Lab

Movement Lab's primary product is a static 3D fitness exercise library. The inherited anatomy atlas is retained as a secondary route. Start with the [English README](../README.md) or [Chinese README](../README.zh-CN.md).

## Runtime and commands

Use Node.js 20.19+ on the 20.x line, or 22.12+, and a browser with WebGL2. These Node requirements follow the installed Vite package. Install and run from `web/`:

```bash
npm ci
npm run dev
```

The default development URL is `http://localhost:5173/`; use the URL printed by Vite if that port is occupied. For a production build:

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

The movement check covers catalogue uniqueness, poses, muscle mappings, support/grip contacts and preview assets. The i18n check covers all eight exercise locales. The SEO check reads the generated output, so run it after the build.

## Routes

| Route | Purpose |
|---|---|
| `/` | Chinese exercise library |
| `/exercises/bench/` | Chinese bench-press demonstration |
| `/en/` | English exercise library |
| `/en/exercises/pullup/` | English pull-up demonstration |
| `/anatomy/` | Inherited anatomy atlas |

Other exercise locale prefixes are `/es/`, `/fr/`, `/de/`, `/pt/`, `/ja/` and `/ko/`. The atlas's knowledge and narration retain their original English/Hindi coverage. Exercise preview query parameters are for capturing thumbnails, not separate indexable content pages.

## Source map

| Location | Responsibility |
|---|---|
| `web/src/app.js`, `routes.js` | Entry routing and page selection |
| `web/src/exercises.js`, `exerciseLibrary.js` | Catalogue, search, category filters and cards |
| `web/src/benchPress.js`, `benchMuscles.js`, `benchInstructions.js` | Bench-press animation, highlights and instructions |
| `web/src/commonExercises.js` and exercise data modules | Exercise configuration, muscle roles and cues |
| `web/src/standingExercises.js`, `standingPose.js` | Shared viewer and standing/barbell poses |
| `web/src/expandedPose.js`, `expansionMotion.js` | Additional bodyweight and dumbbell motions |
| `web/src/machineMotion.js`, `machineEquipment.js` | Machine poses, cables and supports |
| `web/src/localization.js`, `locales/` | Exercise translations and localized paths |
| `web/scripts/seo-data.js`, `seo-plugin.js` | Static HTML, metadata, structured data and sitemap |
| `web/public/previews/`, `web/public/models/` | Exercise thumbnails and exported anatomy models |
| `content/`, `pipeline/` | Inherited atlas content and model/content tooling |

The exported GLBs and Draco decoder resources are available to the app without downloading Blender sources. Read [the original atlas documentation](../README-ANATOMY.md) before changing its export pipeline.

## Adding an exercise

1. Inspect the existing exercise data modules and choose the appropriate motion system.
2. Add a unique ID, category, equipment, muscle-role mappings, setup, phases, mistakes and sources. Implement and inspect the actual pose; a renamed card is not a new animation.
3. Add translations in `locales/`, including the expansion dictionaries when relevant.
4. Capture the real rendered action into `web/public/previews/<id>.png` and verify the camera crop.
5. Review the movement validation script's catalogue assertions when intentionally changing the current 50-exercise scope. Run the checks above and visually inspect the motion, supports and equipment through a complete cycle.

## Static deployment and SEO

Set the real public root URL in the git-ignored file `web/.env.production`. For the currently deployed site:

```dotenv
SITE_URL=https://movement-lab.pages.dev/
```

For a new deployment or custom domain, replace this value before rebuilding. `SITE_URL` also determines the base path, so include any intended subdirectory. Without it, production builds intentionally default to noindex and do not emit a public sitemap or canonical URL.

Deploy only `web/dist/`. Do not upload the repository root, `.env` files, dependency directories or Blender source files. The current Cloudflare Pages project is `movement-lab`, published by **direct upload**. This repository is not connected to automatic Cloudflare builds.

The build generates 416 content pages (50 exercises, library and atlas routes across eight locales) plus eight localized error pages. Serve the generated HTML for each path and return HTTP 404 for unknown URLs; do not rewrite every request to the homepage. Verify deep links, model/Draco loading, language switching, canonical URLs, `robots.txt` and `sitemap.xml` on the public deployment.

More details: [SEO notes](../web/README-SEO.md) and [i18n notes](../web/README-I18N.md), both currently in Chinese.

## Contributions and provenance

Keep changes focused on fitness demonstrations, useful instruction content and accessible browsing. Report exercise IDs, browser details and reproducible steps for visual problems. Document limitations rather than claiming measured muscle activation or validated biomechanics.

Preserve upstream history and attribution. Read [CREDITS.md](../CREDITS.md), including the noncommercial kidney-model exception, before redistribution or commercial use.

## Fitted bench-press surface preview

The normal viewer and library previews retain the original muscle anatomy. Open `/exercises/bench/?surface=fitted` locally to compare the new fitted exterior with the anatomy and bones. This is a bench-only preview; it is not a clinical model, soft-tissue simulation or a final hand-grip solution.

The surface is an adaptation of the attributed atlas assets, not a new material on the old skin panels. The builder welds region boundaries, adds contour edges, fits the torso and limbs towards their muscle envelopes, and assigns region-aware weights. It remeshes a solid body in an A-pose with separated arms to prevent accidental arm-to-torso joins, then returns the result to the shared exercise bind space. The face and extremities derive from the original skin atlas. A featureless pelvic volume replaces the old garment hem. The runtime loads the generated `public/models/fitness-surface.glb` with Draco compression; visitors do not run this reconstruction.

To regenerate, install `scripts/requirements-surface.txt` in a Python virtual environment, activate it, then run `npm run build:surface` from `web/`. Intermediate files stay in ignored `web/work/surface/`. The standard website build does not need Python. Run `npm run check:fitted-surface` to check the actual asset's topology, joint order, normalized weights, torso influences and deformation across 21 press poses. Inspect all phases visually as well; numeric checks do not certify anatomical realism.

## Direct exercise entry

Exercise routes skip the anatomy-atlas intro and doctor greeting, disable automatic speech and UI sounds, and reveal the canvas only after the exercise has been posed. JavaScript-enabled exercise pages hide the static SEO text during startup; the instructions remain in the HTML for crawlers and visitors without JavaScript. The anatomy atlas retains its separate introduction and controls.

## Language selection

On an unprefixed library, exercise or atlas URL, the site uses a saved manual language selection first, then the first supported language in `navigator.languages` (with `navigator.language` as a fallback), then English. Regional variants map to their supported base language, including `zh-TW` to the available Simplified Chinese translation. Explicit language prefixes take precedence and are never redirected by browser preferences. Locale redirects preserve query strings, fragments and deployment subdirectories.
