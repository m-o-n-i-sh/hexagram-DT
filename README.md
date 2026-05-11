# HexaGram

Static site for the **HexaGram** design thinking project group, built to deploy on GitHub Pages.

## Files

- `index.html` — Landing page (hero + category grid + team)
- `about.html` — About the Course
- `mentors.html` — Mentoring team
- `project-template.html` — Single template that renders any category via `?id=<category-id>`
- `styles.css` — Design system & styles
- `app.js` — Vanilla JS that loads `content/content.json` and renders pages
- `content/content.json` — All editable content (categories, blocks, files, images, audio)

## How to add content (no HTML duplication)

Edit `content/content.json`. Each entry in `categories` becomes a subpage at:

```
project-template.html?id=<category-id>
```

Supported block types inside a category:

- `text` — `{ "type": "text", "heading": "...", "paragraphs": ["..."] }`
- `images` — `{ "type": "images", "heading": "...", "items": [{ "src": "...", "alt": "...", "caption": "..." }] }`
- `files` — `{ "type": "files", "heading": "...", "items": [{ "name": "...", "kind": "pdf", "href": "...", "sub": "..." }] }`
- `audio` — `{ "type": "audio", "heading": "...", "items": [{ "label": "...", "src": "..." }] }`
- `embed` — `{ "type": "embed", "heading": "...", "src": "https://..." }` (iframe)

To upload a new image/file/audio, drop it into `assets/images/`, `assets/files/`, or `assets/audio/` and reference it from `content.json`.

## Local preview

GitHub Pages serves files over HTTP — the JSON fetch needs a server, not `file://`. Test locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

1. Push this folder to a GitHub repo.
2. Repo → Settings → Pages → Source: `main` branch, root.
3. Wait a minute, then visit `https://<user>.github.io/<repo>/`.
