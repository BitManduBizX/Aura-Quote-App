# AuraQuote — MonochromeWisdom

> **Timeless Wisdom. Modern Reflection.**

**AuraQuote** (`MonochromeWisdom`) is a responsive, high-contrast editorial single-page application (SPA) and mobile-first platform for discovering, customizing, analyzing, and sharing life, leadership, and multicultural wisdom quotes.

---

## Core Features

1. **Curated Monograph Quote Discovery & Categorization**
   - **Topic Collections**: `Life`, `Success`, `Motivation`, `Leadership`, `Love`, `Movies`, `Authors`, `World Quotes`, and `Cultural & Multilingual` (complete with original script, phonetic transliteration, and historical provenance backstories).
   - **Nuanced Sub-Categories**: `Short Quotes`, `Good Quotes`, `Cute Quotes`, `Deep & Thought-Provoking`, `Profound & Rare Quotes`, `Motivational Quotes for Changemakers`, `Perseverance`, `Community`, `Giving Tuesday`, `Fundraising/Donation`, `Kindness`, `Gratitude`, and `Teamwork`.
   - **Curated Hashtag Filters**: `#UniqueLifeQuotes`, `#DeepMeaning`, `#InstagramCaptions`, `#StatusInEnglish`, `#VeryShortQuotes`, `#2LineStatus`, `#ProfoundWisdom`.
   - **Dynamic Emoji Vibe Matcher**: Filter and pair quotes with 14 curated emotional resonances (`💬`, `💪`, `🌟`, `☀️`, `💛`, `⚡`, `🙏`, `🤝`, `👑`, `🙌`, `🔥`, `🫶`, `💙`, `🎉`).

2. **Daily Inspiration & Quote of the Day (QOTD)**
   - Deterministic daily monograph selection with spoken audio recital (`window.speechSynthesis`), historical provenance notes, and an interactive **Morning Reflection Journal** saved to your local vault.

3. **Studio Canvas (Quote-to-Image / Text-to-Image Customizer)**
   - Built-in HTML5 `<canvas>` design studio capable of rendering crisp high-DPI PNG prints in `1:1` (Square Post), `4:5` (Editorial Portrait), `9:16` (Social Story / Phone Wallpaper), and `16:9` (Desktop Cinema).
   - Customize monochrome palettes (`Pitch Black #000000`, `Charcoal Graphite #121212`, `Pure White #FFFFFF`, `Subtle Silver #E0E0E0`, `Archival Paper #F7F4EE`), typography pairings (`Playfair Display`, `Plus Jakarta Sans`, `JetBrains Mono`), framing borders, architectural grids, and watermarks.

4. **Embedded Literary Curator AI**
   - Server-side integration via `/api/gemini/explore` and `/api/gemini/generate` with automatic graceful fallback to the curated philological archive.
   - Explore philosophical exegesis, historical origin verification, cross-cultural parallels, reflection prompts, and bespoke quote synthesis for occasions like Giving Tuesday or leadership offsites.

5. **Privacy-First Consent Modals & LocalStorage Vault**
   - Explicit user permission dialogs before writing to `localStorage`, copying to the system clipboard, or exporting HTML5 canvas images.
   - Organize saved quotes into custom folders (`Personal Manifesto`, `Leadership & Keynote`, `Social Captions`, `Morning Reflections`) and export your collection as a Markdown (`.md`) monograph.

---

## Installation & Usage

### Prerequisites
- Node.js 20+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` if running locally:
```bash
cp .env.example .env
```

### 3. Start the Full-Stack Development Server
```bash
npm run dev
```
The Express + Vite server binds to `0.0.0.0:3000` (or `process.env.PORT`) and exposes a lightweight health check at `GET /health`.

### 4. Production Build
```bash
npm run build
npm start
```
