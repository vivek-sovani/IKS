# भारतीय ज्ञानप्रणाली व वारसा
## Elements of Indian Knowledge Systems

**Live site**: https://vivek-sovani.github.io/IKS  
**Repository**: https://github.com/vivek-sovani/IKS

---

## Folder Structure

```
IKS/
├── index.html               ← Home page
├── 404.html                 ← Not found page
├── site.json                ← Article registry (all metadata)
├── assets/
│   ├── css/
│   │   ├── fonts.css        ← Google Fonts
│   │   ├── main.css         ← Layout, sidebar, topbar, mobile
│   │   └── article.css      ← Article page styles
│   ├── js/
│   │   └── nav.js           ← Sidebar, language toggle, routing
│   └── images/
│       └── logo-om.svg
├── articles/
│   ├── 01/
│   │   ├── index.html       ← Article (bilingual)
│   │   ├── advanced.html    ← Phase II: detailed version
│   │   └── img/
│   │       └── image-prompts.txt
│   ├── 02/ ... 53/
├── shared/
│   ├── sidebar.html         ← Navigation (loaded by all pages)
│   ├── header.html
│   └── footer.html
└── README.md
```

---

## Adding a New Article

### Step 1: Create the folder
```bash
mkdir -p articles/NN/img
```

### Step 2: Copy the template
```bash
cp articles/01/index.html articles/NN/index.html
```

### Step 3: Edit the new file
- Update `<title>` tag
- Update breadcrumb section number and name
- Update `art-num-badge` (लेख / Article NN)
- Update `h1` (Marathi and English titles)
- Update `en-title`
- Update reading time
- Replace all content sections
- Update nav buttons (prev/next article numbers and titles)
- Update `IKS.setActiveArticle('NN')` in the script at bottom

### Step 4: Update sidebar.html
- Add the new article link with `data-art="NN"` and `class="sb-art-link done"` (the `done` class adds a ✓ checkmark)

### Step 5: Update site.json
- Change `"status": "draft"` to `"status": "published"` for the article

---

## Article Structure (Blocks Available)

| Block | Class | Purpose |
|---|---|---|
| Summary | `.summary-box` | One paragraph overview |
| Content | `.content-sec` | Main text sections |
| Sanskrit Term | `.term-box` | Define a key Sanskrit term |
| Infographic | `.art-image` | SVG or img figure with caption |
| Key Insight | `.insight-block` | Pull-quote style highlight |
| Curiosity | `.curiosity-box` | Interesting fact or question |
| Activity | `.activity-box` | Hands-on reflection exercise |
| Concepts Grid | `.concepts-grid` | 2-4 column definition cards |
| Phase II | `.phase2-teaser` | Advanced reading placeholder |

---

## Language Toggle
All bilingual content uses `data-lang="mr"` and `data-lang="en"` attributes.  
`nav.js` handles toggling based on user selection (saved to `localStorage`).

---

## GitHub Pages Setup
1. Push to `main` branch
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Site will be live at `https://vivek-sovani.github.io/IKS`

Note: Because pages use `fetch('/IKS/shared/sidebar.html')`, the site **must** be served from a web server. Opening `index.html` directly in a browser (file:// protocol) will not load the sidebar. Use a local server for development:
```bash
cd IKS
python3 -m http.server 8080
# Then visit http://localhost:8080
```
