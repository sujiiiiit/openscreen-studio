# PixiJS Background & Blur Implementation Guide

## Overview
This guide explains how to implement a blurred wallpaper background with padding controls for the video canvas.

## PixiJS v8 Key Features Used

### 1. BlurFilter
```typescript
import { BlurFilter } from 'pixi.js';

const blurFilter = new BlurFilter({
  strength: 10,  // 0-100+ (controls blur intensity)
  quality: 4,    // 1-5 (higher = better quality but slower)
  kernelSize: 5  // 5, 7, 9, 11, 13, 15 (blur algorithm size)
});

sprite.filters = [blurFilter];
```

### 2. Sprite & Container
```typescript
import { Sprite, Container, Texture } from 'pixi.js';

// Create container for layering
const container = new Container();

// Background wallpaper
const wallpaper = Sprite.from('/path/to/image.jpg');
wallpaper.anchor.set(0.5); // Center anchor
wallpaper.filters = [blurFilter];

// Video sprite
const videoSprite = Sprite.from(videoTexture);
videoSprite.anchor.set(0.5); // Center anchor

container.addChild(wallpaper); // Back layer
container.addChild(videoSprite); // Front layer
```

### 3. Positioning with Padding
```typescript
// Calculate video position with padding
function applyPadding(videoSprite, viewportSize, paddingPercent) {
  const padding = (viewportSize.width * paddingPercent) / 100;
  const availableWidth = viewportSize.width - (padding * 2);
  const availableHeight = viewportSize.height - (padding * 2);
  
  // Scale video to fit within padded area
  const scale = Math.min(
    availableWidth / videoSprite.texture.width,
    availableHeight / videoSprite.texture.height
  );
  
  videoSprite.scale.set(scale);
  videoSprite.position.set(
    viewportSize.width / 2,
    viewportSize.height / 2
  );
}
```

## Implementation Structure

### File Structure
```
src/components/layout/pixi/
├── canvas.tsx          # Main PixiJS Application wrapper
├── video.tsx           # Video sprite component  
├── wallpaper.tsx       # NEW: Wallpaper background component
└── composite.tsx       # NEW: Composite scene with wallpaper + video
```

### Context for State Management
```typescript
// Background context to share state
interface BackgroundState {
  wallpaperUrl: string;
  blurStrength: number;
  padding: number;
  enabled: boolean;
}
```

## Step-by-Step Implementation

### Step 1: Create Wallpaper Component
The wallpaper component will:
- Load wallpaper texture from selected image
- Apply BlurFilter with adjustable strength
- Scale to cover entire viewport (like CSS `background-size: cover`)

### Step 2: Modify Video Component
The video component will:
- Accept padding value as prop
- Calculate inset based on padding percentage
- Maintain aspect ratio within padded area

### Step 3: Create Composite Scene
Combine wallpaper and video in a Container:
- Wallpaper as background layer (index 0)
- Video as foreground layer (index 1)
- Handle viewport changes and updates

### Step 4: Connect UI Controls
Link sliders to state:
- Background blur slider → BlurFilter.strength
- Padding slider → video inset calculation

## Performance Considerations

1. **Blur Quality vs Performance**:
   - Use `quality: 2-3` for real-time editing
   - Increase to `quality: 4-5` for export

2. **Texture Caching**:
   - Wallpapers loaded once and cached
   - Reuse textures when switching wallpapers

3. **Filter Updates**:
   - Update filter properties without recreating filter
   - Debounce slider changes for smooth performance

## Key PixiJS Concepts

### Filters
- Applied via `sprite.filters = [filter1, filter2]` array
- Processed in order (first to last)
- Can be updated dynamically by changing filter properties

### Anchor Point
- `anchor.set(0.5, 0.5)` centers sprite at its position
- Makes rotation and scaling more intuitive
- Default is `(0, 0)` (top-left corner)

### Scaling for "Cover" Effect
```typescript
function scaleToFill(sprite, width, height) {
  const ratio = Math.max(
    width / sprite.texture.width,
    height / sprite.texture.height
  );
  sprite.scale.set(ratio);
  sprite.position.set(width / 2, height / 2);
}
```

### Scaling for "Contain" Effect (with padding)
```typescript
function scaleToFit(sprite, width, height, padding) {
  const insetWidth = width - (padding * 2);
  const insetHeight = height - (padding * 2);
  const ratio = Math.min(
    insetWidth / sprite.texture.width,
    insetHeight / sprite.texture.height
  );
  sprite.scale.set(ratio);
  sprite.position.set(width / 2, height / 2);
}
```

## References

- [PixiJS v8 Filters Guide](https://pixijs.com/8.x/guides/components/filters)
- [PixiJS v8 Sprites Guide](https://pixijs.com/8.x/guides/basics/sprites)
- [PixiJS API - BlurFilter](https://pixijs.download/release/docs/filters.BlurFilter.html)
- [PixiJS API - Sprite](https://pixijs.download/release/docs/scene.Sprite.html)
- [PixiJS API - Container](https://pixijs.download/release/docs/scene.Container.html)
