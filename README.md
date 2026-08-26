# Define It

A Chrome extension: select a word or short phrase on any page (docs, articles,
anything), click **Define**, and get an instant, context-aware definition
powered by the Gemini API — without leaving the page.

## How it works

- `src/content.ts` — watches for text selections. If you select up to 8 words,
  a small "Define" pill appears next to the selection. Clicking it grabs ~400
  characters of surrounding text as context and sends both to the background
  worker.
- `src/background.ts` — the only place that talks to the network. It reads
  your Gemini API key from `chrome.storage.sync`, sends the selected term +
  context to `gemini-2.0-flash`, and returns a 1–3 sentence definition.
- `options.html` / `src/options.ts` — a small settings page where you paste
  your Gemini API key once. It's saved to Chrome's synced storage, not sent
  anywhere except Google's API.
- `src/styles.css` — Tailwind entry point, compiled to `dist/styles.css` and
  used by both the content script and the options page. **Preflight (Tailwind's
  base reset) is disabled** in `tailwind.config.js` — the content script's CSS
  loads on every page you visit, so a global reset would mess with the host
  site's own typography and spacing. Only Tailwind's utility classes are used.

## Setup

1. **Get a Gemini API key** (free tier is fine): https://aistudio.google.com/apikey

2. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```
   This runs two steps: `build:css` compiles `src/styles.css` (Tailwind) into
   `dist/styles.css`, and `build:js` bundles `src/*.ts` into `dist/*.js` with
   esbuild.

3. **Load the extension in Chrome**
   - Go to `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select this project folder (the one with `manifest.json`)

4. **Add your API key**
   - Click the extension icon in the toolbar → it opens the options page
     (or right-click the icon → **Options**)
   - Paste your Gemini API key → **Save key**

5. **Try it**
   - Go to any page with text (a docs site, an article)
   - Select a word or short phrase
   - Click the **Define** pill that appears
   - A card shows the definition, tuned to the surrounding context

## Development

Run `npm run watch` to rebuild on file changes. After editing source files,
re-click the reload icon for the extension on `chrome://extensions`, then
refresh the page you're testing on (content scripts don't hot-reload).

## Ideas for next iterations

- Keyboard shortcut to define the current selection without the pill
- Cache recent lookups so re-selecting the same term is instant
- A small history panel of everything you've looked up in a session
- Support for `gemini-2.0-flash` fallback to `gemini-1.5-flash` if rate-limited
- Publish to the Chrome Web Store once you're happy with it — good practice
  for the packaging/review side of shipping software, separate from the
  open-source contribution goal you mentioned earlier.
