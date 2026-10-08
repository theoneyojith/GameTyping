# ✍️ TypeCraft — Notebook Typing Practice

A sleek, notebook-themed typing practice web application featuring public-domain classic literature passages, live Wikipedia integration, a decoupled pure TypeScript typing engine, real-time analytics, and mechanical keyboard audio feedback.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **shadcn/ui**, and the **TweakCN Notebook Theme**.

---

## ✨ Features

- **📖 Literature & Knowledge Passages**:
  - **12+ Bundled Classics**: *Alice in Wonderland*, *The Great Gatsby*, *Sherlock Holmes*, *Frankenstein*, *Pride and Prejudice*, *Moby-Dick*, *The Time Machine*, *Dracula*, *Peter Pan*, *The Art of War*, and more.
  - **🌐 Wikipedia REST API Integration**: Pull random article summaries with automatic CC BY-SA 4.0 attribution and offline fallback.
  - **📝 Custom Passage Mode**: Paste your own articles, quotes, or code to clean and practice immediately.
- **⚡ Decoupled Pure Typing Engine**:
  - Independent pure TypeScript logic (`/src/engine`) with zero UI dependencies.
  - Calculates accurate Net WPM, Raw WPM, Accuracy percentage, cumulative mistake counts, and character-level state mapping.
- **📓 Notebook Theme & Aesthetics**:
  - Ruled notebook paper textures, margin lines, and handwritten heading typography (*Architects Daughter* + *Fira Code*).
  - Light & Dark mode toggle with curated OKLCH color palette tokens.
- **📊 Detailed Results & Analytics**:
  - Performance Grade/Rank ($S+$, $S$, $A$, $B$, $C$).
  - SVG Speed Trend Sparklines tracking WPM fluctuations over time.
  - Confetti celebration upon completion.
  - LocalStorage history with Personal Bests (Top WPM, Average WPM, Top Accuracy, Total Words).
- **🎯 Weak-Keys Heatmap**:
  - Aggregated typo frequency tracker highlighting difficult keys to help targeted practice.
- **🔊 Synthetic Mechanical Audio**:
  - Crisp mechanical keystroke clicks and completion chord synthesizers powered by the Web Audio API (with mute toggle).
- **⏱️ Game Modes & Length Filters**:
  - **Full Passage Mode** vs **Timed 60s Mode**.
  - **Short** (~40 words), **Medium** (~90 words), and **Long** (~180 words) sentence-boundary filters.
- **⌨️ Keyboard Shortcuts**:
  - `[Esc]`: Instant Restart
  - `[Tab]`: Next Passage

---

## 🏗️ Project Architecture

```text
/src
  /engine          # Pure typing engine logic, metrics, & types (no UI)
  /components      # TextDisplay, StatsBar, ResultCard, StoryPicker, CustomTextDialog, HistoryModal
    /ui            # Button, Card, Badge, Progress (shadcn primitives)
  /hooks           # useTypingSession, useStories
  /lib             # textCleaner, storage, soundEffects, utils
  /data            # fallbackStories.json (bundled literature dataset)
/tests             # Vitest test suite for typing engine and text cleaner
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js `v18+` or `v20+`
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/typecraft.git
cd typecraft
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

The core typing engine and text normalizer are covered by unit tests with **Vitest**:

```bash
npm test
```

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

---

## 📜 License & Attribution

- **Code**: MIT License.
- **Passages**: Public Domain (Project Gutenberg) and Wikipedia (CC BY-SA 4.0).
- **Theme**: [TweakCN Notebook Theme](https://tweakcn.com/r/themes/notebook.json).
