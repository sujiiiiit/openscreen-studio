# Background Wallpaper with Blur - Implementation Summary

## Overview
Successfully implemented a dynamic background wallpaper system with blur effects and padding controls for the PixiJS video canvas.

## Files Created

### 1. Context Layer
**`src/context/background-context.tsx`**
- Manages global state for background settings
- Provides: `enabled`, `wallpaperUrl`, `blurStrength`, `padding`
- Setters for all state values
- Default wallpaper: `ipad-17-dark.jpg`
- Default blur strength: 10
- Default padding: 10%

### 2. PixiJS Components

**`src/components/layout/pixi/wallpaper.tsx`**
- Renders wallpaper sprite as background layer
- Applies PixiJS `BlurFilter` with adjustable strength
- Scales wallpaper to cover entire viewport (like CSS `background-size: cover`)
- Uses centered anchor point (0.5, 0.5) for proper positioning
- Handles texture loading and cleanup

**`src/components/layout/pixi/composite.tsx`**
- Composite scene combining wallpaper and video
- Uses `<pixiContainer>` for proper layering:
  - Layer 0: Wallpaper (background)
  - Layer 1: Video (foreground)
- Clean component structure for easy maintenance

## Files Modified

### 1. Video Component
**`src/components/layout/pixi/video.tsx`**
- Added support for padding-based positioning
- Calculates available space after padding inset
- Maintains video aspect ratio within padded area
- Centers video using anchor point (0.5, 0.5)
- Respects background enabled state

**Changes:**
- Imported `useBackground` hook
- Modified `layout` calculation to include padding
- Added `anchor={0.5}` to sprite for center positioning

### 2. Canvas Component
**`src/components/layout/pixi/canvas.tsx`**
- Replaced `VideoTexture` with `CompositeScene`
- Maintains all existing functionality
- Now renders wallpaper + video composite

### 3. Background Tab UI
**`src/components/layout/tabs/bg/index.tsx`**
- Connected to `useBackground` context
- Blur slider updates `blurStrength` (0-100)
- Padding slider updates `padding` (0-100%)
- Toggle switch controls background enabled state
- Reset buttons restore default values

**`src/components/layout/tabs/bg/wallpaper.tsx`**
- Connected wallpaper selector to context
- Updates `wallpaperUrl` when selection changes
- Maintains sync between UI and context state

### 4. App Root
**`src/App.tsx`**
- Added `<BackgroundProvider>` wrapper
- Ensures context available throughout app
- Positioned after PlaybackProvider for proper hierarchy

## Features Implemented

### ✅ Wallpaper Background
- 16 wallpapers available in `/public/assets/background/`
- Dynamic loading with texture caching
- Automatic scaling to cover viewport
- Smooth texture cleanup on change

### ✅ Blur Effect
- PixiJS `BlurFilter` applied to wallpaper
- Adjustable strength (0-100) via slider
- Quality: 3 (good balance of performance/quality)
- Kernel size: 5 (smooth blur effect)
- Real-time updates as slider changes

### ✅ Padding Control
- Adjustable padding (0-100%) via slider
- Video scales to fit within padded area
- Maintains video aspect ratio
- Centers video in viewport
- Padding calculated as percentage of smallest viewport dimension

### ✅ Enable/Disable Toggle
- Switch to enable/disable background
- When disabled:
  - Wallpaper hidden
  - Padding set to 0
  - Video fills viewport (original behavior)

### ✅ State Management
- Centralized in BackgroundContext
- Reactive updates across all components
- Persistent during session
- Clean separation of concerns

## Technical Details

### PixiJS Implementation

**BlurFilter Configuration:**
```typescript
new BlurFilter({
  strength: blurStrength,  // 0-100
  quality: 3,              // 1-5
  kernelSize: 5           // 5, 7, 9, 11, 13, 15
})
```

**Wallpaper Scaling (Cover):**
```typescript
// Scale to cover entire viewport
const ratio = Math.max(
  viewportWidth / textureWidth,
  viewportHeight / textureHeight
);
```

**Video Scaling with Padding (Contain):**
```typescript
// Calculate available space
const paddingPx = (Math.min(viewportWidth, viewportHeight) * padding) / 100;
const availableWidth = viewportWidth - paddingPx * 2;
const availableHeight = viewportHeight - paddingPx * 2;

// Scale to fit within padded area
const ratio = Math.min(
  availableWidth / videoWidth,
  availableHeight / videoHeight
);
```

**Centering with Anchor:**
```typescript
sprite.anchor = 0.5;  // Center anchor point
sprite.position.x = viewportWidth / 2;
sprite.position.y = viewportHeight / 2;
```

### Component Hierarchy
```
App
└── BackgroundProvider
    └── PixiApp (canvas.tsx)
        └── Application
            └── CompositeScene
                ├── WallpaperSprite (background layer)
                └── VideoTexture (foreground layer with padding)
```

### State Flow
```
UI Controls (sliders/switch)
    ↓
BackgroundContext (state)
    ↓
PixiJS Components (rendering)
    ↓
Canvas (visual output)
```

## Performance Considerations

### Optimizations Implemented:
1. **Texture Caching**: Assets loaded once and cached
2. **Memoization**: Layout calculations memoized with useMemo
3. **Conditional Rendering**: Components skip rendering when disabled
4. **Filter Reuse**: BlurFilter instance reused, only strength updated
5. **Quality Settings**: Balanced blur quality (3) for smooth performance

### Performance Tips:
- For export, can increase blur quality to 4-5
- For real-time editing, quality 2-3 is sufficient
- Large images may take longer to load initially
- Consider debouncing slider updates for very smooth UX (optional)

## Testing Checklist

### ✅ Wallpaper Selection
- [x] Select different wallpapers
- [x] Verify texture loads correctly
- [x] Check scaling covers viewport
- [x] Confirm centered positioning

### ✅ Blur Control
- [x] Adjust blur slider (0-100)
- [x] Verify real-time blur updates
- [x] Test reset button
- [x] Check performance remains smooth

### ✅ Padding Control
- [x] Adjust padding slider (0-100)
- [x] Verify video insets correctly
- [x] Check aspect ratio maintained
- [x] Test reset button
- [x] Verify video stays centered

### ✅ Enable/Disable
- [x] Toggle background on/off
- [x] Verify wallpaper hides when off
- [x] Confirm padding disabled when off
- [x] Check video fills viewport when off

### ✅ Responsiveness
- [x] Resize viewport
- [x] Verify wallpaper rescales
- [x] Check video repositions
- [x] Confirm padding adjusts

## Future Enhancements (Optional)

### Possible Improvements:
1. **Upload Custom Wallpapers**: Allow users to upload their own images
2. **Gradient Backgrounds**: Add gradient options alongside wallpapers
3. **Animated Backgrounds**: Support video backgrounds
4. **Preset Combinations**: Save favorite wallpaper + blur + padding combos
5. **Per-Edge Padding**: Individual control for top/right/bottom/left padding
6. **Background Effects**: Additional filters (brightness, contrast, saturation)
7. **Export Settings**: Different settings for preview vs export

## Troubleshooting

### Issue: Wallpaper not showing
- Check BackgroundProvider is wrapping App
- Verify wallpaper files exist in `/public/assets/background/`
- Check browser console for texture loading errors

### Issue: Blur not working
- Ensure WebGL is supported (PixiJS requirement)
- Check blur strength > 0
- Verify filters applied to wallpaper sprite

### Issue: Video not respecting padding
- Check background enabled state
- Verify padding value in context
- Ensure composite scene is rendering both layers

## Resources

- [PixiJS v8 Documentation](https://pixijs.com/8.x)
- [BlurFilter API](https://pixijs.download/release/docs/filters.BlurFilter.html)
- [Sprite API](https://pixijs.download/release/docs/scene.Sprite.html)
- Implementation Guide: `/PIXIJS_IMPLEMENTATION_GUIDE.md`
