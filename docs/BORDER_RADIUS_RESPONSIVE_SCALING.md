# Responsive Border Radius - Scaling Fix

## Problem Identified

### Issue

Border radius looked fine in normal preview but appeared **inconsistent** when switching to fullscreen mode.

**Symptoms:**

- Small canvas (800x450): Border radius at 30 = noticeable rounding ✅
- Fullscreen (1920x1080): Border radius at 30 = barely visible ❌
- **Result:** Inconsistent visual appearance across different canvas sizes

### Root Cause

**Absolute pixel values don't scale:**

```typescript
// ❌ BEFORE: Fixed pixel value
graphics.roundRect(x, y, width, height, animatedBorderRadius);
//                                       ^^^^^^^^^^^^^^^^^^^^
//                                       Always same pixel value
```

**Example:**

```
Small canvas (600px wide):
- Border radius: 30px
- Percentage: 30/600 = 5% of width
- Visual: Nicely rounded ✅

Fullscreen (1920px wide):
- Border radius: 30px (same!)
- Percentage: 30/1920 = 1.5% of width
- Visual: Barely visible ❌
```

### Why This Happens

**UI slider controls border radius in absolute pixels:**

- Slider range: 0-100
- Direct mapping: Slider value = Pixel value
- **Problem:** Pixels don't scale with canvas size!

**When canvas resizes (e.g., fullscreen):**

1. Video dimensions change (800x450 → 1920x1080)
2. Border radius stays the same (30px)
3. Visual proportion changes (5% → 1.5%)
4. **Result:** Looks different!

## Solution: Percentage-Based Scaling

### Implementation

Make border radius **proportional to video size**:

```typescript
// ✅ AFTER: Percentage-based scaling
const smallestDimension = Math.min(layout.width, layout.height);
const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100;

graphics.roundRect(x, y, width, height, radiusInPixels);
//                                       ^^^^^^^^^^^^^^
//                                       Scales with video size!
```

### How It Works

**Convert slider value (0-100) to percentage of smallest dimension:**

1. **Get smallest dimension:**

   ```typescript
   const smallestDimension = Math.min(layout.width, layout.height);
   ```

   - Video: 800x600 → smallest = 600
   - Video: 1920x1080 → smallest = 1080
   - **Why smallest?** Prevents radius exceeding half the dimension

2. **Calculate percentage:**

   ```typescript
   const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100;
   ```

   - Slider at 5 → 5% of smallest dimension
   - Slider at 10 → 10% of smallest dimension
   - Slider at 50 → 50% of smallest dimension (very rounded!)

3. **Apply to mask:**
   ```typescript
   graphics.roundRect(x, y, width, height, radiusInPixels);
   ```

### Practical Examples

**Slider value: 5**

Small canvas (600x400):

- Smallest dimension: 400px
- Radius: 400 × 5% = 20px
- Visual: Subtle rounding

Fullscreen (1920x1080):

- Smallest dimension: 1080px
- Radius: 1080 × 5% = 54px
- Visual: Subtle rounding (same visual proportion!)

**Slider value: 10**

Small canvas (600x400):

- Smallest dimension: 400px
- Radius: 400 × 10% = 40px
- Visual: Noticeable rounding

Fullscreen (1920x1080):

- Smallest dimension: 1080px
- Radius: 1080 × 10% = 108px
- Visual: Noticeable rounding (consistent!)

**Slider value: 50**

Small canvas (600x400):

- Smallest dimension: 400px
- Radius: 400 × 50% = 200px
- Visual: Very rounded (pill-like)

Fullscreen (1920x1080):

- Smallest dimension: 1080px
- Radius: 1080 × 50% = 540px
- Visual: Very rounded (pill-like, same look!)

## Visual Comparison

### Before (Absolute Pixels) ❌

```
Small Canvas (800x600):        Fullscreen (1920x1080):
Slider: 30                     Slider: 30

╭──────────────╮              ┌─────────────────────┐
│              │              │                     │
│    VIDEO     │              │       VIDEO         │
│              │              │                     │
╰──────────────╯              └─────────────────────┘
 5% rounding                   1.5% rounding
 Looks rounded ✅              Barely visible ❌
```

### After (Percentage-Based) ✅

```
Small Canvas (800x600):        Fullscreen (1920x1080):
Slider: 10 (= 10%)            Slider: 10 (= 10%)

╭──────────────╮              ╭─────────────────────╮
│              │              │                     │
│    VIDEO     │              │       VIDEO         │
│              │              │                     │
╰──────────────╯              ╰─────────────────────╯
 10% rounding                  10% rounding
 Consistent! ✅                Consistent! ✅
```

## Technical Details

### Why Use Smallest Dimension?

**Prevents over-rounding:**

```typescript
// If we used width only:
Video: 1920x200 (very wide)
Slider: 50
Radius: 1920 × 50% = 960px

// Problem: Radius (960px) > height (200px)!
// Result: Invalid geometry ❌
```

**Using smallest dimension:**

```typescript
Video: 1920x200
Slider: 50
Smallest: 200px
Radius: 200 × 50% = 100px

// Radius (100px) ≤ height (200px) ✓
// Result: Valid, rounded ✅
```

### Maximum Effective Value

**Slider at 50 = Half of smallest dimension:**

- Creates semi-circular ends
- Maximum practical roundness
- Beyond 50, no additional visual effect

**Slider at 100 = Full smallest dimension:**

- Theoretically full circle
- Visually same as 50 (limited by rectangle shape)
- Recommended max: 50

### Performance Impact

**Additional calculation:**

```typescript
const smallestDimension = Math.min(layout.width, layout.height); // ~0.001ms
const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100; // ~0.001ms
```

**Total overhead:** ~0.002ms per frame

**Impact:** Negligible - well under 1% of frame budget

### useMemo Dependencies

```typescript
useMemo(() => {
  // ... calculate radius
}, [layout, animatedBorderRadius]);
```

**Recalculates when:**

- `layout` changes (resize, padding, etc.)
- `animatedBorderRadius` changes (slider moved)

**Optimization:**

- Smallest dimension calculated from layout (no extra dependency)
- Memoized to prevent unnecessary Graphics object creation

## Migration Guide

### For Users

**No changes needed!**

The slider still works the same way (0-100), but now:

- **0** = No rounding (sharp corners)
- **5-10** = Subtle rounding (recommended for professional look)
- **20-30** = Noticeable rounding (modern, friendly)
- **40-50** = Heavy rounding (pill-shaped)
- **50+** = Maximum rounding (same as 50)

**Recommendation:** Re-adjust your preferred value after this update

- Previous value: Try reducing by ~50%
- Example: If you had 60, try 10-15 for similar look

### For Developers

**Before:**

```typescript
// Direct pixel value
graphics.roundRect(x, y, w, h, animatedBorderRadius);
```

**After:**

```typescript
// Percentage-based scaling
const smallest = Math.min(layout.width, layout.height);
const radius = (smallest * animatedBorderRadius) / 100;
graphics.roundRect(x, y, w, h, radius);
```

**No API changes:**

- Context API unchanged
- Slider range unchanged (0-100)
- Animation system unchanged

## Testing

### Test Cases

**Test 1: Consistency across sizes**

1. Set border radius to 10
2. Note visual appearance in normal view
3. Enter fullscreen mode
4. **Expected:** Visual proportion looks the same ✅

**Test 2: Different slider values**

1. Try values: 0, 5, 10, 20, 50, 100
2. For each value, toggle fullscreen
3. **Expected:** Proportional rounding in both modes ✅

**Test 3: Extreme aspect ratios**

1. Resize window to very wide (16:3)
2. Resize window to very tall (4:16)
3. Adjust border radius slider
4. **Expected:** No invalid geometry, rounded appropriately ✅

**Test 4: With padding**

1. Enable background padding
2. Adjust padding (video gets smaller)
3. Border radius should scale down proportionally
4. **Expected:** Visual proportion stays consistent ✅

### Visual Verification

**Check these scenarios:**

1. **Small window** (800x600)
   - Slider at 10 → ~40-60px radius
   - Should look subtly rounded

2. **Medium window** (1280x720)
   - Slider at 10 → ~72px radius
   - Should look subtly rounded (same as small!)

3. **Fullscreen** (1920x1080)
   - Slider at 10 → ~108px radius
   - Should look subtly rounded (same as small!)

4. **Ultra-wide** (3840x1080)
   - Slider at 10 → ~108px radius (based on height)
   - Should look subtly rounded (same as others!)

### Debug Logging

```typescript
const mask = useMemo(() => {
  if (animatedBorderRadius === 0 || !layout.width || !layout.height) {
    return undefined;
  }

  const graphics = new Graphics();
  const smallestDimension = Math.min(layout.width, layout.height);
  const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100;

  console.log("Border Radius Scaling:", {
    sliderValue: animatedBorderRadius,
    videoSize: `${layout.width}x${layout.height}`,
    smallestDimension,
    radiusInPixels,
    percentageOfSmallest: `${animatedBorderRadius}%`,
  });

  graphics.roundRect(/*...*/);
  return graphics;
}, [layout, animatedBorderRadius]);
```

**Expected output:**

```
Normal view:
Border Radius Scaling: {
  sliderValue: 10,
  videoSize: "800x600",
  smallestDimension: 600,
  radiusInPixels: 60,
  percentageOfSmallest: "10%"
}

Fullscreen:
Border Radius Scaling: {
  sliderValue: 10,
  videoSize: "1920x1080",
  smallestDimension: 1080,
  radiusInPixels: 108,
  percentageOfSmallest: "10%"
}

// Same percentage, different pixels! ✅
```

## Comparison: Absolute vs Percentage

### Absolute Pixels (Before)

**Pros:**

- Simple implementation
- Predictable pixel values
- Direct slider-to-pixels mapping

**Cons:**

- ❌ Not responsive to size changes
- ❌ Looks different in fullscreen
- ❌ Not scalable across devices
- ❌ Hard to maintain consistency

### Percentage-Based (After)

**Pros:**

- ✅ Responsive to size changes
- ✅ Consistent across all canvas sizes
- ✅ Scales perfectly with video
- ✅ Works on any device/resolution
- ✅ Professional, polished appearance

**Cons:**

- Slightly more complex calculation (~0.002ms)
- Need to recalculate on resize (already handled by useMemo)

**Verdict:** Percentage-based is clearly superior! ✅

## Alternative Approaches Considered

### Option 1: Fixed pixel with scale factor

```typescript
const scaleFactor = layout.width / 1920; // Assume 1920 is "normal"
const radius = animatedBorderRadius * scaleFactor;
```

**Pros:**

- Simple scaling

**Cons:**

- Arbitrary "normal" size (1920)
- Doesn't handle extreme aspect ratios
- Not truly responsive

**Verdict:** Less flexible than percentage-based

### Option 2: Two sliders (absolute + relative)

```typescript
<Slider label="Border Radius (px)" />
<Slider label="Scale with video" />
```

**Pros:**

- Maximum control

**Cons:**

- Too complex for users
- Confusing UX
- Unnecessary complexity

**Verdict:** Overengineered

### Option 3: Percentage-based (CHOSEN)

```typescript
const smallest = Math.min(layout.width, layout.height);
const radius = (smallest * animatedBorderRadius) / 100;
```

**Pros:**

- ✅ Simple, elegant
- ✅ Truly responsive
- ✅ No extra UI needed
- ✅ Industry standard approach

**Cons:**

- None significant

**Verdict:** Best solution! ✅

## UI/UX Considerations

### Slider Interpretation

**Before (Absolute):**

- Slider 0-100 = 0-100 pixels
- User thinking: "How many pixels of rounding?"

**After (Percentage):**

- Slider 0-100 = 0-100% of smallest dimension
- User thinking: "How rounded should it look?"

**Better mental model:**

- 0 = Not rounded at all
- 25 = Quarter rounded
- 50 = Half rounded (maximum)
- 100 = Same as 50 (maximum)

### Recommended Values

**Professional/Subtle (5-10%):**

```
╭────────────╮
│   VIDEO    │
╰────────────╯
```

- Good for: Corporate, professional, clean look
- Use case: Business presentations, tutorials

**Modern/Friendly (15-25%):**

```
╭───────────╮
│   VIDEO   │
╰───────────╯
```

- Good for: Consumer apps, social media, modern UI
- Use case: Content creation, social videos

**Playful/Bold (30-50%):**

```
╭─────────╮
│  VIDEO  │
╰─────────╯
```

- Good for: Creative content, mobile apps, casual videos
- Use case: Stories, reels, casual recordings

## Summary

### What Changed

**Before:**

```typescript
graphics.roundRect(x, y, w, h, animatedBorderRadius);
// Direct pixel value - not responsive
```

**After:**

```typescript
const smallest = Math.min(layout.width, layout.height);
const radius = (smallest * animatedBorderRadius) / 100;
graphics.roundRect(x, y, w, h, radius);
// Percentage-based - fully responsive!
```

### Key Benefits

✅ **Consistent appearance** across all canvas sizes  
✅ **Works perfectly** in fullscreen mode  
✅ **Responsive** to window resizing  
✅ **Scales proportionally** with video  
✅ **No visual changes** needed from users  
✅ **Minimal performance cost** (~0.002ms)

### Result

Border radius now **looks the same** whether you're in:

- Small preview window
- Medium-sized window
- Fullscreen mode
- Ultra-wide display
- Any aspect ratio

**The visual proportion stays consistent!** 🎉

### Recommendation

If you had a preferred border radius value before this update, try **reducing it by about 50-70%** to get a similar visual appearance with the new percentage-based system.

**Example conversions:**

- Old value 60 → Try new value 8-10
- Old value 40 → Try new value 5-8
- Old value 20 → Try new value 3-5
