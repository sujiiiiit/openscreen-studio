# PixiJS Blur Property Reference

## Example Code Analysis

### Provided Example (PixiJS Official)

```typescript
// Official PixiJS example from documentation
const blurFilter1 = new BlurFilter();
const blurFilter2 = new BlurFilter();

littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

// Animating blur
app.ticker.add(() => {
  count += 0.005;
  const blurAmount = Math.cos(count);
  const blurAmount2 = Math.sin(count);

  blurFilter1.blur = 20 * blurAmount; // ⚠️ Using deprecated property
  blurFilter2.blur = 20 * blurAmount2;
});
```

### Our Current Implementation (Modern) ✅

```typescript
const blurFilter = useMemo(() => {
  const filter = new BlurFilter({
    strength: blurStrength, // ✅ Modern, non-deprecated
    quality: 4,
    kernelSize: 5,
  });

  filter.repeatEdgePixels = true; // ✅ Prevents dark edges

  return filter;
}, [blurStrength]);
```

---

## Property Comparison

### `blur` Property (Deprecated)

**Status:** ⚠️ Deprecated since PixiJS v8.3.0

```typescript
// Old way (from example)
filter.blur = 20;
```

**Documentation:**

```
@deprecated since 8.3.0
@see BlurFilter.strength
```

**Equivalent to:**

```typescript
filter.strength = 20; // Same effect
```

### `strength` Property (Current) ✅

**Status:** ✅ Current, recommended

```typescript
// Modern way (our implementation)
filter.strength = 20;
```

**Documentation:**

```
Sets the strength of both the blurX and blurY properties simultaneously.
Controls the overall intensity of the Gaussian blur effect.
@default 8
```

---

## Key Differences: Example vs Our Implementation

### 1. Property Name

| Example | Our Implementation | Status               |
| ------- | ------------------ | -------------------- |
| `blur`  | `strength`         | ✅ We use modern API |

### 2. Edge Handling

**Example:**

```typescript
const blurFilter = new BlurFilter();
// No edge handling - will have dark corners on solid backgrounds
```

**Our Implementation:**

```typescript
const filter = new BlurFilter({
  /* options */
});
filter.repeatEdgePixels = true; // ⭐ Critical for backdrop effect
```

### 3. Quality Settings

**Example:**

```typescript
new BlurFilter(); // Uses defaults (quality: 4, kernelSize: 5)
```

**Our Implementation:**

```typescript
new BlurFilter({
  quality: 4, // Explicit (same as default)
  kernelSize: 5, // Explicit (same as default)
});
```

### 4. Use Case

**Example:**

- Blurring sprites with transparent backgrounds
- Animated blur effects
- Overlaying images with depth-of-field

**Our Implementation:**

- Wallpaper backdrop blur
- Solid backgrounds (requires repeatEdgePixels)
- Static or user-controlled blur strength
- CSS backdrop-filter equivalent

---

## Should We Adopt Anything from the Example?

### ✅ Already Using Best Practices

1. **Modern API:** We use `strength` not deprecated `blur`
2. **Edge handling:** We have `repeatEdgePixels = true`
3. **Proper configuration:** Explicit quality and kernelSize
4. **Memoization:** Using `useMemo` for performance

### ❌ What We DON'T Need from Example

1. **`blur` property** - Deprecated, we use `strength` ✅
2. **Multiple filters** - We only need one for wallpaper ✅
3. **Animation ticker** - We have reactive state ✅
4. **Sprite positioning** - We have proper layout calculation ✅

---

## Verification: API Compatibility

### Property Mapping

```typescript
// Example uses (deprecated):
filter.blur = 20;

// Internally converts to:
filter.strength = 20;

// We directly use (correct):
filter.strength = 20;
```

### Both Are Valid

```typescript
// Option 1: Deprecated but still works
const filter = new BlurFilter();
filter.blur = 20; // Works, but deprecated

// Option 2: Modern (our approach) ✅
const filter = new BlurFilter({ strength: 20 });
```

---

## Conclusion

### Our Implementation Status: ✅ OPTIMAL

**Reasons:**

1. ✅ **Uses modern `strength` property** (not deprecated `blur`)
2. ✅ **Includes `repeatEdgePixels = true`** (critical for backdrop effect)
3. ✅ **Explicit quality settings** (4, 5) for CSS-like blur
4. ✅ **Proper padding calculation** (extends beyond viewport)
5. ✅ **React-optimized** (useMemo, reactive updates)

### No Changes Needed

The example provided is:

- Using **older deprecated API** (`blur` property)
- Missing **edge handling** (no `repeatEdgePixels`)
- For **different use case** (transparent sprites, not backdrop)

**Our implementation is MORE modern and appropriate!** 🎉

---

## Reference Comparison Table

| Feature               | PixiJS Example      | Our Implementation  | Winner |
| --------------------- | ------------------- | ------------------- | ------ |
| **API Version**       | Deprecated (`blur`) | Modern (`strength`) | ✅ Us  |
| **Edge Handling**     | None                | `repeatEdgePixels`  | ✅ Us  |
| **Configuration**     | Defaults            | Explicit settings   | ✅ Us  |
| **Padding**           | None                | Dynamic padding     | ✅ Us  |
| **Use Case**          | Sprite effects      | Backdrop filter     | ✅ Us  |
| **React Integration** | N/A                 | Optimized (useMemo) | ✅ Us  |

---

## If We Were to Use Example Pattern

**Hypothetical adaptation (NOT RECOMMENDED):**

```typescript
// ❌ Using deprecated API like example
const blurFilter = useMemo(() => {
  const filter = new BlurFilter();
  filter.blur = blurStrength; // ⚠️ Deprecated
  return filter;
}, [blurStrength]);

// ✅ Our current approach is better:
const blurFilter = useMemo(() => {
  const filter = new BlurFilter({
    strength: blurStrength, // Modern
    quality: 4,
    kernelSize: 5,
  });
  filter.repeatEdgePixels = true;
  return filter;
}, [blurStrength]);
```

---

## Final Recommendation

### ✅ KEEP CURRENT IMPLEMENTATION

**Do NOT adopt from the example because:**

1. Example uses **deprecated property** (`blur`)
2. Example lacks **edge clamping** (causes dark corners)
3. Example is for **different use case** (transparent sprites)
4. Our implementation is **already optimal** for backdrop blur

### Documentation Reference

**PixiJS v8.3.0+ Deprecation Notice:**

```typescript
/**
 * @deprecated since 8.3.0
 * @see BlurFilter.strength
 */
get blur(): number;
set blur(value: number);
```

**Modern API (what we use):**

```typescript
/**
 * Sets the strength of both the blurX and blurY properties simultaneously.
 * @default 8
 */
get strength(): number;
set strength(value: number);
```

---

## Summary

✅ **Our implementation is CORRECT and MODERN**
✅ **No changes needed**
✅ **Example uses deprecated API**
✅ **Our approach is superior for backdrop blur use case**

**Conclusion:** The example confirms our API usage is valid, but we're already using the better, modern approach! 🎉
