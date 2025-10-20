# Image Optimization Guide - Placeholder vs High-Resolution

## Overview

The background wallpaper system uses a two-tier image approach for optimal performance:

1. **Placeholder Images** - Low-resolution thumbnails for UI previews
2. **High-Resolution Images** - Full-quality images for canvas rendering

---

## Directory Structure

```
public/
└── assets/
    ├── placeholder/          ← Low-res thumbnails for UI
    │   ├── ipad-17-dark.jpg
    │   ├── ipad-17-light.jpg
    │   ├── sequoia-blue-orange.jpg
    │   └── ... (all 16 wallpapers)
    │
    └── backgrounds/          ← High-res images for canvas
        ├── ipad-17-dark.jpg
        ├── ipad-17-light.jpg
        ├── sequoia-blue-orange.jpg
        └── ... (all 16 wallpapers)
```

---

## Image Usage

### 1. Placeholder Images (`/assets/placeholder/`)

**Used in:** Wallpaper selector UI (thumbnail grid)

**Purpose:**

- Fast loading for UI responsiveness
- Reduced memory usage when displaying all 16 thumbnails
- Better initial page load performance

**Recommended Specifications:**

- **Resolution:** 200x200px to 400x400px
- **File Size:** 10-50 KB per image
- **Quality:** 70-80% JPEG quality
- **Format:** JPEG (progressive)

**Code Location:**

```tsx
// src/components/layout/tabs/bg/wallpaper.tsx
style={{
  backgroundImage: `url(/assets/placeholder/${item.label}.jpg)`,
  // ... other styles
}}
```

### 2. High-Resolution Images (`/assets/backgrounds/`)

**Used in:** PixiJS canvas rendering (actual wallpaper display)

**Purpose:**

- Sharp, high-quality background on canvas
- Proper scaling for different screen sizes
- Professional appearance in recordings

**Recommended Specifications:**

- **Resolution:** 2560x1440px to 3840x2160px (match common display sizes)
- **File Size:** 500 KB - 2 MB per image
- **Quality:** 85-95% JPEG quality
- **Format:** JPEG (progressive) or WebP

**Code Location:**

```tsx
// src/components/layout/tabs/bg/wallpaper.tsx
const handleValueChange = (value: string) => {
  // ...
  setWallpaperUrl(`/assets/backgrounds/${wallpaper.label}.jpg`);
};

// src/context/background-context.tsx
const [wallpaperUrl, setWallpaperUrl] = useState(
  "/assets/backgrounds/ipad-17-dark.jpg",
);
```

---

## Performance Benefits

### Without Optimization (Single High-Res Set)

```
Initial Load: 16 images × 1.5 MB = 24 MB
UI Rendering: High memory usage for thumbnails
Page Load Time: Slow (3-5 seconds)
```

### With Optimization (Dual Image Set)

```
Initial Load: 16 images × 30 KB = 480 KB
Canvas Load: 1 image × 1.5 MB = 1.5 MB (on demand)
Page Load Time: Fast (<1 second)
Total Loaded: ~2 MB vs 24 MB
```

**Savings:** ~92% reduction in initial load

---

## Image Optimization Tips

### Creating Placeholder Images

**Using ImageMagick:**

```bash
# Convert high-res to placeholder (300x300px, 75% quality)
magick backgrounds/ipad-17-dark.jpg -resize 300x300^ -gravity center -extent 300x300 -quality 75 placeholder/ipad-17-dark.jpg
```

**Using Node.js (sharp):**

```javascript
const sharp = require("sharp");

sharp("backgrounds/ipad-17-dark.jpg")
  .resize(300, 300, { fit: "cover" })
  .jpeg({ quality: 75, progressive: true })
  .toFile("placeholder/ipad-17-dark.jpg");
```

**Batch Processing (PowerShell):**

```powershell
# Loop through all backgrounds and create placeholders
Get-ChildItem ".\public\assets\backgrounds\*.jpg" | ForEach-Object {
  $name = $_.Name
  magick $_.FullName -resize 300x300^ -gravity center -extent 300x300 -quality 75 ".\public\assets\placeholder\$name"
}
```

### Optimizing High-Resolution Images

**Target Resolutions by Use Case:**

- **1080p Recording:** 1920x1080px backgrounds
- **1440p Recording:** 2560x1440px backgrounds
- **4K Recording:** 3840x2160px backgrounds
- **Universal:** 2560x1440px (good middle ground)

**Compression Settings:**

```bash
# Progressive JPEG with 85% quality
magick input.jpg -quality 85 -interlace Plane output.jpg

# WebP format (better compression)
magick input.jpg -quality 90 output.webp
```

---

## Implementation Details

### How It Works

1. **UI Load:**
   - User opens background tab
   - Wallpaper selector displays 16 thumbnails
   - Thumbnails loaded from `/assets/placeholder/`
   - Fast, lightweight, responsive UI

2. **Selection:**
   - User clicks a wallpaper thumbnail
   - `handleValueChange()` called with wallpaper label
   - `setWallpaperUrl()` updates context with HIGH-RES path

3. **Canvas Render:**
   - `WallpaperSprite` component receives high-res URL
   - PixiJS `Assets.load()` fetches from `/assets/backgrounds/`
   - High-quality image rendered on canvas
   - Blur filter applied

### Code Flow

```
User clicks thumbnail
        ↓
wallpaper.tsx → handleValueChange()
        ↓
setWallpaperUrl(`/assets/backgrounds/${label}.jpg`)
        ↓
BackgroundContext updates
        ↓
WallpaperSprite receives new URL
        ↓
PixiJS Assets.load(highResURL)
        ↓
Canvas renders sharp wallpaper
```

---

## File Naming Convention

**Both directories must have matching filenames:**

```
placeholder/ipad-17-dark.jpg  ←→  backgrounds/ipad-17-dark.jpg
placeholder/sonoma-clouds.jpg ←→  backgrounds/sonoma-clouds.jpg
```

**Wallpaper Configuration:**

```typescript
const wallpapers = [
  { value: "1", label: "ipad-17-dark" }, // label used in both paths
  { value: "2", label: "ipad-17-light" },
  // ... more wallpapers
];
```

---

## Adding New Wallpapers

### Step 1: Prepare High-Resolution Image

```bash
# Ensure proper dimensions and quality
magick new-wallpaper-source.jpg -resize 2560x1440^ -gravity center -extent 2560x1440 -quality 90 backgrounds/new-wallpaper.jpg
```

### Step 2: Create Placeholder

```bash
magick backgrounds/new-wallpaper.jpg -resize 300x300^ -gravity center -extent 300x300 -quality 75 placeholder/new-wallpaper.jpg
```

### Step 3: Update Configuration

```typescript
// src/components/layout/tabs/bg/wallpaper.tsx
const wallpapers = [
  // ... existing wallpapers
  { value: "17", label: "new-wallpaper" },
];
```

### Step 4: Verify Naming

- `backgrounds/new-wallpaper.jpg` ✅
- `placeholder/new-wallpaper.jpg` ✅
- Label in config: `"new-wallpaper"` ✅

---

## Browser Caching

### Cache Headers (Recommended)

Add to `electron/core/window-manager.ts` or web server config:

```typescript
// Cache images for 1 week
if (
  url.includes("/assets/backgrounds/") ||
  url.includes("/assets/placeholder/")
) {
  response.headers.push({
    name: "Cache-Control",
    value: "public, max-age=604800, immutable",
  });
}
```

### Benefits:

- Placeholder images cached on first visit
- High-res images cached per wallpaper selection
- Faster subsequent loads
- Reduced bandwidth usage

---

## Troubleshooting

### Issue: Placeholder shows instead of high-res on canvas

**Cause:** URL path mismatch

**Fix:**

```typescript
// Check wallpaper.tsx handleValueChange()
setWallpaperUrl(`/assets/backgrounds/${wallpaper.label}.jpg`); // ✅ Correct
setWallpaperUrl(`/assets/placeholder/${wallpaper.label}.jpg`); // ❌ Wrong
```

### Issue: Thumbnail not loading in UI

**Cause:** Missing placeholder file

**Fix:**

1. Check file exists: `public/assets/placeholder/[name].jpg`
2. Verify filename matches label in config
3. Check file permissions

### Issue: High-res image not loading on canvas

**Cause:** Missing background file or CSP blocking

**Fix:**

1. Check file exists: `public/assets/backgrounds/[name].jpg`
2. Verify CSP allows image loading (see `CSP_CONFIGURATION.md`)
3. Check browser console for errors

### Issue: Blurry canvas even with high-res images

**Cause:** Image resolution too low or PixiJS scaling

**Fix:**

1. Ensure backgrounds are at least 2560x1440px
2. Check PixiJS renderer resolution settings
3. Verify canvas size matches display

---

## Future Enhancements

### Progressive Loading

```typescript
// Load placeholder first, then swap to high-res
const [currentTexture, setCurrentTexture] = useState(placeholderURL);

useEffect(() => {
  // Show placeholder immediately
  Assets.load(placeholderURL).then(() => setCurrentTexture(placeholderURL));

  // Load high-res in background
  Assets.load(highResURL).then(() => setCurrentTexture(highResURL));
}, [wallpaperUrl]);
```

### WebP Support

```typescript
// Detect WebP support and use better format
const format = supportsWebP ? "webp" : "jpg";
setWallpaperUrl(`/assets/backgrounds/${label}.${format}`);
```

### Lazy Loading

```typescript
// Only load high-res when background tab is active
if (enabled && isBackgroundTabActive) {
  loadHighResWallpaper();
}
```

### Custom Upload

```typescript
// Allow users to upload their own wallpapers
const handleCustomUpload = async (file: File) => {
  // Resize to placeholder
  const placeholder = await resizeImage(file, 300, 300, 75);

  // Keep original as high-res
  const highRes = await resizeImage(file, 2560, 1440, 90);

  // Save both versions
  saveToLocal("placeholder", placeholder);
  saveToLocal("backgrounds", highRes);
};
```

---

## Summary

✅ **Placeholder images** (`/assets/placeholder/`):

- Small, fast-loading thumbnails
- Used in wallpaper selector UI
- 200-400px, 10-50 KB each

✅ **High-resolution images** (`/assets/backgrounds/`):

- Sharp, high-quality backgrounds
- Used in PixiJS canvas rendering
- 2560x1440px+, 500KB-2MB each

✅ **Performance gain:**

- 92% reduction in initial load size
- Faster UI responsiveness
- Professional canvas quality
- Best of both worlds

---

## Related Documentation

- [BACKGROUND_IMPLEMENTATION.md](./BACKGROUND_IMPLEMENTATION.md) - Technical implementation
- [BACKGROUND_SETTINGS_GUIDE.md](./BACKGROUND_SETTINGS_GUIDE.md) - Blur and padding settings
- [CSP_CONFIGURATION.md](./CSP_CONFIGURATION.md) - Content Security Policy
- [PIXIJS_IMPLEMENTATION_GUIDE.md](../PIXIJS_IMPLEMENTATION_GUIDE.md) - PixiJS integration
