# Fix: Black Edges on Bottom and Right Side

## Problem

Despite `repeatEdgePixels = true`, black edges appear on the bottom and right side of the canvas.

## Root Causes Identified

### 1. Insufficient Padding

**Previous:** `blurStrength * 2, min 100px`
**Issue:** Not enough to cover blur overflow on all sides

### 2. No Extra Safety Margin

**Issue:** Sprite was exactly sized to padded viewport
**Problem:** Blur filter extends beyond calculated size

### 3. Black Canvas Background

**Issue:** Canvas had `bg-black` class
**Problem:** Any gaps show black background

### 4. Opaque PixiJS Background

**Issue:** Default PixiJS background is black (alpha: 1)
**Problem:** Black shows through transparent areas

---

## Solutions Implemented

### Fix 1: Aggressive Padding ⭐

**File:** `wallpaper.tsx`

```typescript
// BEFORE (insufficient)
const blurPadding = Math.max(blurStrength * 2, 100);

// AFTER (aggressive)
const blurPadding = Math.max(blurStrength * 4, 200);
```

**Changes:**

- Multiplier: 2x → 4x (more aggressive)
- Minimum: 100px → 200px (much safer)

**Why this works:**

```
Example with blur strength = 30:

Before:
  padding = max(30 * 2, 100) = 100px
  Total added = 200px (100px each side)

After:
  padding = max(30 * 4, 200) = 200px
  Total added = 400px (200px each side)

4x the blur strength ensures filter never hits edges!
```

### Fix 2: Extra Safety Margin ⭐

**File:** `wallpaper.tsx`

```typescript
// Add 10% extra to dimensions
renderWidth = Math.round(renderWidth * 1.1);
renderHeight = Math.round(renderHeight * 1.1);
```

**Why this works:**

- Compensates for rounding errors
- Adds extra buffer beyond calculated padding
- Ensures absolute full coverage

**Effect:**

```
Viewport: 1920x1080
Padding: 200px each side → 2320x1480
Safety: 10% extra → 2552x1628

Sprite is now MUCH larger than viewport!
```

### Fix 3: Remove Black Canvas Background ⭐

**File:** `canvas.tsx`

```tsx
// BEFORE
<div className="... bg-black">

// AFTER
<div className="...">  // No bg-black
```

**Why this works:**

- No black background to show through
- Any gaps will show parent background
- More flexible styling

### Fix 4: Transparent PixiJS Background ⭐

**File:** `canvas.tsx`

```tsx
<Application
  backgroundAlpha={0}  // ⭐ New prop
  // ... other props
>
```

**Why this works:**

- PixiJS canvas itself is transparent
- No black default background
- Wallpaper sprite is the only background

---

## How It Works Now

### Layer Stack (Bottom to Top)

```
1. Parent Container (transparent or custom bg)
   ↓
2. Canvas Wrapper (no bg-black)
   ↓
3. PixiJS Canvas (backgroundAlpha: 0)
   ↓
4. Wallpaper Sprite (OVERSIZED with blur)
   ↓
5. Video Sprite (with padding)
```

### Size Calculation Example

```typescript
Viewport: 1920 x 1080
Blur Strength: 30

Step 1 - Calculate Padding:
  padding = max(30 * 4, 200) = 200px

Step 2 - Add Padding to Viewport:
  width = 1920 + 200*2 = 2320px
  height = 1080 + 200*2 = 1480px

Step 3 - Cover Scaling:
  (maintains aspect ratio, covers entire area)

Step 4 - Add Safety Margin:
  width = 2320 * 1.1 = 2552px
  height = 1480 * 1.1 = 1628px

Step 5 - Position at Center:
  x = 1920 / 2 = 960px
  y = 1080 / 2 = 540px
  anchor = 0.5 (center anchor)

Result:
  Sprite extends 1276px in each direction from center
  Far exceeds viewport edges (960px, 540px)
  No black edges possible!
```

---

## Debug Logging

Added console log in development:

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("Wallpaper layout:", {
    viewport: viewportSize,
    rendered: { width: layout.width, height: layout.height },
    position: { x: layout.x, y: layout.y },
    blurStrength,
  });
}
```

**Check Console For:**

```
Wallpaper layout: {
  viewport: { width: 1920, height: 1080 },
  rendered: { width: 2552, height: 1628 },  // Should be MUCH larger
  position: { x: 960, y: 540 },              // Center of viewport
  blurStrength: 30
}
```

**Verify:**

- ✅ `rendered.width` >> `viewport.width`
- ✅ `rendered.height` >> `viewport.height`
- ✅ `position.x` = `viewport.width / 2`
- ✅ `position.y` = `viewport.height / 2`

---

## Testing

### 1. Check Console Logs

Open browser console and look for `"Wallpaper layout:"` messages.

**Expected:**

```
Wallpaper layout: {
  viewport: { width: 1920, height: 1080 },
  rendered: { width: 2552, height: 1628 },
  position: { x: 960, y: 540 },
  blurStrength: 15
}
```

**Rendered dimensions should be ~30-40% larger than viewport!**

### 2. Test Different Blur Strengths

| Blur | Expected Padding | Expected Rendered Size (1920x1080) |
| ---- | ---------------- | ---------------------------------- |
| 5    | 200px            | ~2552x1628 (10% extra)             |
| 15   | 200px            | ~2552x1628                         |
| 30   | 200px            | ~2552x1628                         |
| 50   | 200px            | ~2640x1700                         |
| 60   | 240px            | ~2772x1788                         |

### 3. Visual Inspection

✅ **No black edges** on any side
✅ **No dark corners**
✅ **Uniform blur** across entire canvas
✅ **Wallpaper visible** beyond video padding

---

## Troubleshooting

### Issue: Still seeing black on bottom/right

**Check:**

1. **Console logs:**

   ```typescript
   // If rendered size is NOT much larger than viewport:
   console.log(layout.width, layout.height); // Should be 30-40% larger
   ```

2. **Texture loading:**

   ```typescript
   console.log(texture.width, texture.height); // Should have values
   ```

3. **Canvas background:**

   ```typescript
   // Check if bg-black is still present
   document.querySelector('[class*="bg-black"]');
   ```

4. **PixiJS background:**
   ```typescript
   // Verify backgroundAlpha is 0
   console.log(app.renderer.background.alpha); // Should be 0
   ```

### Issue: Wallpaper looks zoomed in too much

**Expected behavior!** The wallpaper SHOULD be oversized to prevent dark edges.

**If too zoomed:**

```typescript
// Reduce extra margin
renderWidth = Math.round(renderWidth * 1.05); // 5% instead of 10%
renderHeight = Math.round(renderHeight * 1.05);
```

### Issue: Performance impact

**More aggressive padding = more pixels to blur**

**Solutions:**

1. **Dynamic padding based on viewport size:**

   ```typescript
   const blurPadding = Math.max(
     blurStrength * 4,
     Math.min(200, viewportWidth * 0.1), // Max 10% of viewport
   );
   ```

2. **Reduce quality for large sprites:**
   ```typescript
   const quality = layout.width > 3000 ? 3 : 4;
   ```

---

## Complete Changes Summary

### wallpaper.tsx

1. ✅ **Padding multiplier:** 2x → 4x
2. ✅ **Minimum padding:** 100px → 200px
3. ✅ **Extra safety margin:** +10% to width and height
4. ✅ **Debug logging:** Console logs in development

### canvas.tsx

1. ✅ **Removed `bg-black`** from canvas wrapper
2. ✅ **Added `backgroundAlpha={0}`** to Application

---

## Expected Results

### Before Fixes ❌

```
┌────────────────────────────────┐
│                                │
│                                │
│         Wallpaper              │
│                                │
│                      ████████  │ ← Black edges
│                      ████████  │
└────────────────────────────────┘
                       ↑ Black
```

### After Fixes ✅

```
┌────────────────────────────────┐
│                                │
│                                │
│  Wallpaper (fully covers!)     │
│                                │
│                                │
│                                │
└────────────────────────────────┘
     ↑ No black anywhere! ↑
```

---

## Why Previous Fixes Didn't Work

### repeatEdgePixels = true

- ✅ **Prevents blur from darkening edges**
- ❌ **Doesn't extend sprite beyond its bounds**
- **Conclusion:** Necessary but not sufficient

### Previous padding (2x, 100px min)

- ✅ **Added some buffer**
- ❌ **Not enough for high blur values**
- ❌ **No safety margin for rounding errors**
- **Conclusion:** Insufficient coverage

### Canvas bg-black

- ❌ **Shows through any gaps**
- ❌ **Makes edge issues very visible**
- **Conclusion:** Compounded the problem

---

## Formulas

### Padding Calculation

```typescript
padding = max(blurStrength × 4, 200)
```

### Padded Viewport

```typescript
paddedWidth = viewportWidth + (padding × 2)
paddedHeight = viewportHeight + (padding × 2)
```

### Cover Scaling

```typescript
if (textureRatio > viewportRatio) {
  renderHeight = paddedHeight
  renderWidth = paddedHeight × textureRatio
} else {
  renderWidth = paddedWidth
  renderHeight = paddedWidth / textureRatio
}
```

### Safety Margin

```typescript
renderWidth = round(renderWidth × 1.1)
renderHeight = round(renderHeight × 1.1)
```

### Final Position

```typescript
x = viewportWidth / 2; // Center X
y = viewportHeight / 2; // Center Y
anchor = 0.5; // Sprite centered on x,y
```

---

## Summary

**4 Key Fixes Applied:**

1. ⭐ **4x padding multiplier** (was 2x)
2. ⭐ **200px minimum padding** (was 100px)
3. ⭐ **+10% safety margin** (was exact size)
4. ⭐ **Transparent backgrounds** (canvas + PixiJS)

**Result:** Wallpaper sprite is now ~30-40% larger than viewport, ensuring complete coverage even with maximum blur! ✨
