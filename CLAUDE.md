# CLAUDE.md — IKS Website Project Briefing

> Claude Code reads this file automatically at startup.
> This is the single source of truth for building and maintaining the IKS website.

---

## Project Overview

**Site name:** भारतीय ज्ञानप्रणाली व वारसा / Elements of Indian Knowledge Systems  
**GitHub repo:** https://github.com/vivek-sovani/IKS  
**Live URL:** https://vivek-sovani.github.io/IKS  
**Source book:** `Elements_of_IKS_-_Compiled_version_Kindle_ready__.pdf` (258 pages)  
**Author of translation:** Vivek Sovani (Marathi translation from English original)

**Purpose:** A bilingual (Marathi + English) educational website presenting the book's content as accessible web articles, one article per chapter. Each article has a summarised version (Phase I, current) and an advanced reading version (Phase II, future).

**Languages:** Every page is fully bilingual. All content elements have both `data-lang="mr"` (Marathi) and `data-lang="en"` (English) versions. Language preference is saved in `localStorage` as `iks-lang`.

---

## Folder Structure

```
IKS/
├── CLAUDE.md                          ← this file
├── README.md                          ← deployment instructions
├── index.html                         ← home page
├── 404.html                           ← not found page
├── site.json                          ← article registry (all 53 articles)
├── assets/
│   ├── css/
│   │   ├── fonts.css                  ← Google Fonts import only
│   │   ├── main.css                   ← layout, sidebar, topbar, mobile
│   │   └── article.css                ← article body, all block types
│   ├── js/
│   │   └── nav.js                     ← sidebar toggle, lang switch
│   └── images/
│       └── logo-om.svg
├── articles/
│   ├── 01/
│   │   ├── index.html                 ← Phase I article (bilingual, self-contained)
│   │   ├── advanced.html              ← Phase II (detailed, sources) — future
│   │   └── img/
│   │       ├── [infographic].svg      ← SVG infographics
│   │       └── image-prompts.txt      ← AI image generation prompts
│   ├── 02/ ... 53/                    ← same structure
└── shared/
    └── sidebar.html                   ← navigation partial (loaded via fetch)
```

**Important:** `articles/01/index.html` is the canonical template. Always use it as the starting point for new articles.

---

## Architecture Decisions

### Self-contained vs. shared files

- **On GitHub Pages (live site):** Each article uses external CSS (`/IKS/assets/css/`) and loads sidebar via `fetch('/IKS/shared/sidebar.html')`. This works because GitHub Pages serves over HTTP.

- **For local preview without a server:** Use the self-contained single-file version where all CSS and sidebar HTML are inlined. The file at `articles/01/index.html` uses this approach with relative paths (`../../index.html`, `../02/index.html`).

- **Best practice:** Run a local server during development:
  ```bash
  cd ~/Projects/IKS
  npx serve . -p 3000
  ```
  Then open `http://localhost:3000` — external CSS and fetch() both work.

### Language toggle

All bilingual elements use `data-lang="mr"` or `data-lang="en"` attributes:
```html
<p data-lang="mr">मराठी मजकूर येथे.</p>
<p data-lang="en" style="display:none;">English text here.</p>
```

The `setLang()` function in nav.js (or inline in self-contained articles) toggles `display:none` on all these elements. Language is saved to `localStorage('iks-lang')`.

---

## Design System

### Color tokens (CSS variables)

```css
--sf:    #D4500A   /* saffron — primary accent, headings */
--sf-l:  #F4874B   /* saffron light — hover, active sidebar */
--sf-p:  #FDF1EA   /* saffron pale — summary box background */
--gd:    #B8860B   /* gold — term boxes, decorative */
--gd-l:  #E8C84A   /* gold light — topbar title */
--gd-p:  #FDFAF0   /* gold pale — term box background */
--iv:    #FAF6EE   /* ivory — page background */
--iv-d:  #F0E8D8   /* ivory dark — insight block background */
--br:    #5C3A1E   /* brown — topbar, sidebar, article header */
--br-m:  #8B5E3C   /* brown mid — insight text */
--br-p:  #C4956A   /* brown pale — subtitle in header */
--tx:    #2C1810   /* text primary */
--tx2:   #6B4423   /* text secondary */
--tx3:   #9E7B5A   /* text muted */
--bd:    #DDD0BC   /* border */
--bd-l:  #EDE3D4   /* border light */
```

### Typography

- **Headings (Marathi):** `'Noto Sans Devanagari', sans-serif`
- **Body / English headings:** `'Crimson Pro', Georgia, serif`
- **Devanagari display:** `'Tiro Devanagari Marathi', serif`
- **Monospace:** system monospace for code/badges
- **Body font size:** 17.5px, line-height 1.9
- **Section h2:** 17–18px, color `var(--sf)`, border-bottom

### Section color coding (sidebar badges)

| Section | Color | Badge |
|---------|-------|-------|
| चक्र ० Central Concepts | Purple `#7B68CC` | ० |
| चक्र १ Cycles of Life | Green `#2A9D6B` | १ |
| चक्र २ Manifest/Unmanifest | Saffron `#D4500A` | २ |
| चक्र ३ Institutions | Gold `#B8860B` | ३ |

---

## Article Structure — All Block Types

Every article uses a consistent set of blocks in this order:

### 1. Article Header (`.art-hdr`)
```html
<div class="art-hdr">
  <div class="breadcrumb">
    <a href="../../index.html">मुखपृष्ठ / Home</a>
    <span>›</span>
    <span data-lang="mr">चक्र X — Section Name</span>
    <span data-lang="en" style="display:none;">Chapter X — Section Name</span>
  </div>
  <div class="art-num-badge">लेख / Article NN</div>
  <h1 data-lang="mr">मराठी शीर्षक</h1>
  <h1 data-lang="en" style="display:none;">English Title</h1>
  <div class="en-title" data-lang="mr">English subtitle shown in MR mode</div>
  <div class="art-meta">
    <span class="reading-time">X मिनिटे / X min</span>
    <span class="sec-tag" data-lang="mr">विभाग नाव</span>
    <span class="sec-tag" data-lang="en" style="display:none;">Section Name</span>
  </div>
</div>
```

### 2. Summary Box (`.summary-box`) — REQUIRED, always first in body
```html
<div class="summary-box">
  <div class="box-label" data-lang="mr">सारांश</div>
  <div class="box-label" data-lang="en" style="display:none;">Summary</div>
  <p data-lang="mr">२-३ ओळींचा सारांश — मराठी.</p>
  <p data-lang="en" style="display:none;">2-3 sentence summary — English.</p>
</div>
```

### 3. Content Section (`.content-sec`) — main text, use 3–5 per article
```html
<div class="content-sec">
  <h2 data-lang="mr">मराठी शीर्षक <span class="en-h">English Subtitle</span></h2>
  <h2 data-lang="en" style="display:none;">English Heading</h2>
  <p data-lang="mr">मराठी परिच्छेद.</p>
  <p data-lang="en" style="display:none;">English paragraph.</p>
</div>
```

### 4. Sanskrit Term Box (`.term-box`) — use for key Sanskrit terms
```html
<div class="term-box">
  <div class="term-word">संस्कृत शब्द <span class="term-rom">IAST Transliteration</span></div>
  <div class="term-def" data-lang="mr">मराठी व्याख्या. मूळ शब्दांचा अर्थ सांगा.</div>
  <div class="term-def" data-lang="en" style="display:none;">English definition. Explain etymology.</div>
</div>
```

### 5. Insight Block (`.insight-block`) — key philosophical insight, use 1 per article
```html
<div class="insight-block">
  <p data-lang="mr">मुख्य तात्त्विक विचार — italic style मध्ये दाखवला जातो.</p>
  <p data-lang="en" style="display:none;">Key philosophical insight — displayed in italic style.</p>
</div>
```

### 6. Article Infographic (`.art-image`) — SVG figure, 1–2 per article
```html
<figure class="art-image">
  <svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img">
    <title>Infographic title</title>
    <desc>Description for screen readers</desc>
    <!-- SVG content here -->
  </svg>
  <figcaption data-lang="mr">मराठी कॅप्शन.</figcaption>
  <figcaption data-lang="en" style="display:none;">English caption.</figcaption>
</figure>
```

### 7. Curiosity Box (`.curiosity-box`) — interesting fact or question, use 1 per article
```html
<div class="curiosity-box">
  <div class="box-label" data-lang="mr">जिज्ञासा</div>
  <div class="box-label" data-lang="en" style="display:none;">Curiosity</div>
  <p data-lang="mr">रोचक तथ्य, संख्या किंवा प्रश्न जो वाचकाला विचार करायला लावेल.</p>
  <p data-lang="en" style="display:none;">Interesting fact, statistic or question to provoke thought.</p>
</div>
```

### 8. Activity Box (`.activity-box`) — reflection exercise, use 1 per article
```html
<div class="activity-box">
  <div class="box-label" data-lang="mr">कृती — स्वतः अनुभवा</div>
  <div class="box-label" data-lang="en" style="display:none;">Activity — Experience It Yourself</div>
  <ol data-lang="mr">
    <li>पहिली कृती.</li>
    <li>दुसरी कृती.</li>
    <li>तिसरी कृती.</li>
  </ol>
  <ol data-lang="en" style="display:none;">
    <li>First activity.</li>
    <li>Second activity.</li>
  </ol>
</div>
```

### 9. Key Concepts Grid (`.concepts-grid`) — 2–4 Sanskrit terms defined
```html
<div class="content-sec">
  <h2 data-lang="mr">मुख्य संकल्पना <span class="en-h">Key Concepts</span></h2>
  <h2 data-lang="en" style="display:none;">Key Concepts</h2>
  <div class="concepts-grid">
    <div class="concept-card">
      <div class="c-term">संस्कृत शब्द</div>
      <div class="c-roman">Transliteration</div>
      <div class="c-def" data-lang="mr">मराठी व्याख्या</div>
      <div class="c-def" data-lang="en" style="display:none;">English definition</div>
    </div>
    <!-- repeat for each concept -->
  </div>
</div>
```

### 10. Phase II Teaser (`.phase2`) — REQUIRED, always last in body
```html
<div class="phase2">
  <div class="p2-icon">📖</div>
  <div>
    <div class="p2-label" data-lang="mr">सखोल अध्ययन — लवकरच येणार</div>
    <div class="p2-label" data-lang="en" style="display:none;">Advanced Reading — Coming Soon</div>
    <div class="p2-desc" data-lang="mr">मूळ शास्त्रग्रंथांचे संदर्भ आणि विस्तृत विवेचन</div>
    <div class="p2-desc" data-lang="en" style="display:none;">Primary source references and in-depth analysis</div>
  </div>
</div>
```

### 11. Article Navigation (`.art-nav`) — prev/next, always after art-body
```html
<div class="art-nav">
  <a class="nav-btn" href="../NN/index.html">     <!-- previous article, or <div></div> if first -->
    <span class="nav-dir" data-lang="mr">← मागील</span>
    <span class="nav-dir" data-lang="en" style="display:none;">← Previous</span>
    <span class="nav-art-title" data-lang="mr">NN. मराठी शीर्षक</span>
    <span class="nav-art-title" data-lang="en" style="display:none;">NN. English Title</span>
  </a>
  <a class="nav-btn right" href="../NN/index.html">  <!-- next article -->
    <span class="nav-dir" data-lang="mr">पुढील →</span>
    <span class="nav-dir" data-lang="en" style="display:none;">Next →</span>
    <span class="nav-art-title" data-lang="mr">NN. मराठी शीर्षक</span>
    <span class="nav-art-title" data-lang="en" style="display:none;">NN. English Title</span>
  </a>
</div>
```

---

## Infographic Guidelines

Each article should have **1–2 SVG infographics** embedded as `<figure class="art-image">`.

### SVG rules
- `viewBox="0 0 700 320"` (or taller if needed, always 700 wide)
- Background: `fill="#FAF6EE"` (ivory, matching page)
- Fonts: `font-family="'Noto Sans Devanagari',sans-serif"` for Marathi text
- Fonts: `font-family="'Crimson Pro',Georgia,serif"` for English/Sanskrit italic
- Arrow marker: always include the `<defs>` arrow marker
- Colors: use the design system tokens
- Always include `role="img"`, `<title>`, `<desc>` for accessibility
- Keep labels concise — no text wrapping in SVG

### Types of infographics to use
| Article type | Infographic type |
|---|---|
| Single concept (Ananda, Dharma) | Mechanism diagram — central node with pathways |
| Process or cycle | Flow diagram — left to right or circular with steps |
| Comparison | Side-by-side panels |
| Hierarchy (Vedas, Darshanas) | Tree diagram |
| Spectrum or scale | Horizontal bar or ladder diagram |

### Image prompts file
Always create `articles/NN/img/image-prompts.txt` with 4 prompts:
1. Infographic prompt (for NotebookLM or Canva)
2. Philosophical illustration (for Midjourney/DALL-E)
3. Presentation slide (for Google Slides/Canva)
4. WhatsApp share card (1080×1080px)

---

## Marathi Style Guide

### Grammar principles
- Use **शुद्ध मराठी** — avoid unnecessary English words
- Sentence structure: Subject + Object + Verb (SOV) — standard Marathi
- Use proper विभक्ती (case suffixes): ला, ने, चा/ची/चे, मध्ये, साठी, वर
- Use **होते/असते/आहे** correctly — do not mix tenses within a paragraph
- Prefer active voice over passive
- Use **म्हणजे** for definitions, not **म्हणतात**

### Vocabulary preferences
| Avoid | Prefer |
|-------|--------|
| experience (English) | अनुभव |
| process | प्रक्रिया |
| concept | संकल्पना |
| basically | मूलतः / थोडक्यात |
| very important | अत्यंत महत्त्वाचे |
| etc. | इत्यादी |
| basically | मुळात |
| mechanism | यंत्रणा |
| connection | संबंध / नाते |

### Sanskrit terms in Marathi text
- Always write the Sanskrit term first: **आनंद (Ananda)**
- Follow with meaning in parentheses on first use: **धर्म (ऋतम् राखण्याची प्रक्रिया)**
- Use italic for Sanskrit shlokas/verses: *शृण्वन्तु विश्वे...*
- Do NOT translate Sanskrit technical terms — explain them

### Sentence flow
- Keep sentences under 30 words
- One idea per sentence
- Use connecting words: **म्हणून, परंतु, शिवाय, याशिवाय, त्याचप्रमाणे, तरीही**
- Paragraph should have 2–4 sentences
- End sections with a synthesizing statement

### Common mistakes to avoid
- Do NOT write: "हे basically सांगते की..." (mixed language)
- Do NOT write: "ते म्हणतात की..." without naming the source
- Do NOT write overly long compound sentences with multiple subordinate clauses
- Do NOT use the same sentence opener twice in a row

---

## Content Guidelines for Articles

### What each article should contain
1. **Opening paragraph** — relatable real-life hook (everyday example)
2. **Core concept** — what does this term mean in IKS framework
3. **Mechanism or process** — how does it work
4. **Key insight** — the central philosophical point (goes in insight-block)
5. **Practical significance** — why this matters to a modern reader
6. **Curiosity** — one surprising fact or comparison
7. **Activity** — 2–3 reflective exercises

### Content source
- **Primary source:** The PDF book `Elements_of_IKS_-_Compiled_version_Kindle_ready__.pdf`
- Read the relevant chapter(s) carefully before writing
- **Summarised version:** Compress the book content to essential points — do not just translate verbatim
- **Do not add** content not present in the book
- **Do not omit** key concepts from the book's chapter

### Article length
- Summary version (Phase I): 600–900 words per language
- 4–6 content sections
- 1–2 Sanskrit term boxes
- 1 infographic
- 1 curiosity box
- 1 activity box

---

## Article Registry (site.json)

All 53 articles are registered in `site.json`. When publishing an article, update its status from `"draft"` to `"published"`.

### Section mapping
| Articles | Section | चक्र |
|---|---|---|
| 01–06 | Central Concepts | ० |
| 07–13 | Cycles of Life | १ |
| 14–33 | Manifest/Unmanifest Cycles | २ |
| 34–53 | Institutions | ३ |

### Full article list
```
01 आनंद / Ananda — The Nature of Joy                          [published]
02 आनंदाच्या उच्च मर्यादांचा शोध / In Search of Supreme Joy
03 ज्ञान — परमावस्थेचा सिद्धांत / Jnana — Theory of Supreme State
04 ज्ञानाच्या अवस्थेची पर्यायी नावे / Alternate Names for Jnana
05 अमर्यादित आनंदाचे परिणाम / Effects of Unlimited Bliss
06 योग व विद्या / Yoga and Vidya
07 ऋतम् व सत्यम् / Rtam and Satyam — Natural Order
08 धर्म / Dharma — Maintaining Natural Order
09 अंतर्गत चक्रे / Inner Cycles and Cosmic Connection
10 जीवनचक्र व आनंद / Life Cycle for Ultimate Bliss
11 चौथी अवस्था — तुरीय / The Fourth State — Turiya
12 वैदिक चक्र संकल्पना / Vedic Cycle Concepts
13 पुरुष–प्रकृती, सृष्टी–स्थिती–लय / Purusha-Prakriti
14 मानवी शरीराबद्दलचा भारतीय दृष्टिकोन / Indian View of Human Body
15 अंतःकरण / Antahkarana — Inner Instrument
16 प्राण आणि नाडी / Prana and Nadis
17 पुरुष आणि प्रकृती / Purusha and Prakriti (detailed)
18 अव्यक्त अर्धचक्र / Unmanifest Half-Cycle
19 ज्ञानयोग, कर्मयोग, भक्तियोग / Three Paths of Yoga
20 व्यक्त अर्धचक्र / Manifest Half-Cycle
21 आत्मगुण / Atmaguna — Qualities of the Self
22 वाक्, वेद व विद्या / Vak, Veda and Vidya
23 कर्म, कल्प, कला / Karma, Kalpa and Kala
24 अंतर्गत चक्रांची पूर्णता / Completion of Inner Cycles
25 गुरु व शिष्य / Guru and Shishya
26 विद्या, कला, यज्ञ, कर्म / Vidya, Kala, Yajna, Karma
27 विज्ञान / Vijnana — Applied Knowledge
28 विद्या आणि योग / Vidya and Yoga
29 वेदांमधील देवता / Vedic Deities
30 पिंडांडामधील देवता / Deities in Pindanda
31 ब्रह्मांडामधील देवता / Deities in Brahmanda
32 देवतांची एकसंध संकल्पना / Unified Concept of Deities
33 पुनर्रचनेच्या समस्या / Problems of Reconstruction
34 धर्मासाठी संस्था निर्माण / Creating Institutions for Dharma
35 अध्यापन पद्धती व शैली / Teaching Methods and Styles
36 १४ विद्या आणि ६४ कला / 14 Vidyas and 64 Kalas
37 कर्मकांड व ज्ञानकांड / Karmakanda and Jnanakanda
38 वेदांग / Vedangas — Six Limbs of the Veda
39 शिक्षा, व्याकरण, छंद / Shiksha, Vyakarana, Chhanda
40 निरुक्त, ज्योतिष, कल्प / Nirukta, Jyotisha, Kalpa
41 चार वेद आणि उपवेद / Four Vedas and Upavedas
42 षड्दर्शने / The Six Darshanas
43 तंत्र व आगम / Tantra and Agama
44 दैनंदिन जीवनातील तंत्रे / Tantras in Daily Life
45 पुरुषार्थ आणि आश्रम / Purusharthas and Ashrama
46 नित्यकर्म / Nityakarma — Daily Practice
47 उत्सव / Utsava — Festivals
48 संस्कार / Samskaras — Rites of Refinement
49 अभिरुची आणि मनोरंजन / Rasa and Kala — Taste and Arts
50 मंदिर संस्था / Temple Institution — Devalaya
51 तीर्थ आणि क्षेत्र / Tirtha and Kshetra — Sacred Sites
52 राष्ट्र आणि राजा / Rashtra and Raja — Nation and Ruler
53 देश म्हणजे व्यक्तिभूत दैवी शक्ती / Nation as Embodied Divine Power
```

---

## How to Add a New Article

### Step 1 — Read the book chapter
```bash
# Extract relevant pages from PDF (adjust page numbers)
pdftotext -f PAGE_START -l PAGE_END Elements_of_IKS.pdf -
```

### Step 2 — Create folder and copy template
```bash
mkdir -p articles/NN/img
cp articles/01/index.html articles/NN/index.html
```

### Step 3 — Edit articles/NN/index.html
Update these elements:
- `<title>` tag
- Breadcrumb: section number and name
- `art-num-badge`: Article number NN
- `h1`: Marathi and English titles
- `.en-title`: English subtitle (shown in MR mode)
- Reading time estimate
- All content sections (summary, sections, term boxes, infographic, curiosity, activity)
- Prev/next nav buttons with correct article numbers and titles
- `IKS.setActiveArticle('NN')` in script at bottom (if using shared sidebar)

### Step 4 — Create infographic SVG
Save to `articles/NN/img/article-NN-infographic.svg`
Reference in article as `<img src="img/article-NN-infographic.svg">`
Or embed inline as `<svg>...</svg>` directly in the figure element.

### Step 5 — Create image prompts
Save AI generation prompts to `articles/NN/img/image-prompts.txt`

### Step 6 — Update sidebar.html
Add the new article link in the correct section:
```html
<a class="sb-link done" href="../NN/index.html" data-art="NN">
  <span class="sb-n">NN</span>
  <span class="sb-t">
    <span class="mr-t">मराठी शीर्षक</span>
    <span class="en-t">English Title</span>
  </span>
</a>
```
Note: Use `class="sb-link done"` for published articles (shows ✓ checkmark). Use `class="sb-link"` for unpublished.

### Step 7 — Update site.json
Change `"status": "draft"` → `"status": "published"` for article NN.

### Step 8 — Commit and push
```bash
git add articles/NN/ shared/sidebar.html site.json
git commit -m "Add Article NN: [Title in English]"
git push origin main
```

---

## Development Server

Always use a local server when testing — never open HTML files directly with file:// protocol.

```bash
# Option 1: npx serve (simplest)
cd ~/Projects/IKS
npx serve . -p 3000

# Option 2: Python
python3 -m http.server 3000

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then visit: `http://localhost:3000`

---

## GitHub Pages Deployment

The site is hosted at `https://vivek-sovani.github.io/IKS`.

Settings: Repository → Settings → Pages → Source: main branch, / (root)

Push to `main` branch to deploy. GitHub Pages builds automatically within ~1 minute.

---

## Phase II (Advanced Reading) — Future

Each article will eventually have `articles/NN/advanced.html` with:
- Full Sanskrit shlokas with transliteration
- Verse-by-verse commentary
- Cross-references to other IKS articles
- Modern science parallels (where relevant)
- Bibliography: Vedic sources, commentaries, scholarly references

Do not build Phase II until Phase I for all 53 articles is complete.

---

## Quick Reference — Article HTML Template

```html
<!DOCTYPE html>
<html lang="mr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[MARATHI TITLE] | [ENGLISH TITLE] — भारतीय ज्ञानप्रणाली</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Marathi:ital@0;1&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Noto+Sans+Devanagari:wght@300;400;500;600&display=swap" rel="stylesheet">
<!-- ALL CSS INLINE — see articles/01/index.html for full styles -->
</head>
<body>
  <!-- TOPBAR -->
  <!-- OVERLAY + SIDEBAR (inline) -->
  <!-- MAIN -->
    <!-- art-hdr -->
    <!-- art-body -->
      <!-- summary-box -->
      <!-- content-sec × 4-5 -->
      <!-- term-box × 1-2 -->
      <!-- art-image (SVG infographic) -->
      <!-- insight-block × 1 -->
      <!-- curiosity-box × 1 -->
      <!-- activity-box × 1 -->
      <!-- concepts-grid -->
      <!-- phase2 -->
    <!-- art-nav -->
  <!-- /MAIN -->
  <!-- SCRIPT: setLang, toggleSec, sidebar toggle -->
</body>
</html>
```

---

*Last updated: May 2026*  
*Site author: Vivek Sovani*  
*Book: Elements of Indian Knowledge Systems (English) — Marathi translation by Vivek Sovani*
