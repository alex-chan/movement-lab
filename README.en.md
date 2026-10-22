# Movement Lab · 3D Exercise Demonstrations

[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**See how an exercise moves. Understand which muscles take part.**

Movement Lab is a browser-based 3D exercise library with **50 exercises, 6 training categories and 8 languages**, covering bodyweight, barbells, dumbbells, cables and gym machines.

**[Live demo](https://movement-lab-alex-chan.pages.dev/en/)** · [Bench press](https://movement-lab-alex-chan.pages.dev/en/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## Features

- Interactive 3D demonstrations with rotation, zoom and preset camera views.
- Dark red for primary muscles; light red for assisting or stabilizing muscles; white for other areas.
- Play, pause, restart, timeline scrubbing and 0.5× / 1× / 1.5× playback.
- Setup instructions, movement phases, common mistakes and references.
- Search by exercise, muscle or equipment; filter by training category.
- Chinese, English, Spanish, French, German, Portuguese, Japanese and Korean.
- Static Three.js + Vite app: no custom backend, account or AI API key required.

## Exercise coverage

| Category | Count | Examples |
|---|---:|---|
| Chest | 8 | Bench press, push-up, floor fly |
| Back | 8 | Pull-up, lat pulldown, cable row |
| Shoulders | 6 | Dumbbell press, lateral raise, machine press |
| Arms | 6 | Dumbbell curl, hammer curl, cable pushdown |
| Legs | 17 | Squat, deadlift, lunge, seated leg curl |
| Core | 5 | Plank, dead bug, bird dog |

## Run locally

Use Node.js **20.19+ on 20.x, or 22.12+**, and a WebGL2-capable browser.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

Open the printed URL, normally `http://localhost:5173/`. Exported models and Draco resources are included; Blender sources are not needed. Serve over HTTP rather than opening HTML files directly.

## Validate and deploy

From `web/`:

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Set `SITE_URL` to the actual public URL in the git-ignored local file `web/.env.production`. Deploy `web/dist/` to Cloudflare Pages or another static host, retaining individual pages and real 404 responses. The live site currently uses direct upload; GitHub pushes do not deploy automatically.

The build includes static instructions, localized metadata and structured data. Setting `SITE_URL` also enables canonical URLs, hreflang and a sitemap; without it, builds default to noindex. See the [developer guide](docs/DEVELOPMENT.md); the [SEO](web/README-SEO.md) and [localization](web/README-I18N.md) notes are in Chinese.

## Limits and credits

Animations are procedural illustrations without real-load or soft-tissue simulation. Colors show muscle roles, **not measured activation**; white areas may still stabilize. This does not replace individual coaching or medical advice.

The inherited atlas at `/anatomy/` is a secondary tool. Its knowledge content and narration remain in English/Hindi, outside the exercise library's eight-language coverage.

Based on [SeemaBansal1/3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), with upstream history and [original documentation](README-ANATOMY.md) preserved. Z-Anatomy / BodyParts3D models retain their attribution and share-alike terms. The inherited organs layer includes a **CC BY-NC 4.0 kidney model that must be removed or replaced before commercial release**. See [credits and license scope](CREDITS.md).
