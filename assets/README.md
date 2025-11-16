# Pledge Data - Branding Assets

Complete branding pack for the Pledge Data mobile application.

## 🎨 Quick Start

**View all assets visually:**
Open [`preview.html`](preview.html) in your browser to see all branding assets with previews and download links.

**Read full branding guide:**
See [`branding-guide.md`](branding-guide.md) for complete brand guidelines, color palette, and usage instructions.

---

## 📦 Assets Included

### Core Branding
| Asset | File | Dimensions | Format | Usage |
|-------|------|------------|--------|-------|
| **App Icon** | `icon.svg` | 512×512 | SVG | App launcher, PWA icon, favicon |
| **Gold Emblem** | `emblem.svg` | 256×256 | SVG | Loading states, watermarks |
| **Text Logo** | `logo-text.svg` | 800×200 | SVG | Headers, marketing |
| **Splash Screen** | `splash.svg` | 1080×1920 (9:16) | SVG | App launch screen |
| **Header Banner** | `banner.svg` | 1200×300 | SVG | Dashboard headers, web |

### PNG Exports
| Asset | File | Dimensions | Format | Usage |
|-------|------|------------|--------|-------|
| **Icon 192** | `icon-192.png` | 192×192 | PNG | PWA manifest, small icon |
| **Icon 512** | `icon-512.png` | 512×512 | PNG | PWA manifest, large icon |

---

## 🎨 Brand Colors

```css
/* Primary Colors */
--deep-black: #0e0e0e;      /* Background */
--card-black: #161616;      /* Surfaces */
--rich-gold: #CDAA00;       /* Accent */
--soft-gold: #f4e4c1;       /* Highlights */

/* Text Colors */
--primary-text: #e6e6e6;    /* Main content */
--muted-text: #9a9a9a;      /* Secondary content */

/* Borders */
--border-subtle: #2a2a2a;   /* Dividers */
```

---

## 🚀 Quick Preview

```bash
# Open preview in browser
start preview.html   # Windows
open preview.html    # Mac
xdg-open preview.html # Linux
```

Or simply open http://localhost:8080/assets/preview.html if your dev server is running.

---

## 📱 Implementation

### Add to index.html
```html
<!-- PWA Icons -->
<link rel="icon" type="image/png" sizes="192x192" href="assets/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/icon-512.png">
<link rel="apple-touch-icon" href="assets/icon-192.png">
```

### Add to manifest.json
```json
{
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Use emblem in loading state
```html
<div class="loading-screen">
  <object data="assets/emblem.svg" type="image/svg+xml" width="128" height="128"></object>
  <p>Loading...</p>
</div>
```

---

## 🛠️ Converting SVG to PNG

If you need additional PNG exports:

### Method 1: Online (Easiest)
1. Visit https://cloudconvert.com/svg-to-png
2. Upload the SVG file
3. Set desired dimensions
4. Download PNG

### Method 2: Command Line (Inkscape)
```bash
inkscape icon.svg --export-filename=icon-192.png --export-width=192 --export-height=192
inkscape icon.svg --export-filename=icon-512.png --export-width=512 --export-height=512
```

### Method 3: Browser (Quick & Easy)
1. Open `preview.html`
2. Right-click on the asset preview
3. Select "Save Image As..."
4. Choose PNG format

---

## 📐 Design Specifications

### Visual Style
- **Theme**: Cinematic dark with rich gold accents
- **Contrast**: High (7:1 minimum for WCAG AAA)
- **Effects**: Soft glows, no harsh shadows
- **Geometry**: Clean, precise shapes
- **Aesthetic**: Premium tech, AI-powered

### Symbolism
The emblem represents:
- **Orbital Rings**: Continuous data tracking and flow
- **Central Node**: AI intelligence hub
- **Data Nodes**: Key tracking points
- **Connection Beams**: Data relationships
- **Geometric Precision**: Organization and structure

---

## 📄 Files Overview

```
assets/
├── README.md              ← You are here
├── branding-guide.md      ← Full brand guidelines
├── preview.html           ← Visual preview of all assets
│
├── icon.svg              ← App icon (SVG)
├── emblem.svg            ← Standalone gold emblem
├── logo-text.svg         ← Full text logo
├── splash.svg            ← Mobile splash screen
├── banner.svg            ← Wide header banner
│
├── icon-192.png          ← PNG export 192×192
└── icon-512.png          ← PNG export 512×512
```

---

## ✨ Features

All assets include:
- ✅ Scalable vector graphics (SVG)
- ✅ Premium gold gradient effects
- ✅ Soft ambient glow filters
- ✅ Consistent branding across all pieces
- ✅ Optimized for dark backgrounds
- ✅ Mobile-first design
- ✅ High-contrast accessibility
- ✅ Cinematic lighting effects

---

## 🎯 Brand Principles

1. **Luxurious**: Premium feel with gold accents
2. **Modern**: Clean, minimal geometric design
3. **Data-Driven**: Emblem symbolizes tracking and intelligence
4. **Accessible**: High contrast, WCAG AAA compliant
5. **Consistent**: Same palette and style across all assets

---

## 📞 Support

For questions or modifications:
- See `branding-guide.md` for detailed guidelines
- Open `preview.html` for visual reference
- Check `styles.css` for implementation

---

**Pledge Data** - Offline Intelligence
