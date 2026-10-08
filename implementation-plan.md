# Implementation Plan: Typing Practice Site

Assumed stack: React + TypeScript (Vite). The plan works with any stack.

## 1. Decisions to Make First

**Stack:** Vite + React + TypeScript for the frontend, with a few serverless functions for story fetching. For zero build tooling, plain HTML/JS also works, since the published prototype is exactly that.

**Story sources:**

- **Project Gutenberg** (via the Gutendex API): public-domain books, good for long, well-written passages.
- **Wikipedia REST API** (random page summary): endless variety, but CC BY-SA, so show attribution.
- **Bundled fallback set** (like the 12 stories in the prototype): keeps the app working offline or when an API fails.
- **User paste**: already in the prototype.

Avoid scraping random websites or Reddit. It is fragile, raises copyright issues, and the text is messy.

**Fetch through a serverless proxy.** Browsers block many cross-site requests (CORS). A proxy also lets you cache and clean text on the server.

## 2. Architecture

```
/src
  /engine      typing logic (pure functions, no UI)
  /components  TextDisplay, StatsBar, ResultCard, StoryPicker, CustomTextDialog
  /hooks       useTypingSession, useStories
  /lib         storage.ts, textCleaner.ts
  /data        fallbackStories.json
/api           serverless functions: gutenberg.ts, wikipedia.ts
/tests         engine tests
```

Keep the typing engine independent of React. It is the part that needs the most testing.

## 3. Build Phases

### Phase 1: Core typing engine

- State: typed string, per-character status (correct, wrong, pending), start time, total keystrokes, error count.
- Metrics:
  - WPM = (correct chars / 5) / minutes
  - Accuracy = (keystrokes - errors) / keystrokes
- Handle backspace, paste blocking, and completion detection.
- Write unit tests before the UI.

### Phase 2: UI

- Text display with a cursor, a hidden input that captures keystrokes, and a live stats bar.
- Results card, restart, and next-story buttons.
- Responsive layout, visible focus states, dark/light theme.

### Phase 3: Stories

- Port the fallback stories into JSON.
- Build `textCleaner`:
  - Replace curly quotes and em dashes with typable equivalents.
  - Collapse whitespace.
  - Strip footnote markers and non-keyboard characters.
  - Cut at sentence boundaries to a target length.
- Add a length filter (short, medium, long).

### Phase 4: Online sources

- Gutenberg function: pick a random book, take a random paragraph range, clean it, return title and author.
- Wikipedia function: fetch a random summary and return it with a source link.
- Add an in-memory or edge cache.
- Frontend tries the online source first, then falls back to bundled stories on any error or timeout.

### Phase 5: Progress tracking

- Store each session (date, WPM, accuracy, story ID) in localStorage or IndexedDB.
- Add a history page with a line chart (Recharts) and personal bests.

### Phase 6: Extras (pick what you want)

- Timed mode (60 seconds, endless text).
- Weak-keys heatmap from per-character error counts.
- Difficulty levels (punctuation and numbers on or off).
- Accounts and cloud sync (Firebase or Supabase).

### Phase 7: Test and deploy

- Vitest for the engine, plus a Playwright smoke test (load, type a story, see results).
- Deploy to Vercel, Netlify or Firebase Hosting, all of which support serverless functions.

## 4. Edge Cases

- Mobile keyboards: autocorrect and predictive text break typing tests, so set `autocorrect="off"` and `autocapitalize="off"`.
- IME input for non-Latin languages.
- Very fast typing and dropped input events.
- Tab loses focus mid-session: pause, or prompt the user to click back in.
- Stories containing characters most keyboards can't type, which the cleaner must strip.

## 5. Working in Antigravity

- Give the agent one phase per task rather than the whole project at once, and review the plan and diff before accepting each one.
- Keep this file in the repo as a spec so the agent has constant context.
- Ask it to write the engine tests first and make them pass.
- Keep any API keys in environment variables, never in committed code.

### Starter prompt for Phase 1

> Create a Vite + React + TypeScript project. Implement a pure typing engine in `/src/engine` that takes a target string and a stream of input events and returns per-character status, WPM, accuracy, and completion state. WPM uses 5 characters per word and starts timing at the first keystroke. Accuracy counts every wrong keystroke even if it's later corrected with backspace. Include Vitest unit tests covering correct typing, errors, backspace, and completion. Do not build any UI yet.
