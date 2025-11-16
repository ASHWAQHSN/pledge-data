# Pledge Data - Branding Guide

## Brand Overview
**Pledge Data** is a premium offline mobile application for tracking ads, clients, analytics, and budget. The brand aesthetic is luxurious, modern, and data-driven with a cinematic dark theme.

---

## Color Palette

### Primary Colors
- **Deep Black**: `#0e0e0e` - Background
- **Card Black**: `#161616` - Surface elements
- **Rich Gold**: `#CDAA00` - Primary accent
- **Soft Gold**: `#f4e4c1` - Secondary accent/highlights
- **Dark Gold**: `#9a7f00` - Gradient depth

### Text Colors
- **Primary Text**: `#e6e6e6` - Main content
- **Muted Text**: `#9a9a9a` - Secondary content
- **Border Subtle**: `#2a2a2a` - Dividers/borders

### Status Colors
- **New**: `rgba(80, 140, 255, 0.16)` with border `rgba(80, 140, 255, 0.6)`
- **Active**: `rgba(46, 160, 84, 0.18)` with border `rgba(46, 160, 84, 0.7)`
- **Expiring**: `rgba(205, 170, 0, 0.18)` with border `rgba(205, 170, 0, 0.8)`
- **Expired**: `rgba(200, 50, 50, 0.16)` with border `rgba(200, 50, 50, 0.7)`

---

## Typography

### Font Family
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Arial, sans-serif;
```

### Font Weights
- **Light**: 300 - Headlines, elegant text
- **Regular**: 400 - Body text
- **Medium**: 500 - Subheadings
- **Semibold**: 600 - Important labels
- **Bold**: 700 - Key values, stats

### Letter Spacing
- **Headlines**: `0.08em`
- **Section Titles**: `0.06em`
- **Body Text**: Normal
- **Buttons**: `0.05em`

---

## Assets Included

### 1. App Icon (`icon.svg`)
- **Format**: SVG (scalable)
- **Features**:
  - Rounded square background (`#0e0e0e`)
  - Gold orbital data tracking emblem
  - Central node with orbital rings
  - 4 cardinal data nodes
  - Connection beams showing data flow
- **Usage**: App launcher, favicon, PWA icon

### 2. Gold Emblem (`emblem.svg`)
- **Format**: SVG (standalone symbol)
- **Features**:
  - Abstract geometric gold emblem
  - Triple orbital system (inner, middle, outer)
  - Central hexagon for precision
  - 4 primary + 6 secondary data nodes
  - Outer geometric frame
- **Usage**: Loading states, branding marks, watermarks

### 3. Text Logo (`logo-text.svg`)
- **Format**: SVG with text + emblem
- **Features**:
  - "PLEDGE DATA" in premium typography
  - Mini emblem on left
  - Tagline: "OFFLINE INTELLIGENCE"
  - Subtle underline accent
- **Usage**: Headers, marketing, splash screens

### 4. Splash Screen (`splash.svg`)
- **Format**: SVG (9:16 mobile ratio - 1080×1920)
- **Features**:
  - Pure black background
  - Large centered emblem with intense glow
  - Subtle light rays from center
  - Floating particles
  - Brand name + tagline
  - Animated loading indicator
- **Usage**: App launch screen, loading screen

### 5. Header Banner (`banner.svg`)
- **Format**: SVG (wide horizontal - 1200×300)
- **Features**:
  - Dark gradient background
  - Abstract data wave visualization
  - Geometric data grid pattern
  - Left and right emblem accents
  - Connected data node clusters
  - Floating particles
- **Usage**: Dashboard headers, email headers, web banners

---

## Design Principles

### Visual Style
1. **Cinematic Dark Theme**: Deep blacks with rich gold accents
2. **High Contrast**: Easy to scan, comfortable for eyes
3. **Minimal & Elegant**: No clutter, clean geometric shapes
4. **Premium Tech Aesthetic**: Sophisticated, AI-powered feel
5. **Soft Ambient Glow**: Expensive-looking lighting, not harsh

### Effects & Animations
- **Glow**: Soft gold glow using `feGaussianBlur` filters
- **Transitions**: 0.12-0.25s for smooth, lag-free animations
- **Hover States**: Subtle lift (`translateY(-1px)`)
- **Focus States**: Gold outline for accessibility

### Symbolism
The emblem represents:
- **Data Flow**: Orbital rings showing continuous tracking
- **Organization**: Geometric precision and structure
- **Intelligence**: Central node as the AI brain
- **Connectivity**: Nodes and beams showing data relationships

---

## Usage Guidelines

### Do's ✓
- Maintain high contrast between background and foreground
- Use gold sparingly for maximum impact
- Keep animations smooth and lightweight
- Ensure all interactive elements are touch-friendly (44×44px minimum)
- Use soft glows instead of harsh shadows
- Apply consistent letter-spacing for premium feel

### Don'ts ✗
- Don't use rainbow colors or cheap gradients
- Don't add unnecessary decoration or clutter
- Don't use harsh drop shadows
- Don't compromise readability for aesthetics
- Don't mix other accent colors with gold
- Don't use heavy animations that cause lag

---

## File Structure
```
assets/
├── icon.svg           (App icon with emblem)
├── emblem.svg         (Standalone gold emblem)
├── logo-text.svg      (Full text logo)
├── splash.svg         (Mobile splash screen 9:16)
├── banner.svg         (Wide horizontal banner)
├── icon-192.png       (PNG export 192×192)
├── icon-512.png       (PNG export 512×512)
└── branding-guide.md  (This file)
```

---

## Converting SVG to PNG

To generate PNG versions for app icons:

### Using Online Tools:
1. Visit https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set dimensions:
   - 192×192px for `icon-192.png`
   - 512×512px for `icon-512.png`
4. Download and place in `assets/` folder

### Using Command Line (with Inkscape):
```bash
# Install Inkscape first
inkscape icon.svg --export-filename=icon-192.png --export-width=192 --export-height=192
inkscape icon.svg --export-filename=icon-512.png --export-width=512 --export-height=512
```

### Using Node.js (with sharp):
```bash
npm install sharp
node convert-icons.js
```

---

## Accessibility

- All interactive elements meet WCAG 2.1 AA standards
- Minimum contrast ratio: 7:1 (AAA)
- Focus-visible states for keyboard navigation
- Semantic HTML with ARIA labels
- Respects `prefers-reduced-motion` for animations
- Touch targets: minimum 44×44px

---

## Support

For questions or custom variations:
- File structure: See `/assets` directory
- Stylesheet: See `styles.css`
- Implementation: See `index.html` and `/ui` components

---

**Version**: 1.0
**Last Updated**: November 2025
**Created for**: Samsung S10+ (412×869 portrait)
