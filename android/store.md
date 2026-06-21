# Google Play Store Listing — IKS App

All text below is ready to copy-paste into the Play Console.

---

## App Identity

| Field | Value |
|---|---|
| **Package name** | `in.iksapp` |
| **App name** | IKS — Indian Knowledge Systems |
| **Developer name** | Vivek Sovani |
| **Default language** | English (en-IN) |
| **Category** | Education |
| **Sub-category** | Books & Reference |
| **Content rating** | Everyone (no violence, no adult content) |
| **Contact email** | vivek.sovani@kimayainfotech.com |
| **Website** | https://vivek-sovani.github.io/IKS/ |

---

## Short Description
*(max 80 characters — shown in search results)*

```
Explore Indian Knowledge Systems in Marathi & English — 53 bilingual articles.
```

---

## Full Description
*(max 4000 characters — shown on app page)*

```
भारतीय ज्ञानप्रणाली व वारसा — Elements of Indian Knowledge Systems

Discover the timeless wisdom of India's knowledge traditions through 53 carefully
crafted bilingual articles in Marathi and English.

This app is based on the book "Elements of Indian Knowledge Systems" and presents
its content as an accessible, beautifully designed reading experience — one article
per chapter.

━━━━━━━━━━━━━━━━━━━━━━━
📚 WHAT'S INSIDE
━━━━━━━━━━━━━━━━━━━━━━━

• 53 articles across 4 thematic cycles (चक्रे)
• Cycle 0 — Central Concepts: Ananda, Jnana, Yoga, Vidya
• Cycle 1 — Cycles of Life: The rhythms that govern existence
• Cycle 2 — Unmanifest, Manifest & Inter-Personal Cycles
• Cycle 3 — Institutions for Protecting the Cycles

━━━━━━━━━━━━━━━━━━━━━━━
🌐 FULLY BILINGUAL
━━━━━━━━━━━━━━━━━━━━━━━

Switch between Marathi (मराठी) and English with a single tap. Language preference
is saved automatically. Every article, heading, summary and diagram is available
in both languages.

━━━━━━━━━━━━━━━━━━━━━━━
✨ FEATURES
━━━━━━━━━━━━━━━━━━━━━━━

• Clean, distraction-free reading experience
• Sanskrit terms explained with IAST transliteration and definitions
• Visual infographics — flow diagrams, concept wheels, comparison charts
• PDF presentation slides for each article (Marathi + English)
• Estimated reading time per article (5–8 minutes)
• Reflection activities and curiosity questions
• Offline-capable — works without internet after first load
• No ads. No tracking. No sign-up required.

━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHO IS THIS FOR?
━━━━━━━━━━━━━━━━━━━━━━━

• Students and teachers of Indian philosophy and culture
• Marathi readers seeking accessible explanations of classical concepts
• Anyone curious about Ananda, Dharma, Yoga, Vidya and their roots in Indian thought
• Readers of the book "Elements of Indian Knowledge Systems"

━━━━━━━━━━━━━━━━━━━━━━━
📖 ABOUT THE CONTENT
━━━━━━━━━━━━━━━━━━━━━━━

The articles are based on "Elements of Indian Knowledge Systems," with Marathi
translation by Vivek Sovani. Each article presents the essence of its chapter in
600–900 words per language, with Sanskrit term boxes, key concept grids, and a
philosophical insight highlight.

Phase II (advanced reading with primary source references and verse-by-verse
commentary) is coming soon.
```

---

## What's New (Release Notes — v1.0)
*(shown on the app update page)*

```
First release of IKS — Indian Knowledge Systems.

• 6 published articles on Central Concepts (Ananda, Jnana, Yoga, Vidya)
• Fully bilingual Marathi + English
• Visual infographics and PDF slides
• Offline-capable
```

---

## Tags / Keywords
*(enter these one by one in Play Console)*

```
Indian Knowledge Systems, IKS, Marathi, भारतीय ज्ञान, Ananda, Jnana, Yoga,
Vedic, Sanskrit, Indian philosophy, education, bilingual, Marathi books,
Indian culture, Dharma, classical India
```

---

## Privacy Policy

The app does not collect, store or transmit any personal data.
No login required. No analytics. No third-party SDKs beyond the Android Browser
Helper (TWA runtime).

**You must host a privacy policy URL for Play Store submission.**
Create a simple page at a public URL, e.g.:

`https://vivek-sovani.github.io/IKS/privacy.html`

Suggested text for that page:

```
Privacy Policy — IKS App

This app does not collect any personal information.
It does not use analytics, advertising, or tracking of any kind.
All data (language preference) is stored locally on your device only.
No data is transmitted to any server.

Contact: vivek.sovani@kimayainfotech.com
```

---

## Graphic Assets Required

| Asset | Size | Notes |
|---|---|---|
| **App icon** | 512 × 512 px PNG | Use `assets/images/icon-512.png` from the repo |
| **Feature graphic** | 1024 × 500 px JPG/PNG | Required — create a banner with app name + tagline |
| **Screenshots (phone)** | min 2, up to 8 | 1080 × 1920 px recommended |
| **Screenshots (tablet)** | optional | 1200 × 1920 px |

### Suggested screenshots to capture (install release APK, take these):
1. Home page — showing article grid with Marathi titles
2. Article page — showing a content section with Sanskrit term box
3. Article page — showing an infographic (wheel or flow diagram)
4. Bilingual toggle — same article in English
5. Sidebar open — showing all 4 cycles/sections

---

## Play Console Checklist

- [ ] App signed with release keystore (use `IKS-Android-v1.0-release` artifact)
- [ ] Privacy policy URL created and live
- [ ] Feature graphic created (1024×500)
- [ ] Minimum 2 phone screenshots captured
- [ ] Content rating questionnaire filled (select Education; answer No to all sensitive content)
- [ ] App category set to Education
- [ ] Target audience: 13+ (or All ages — no age-restricted content)
- [ ] Free app (no in-app purchases)
- [ ] `assetlinks.json` live at `https://vivek-sovani.github.io/.well-known/assetlinks.json`

---

## App Signing for Play Store

The release APK is signed with the keystore generated in CI.
The keystore is cached in GitHub Actions under key `android-release-keystore-v1`.

**SHA-256 fingerprint** (for assetlinks.json and Play Console):
```
04:1E:2E:44:0C:2A:92:DD:F3:10:CF:6B:B5:AB:61:55:74:A5:16:C8:3B:10:09:05:15:4B:04:FA:29:E2:5E:5B
```

> ⚠️ Play Store requires you to either upload the APK as-is (self-signed)
> or enrol in Play App Signing (Google re-signs the APK after upload).
> If you enrol in Play App Signing, update `assetlinks.json` with the
> fingerprint Google gives you after upload — it will differ from the above.

---

*Generated: 2026-06-21*
