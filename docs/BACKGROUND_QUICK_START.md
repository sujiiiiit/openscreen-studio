# Quick Start Guide - Background Wallpaper Feature

## How It Works

```
┌─────────────────────────────────────────┐
│     PixiJS Canvas (Viewport)            │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │   Wallpaper (Blurred)             │  │
│  │   ┌────────────────────────┐      │  │
│  │   │                        │      │  │
│  │   │   Video (Centered)     │      │  │
│  │   │   with Padding         │      │  │
│  │   │                        │      │  │
│  │   └────────────────────────┘      │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↖ Padding        Padding ↗
```

## Using the Feature

### 1. Enable/Disable Background
- Use the toggle switch in the Background tab
- When **ON**: Wallpaper shows with blur and padding
- When **OFF**: Video fills entire canvas (original behavior)

### 2. Select Wallpaper
- Choose from 16 pre-loaded wallpapers
- Click on any wallpaper thumbnail
- Selected wallpaper shows checkmark
- Click arrow button to expand/collapse full list

### 3. Adjust Blur
- **Blur Slider**: 0 (no blur) → 100 (maximum blur)
- **Default**: 10
- **Reset Button**: Returns to default value
- **Effect**: Makes wallpaper more/less focused

### 4. Adjust Padding
- **Padding Slider**: 0% (no padding) → 100% (maximum inset)
- **Default**: 10%
- **Reset Button**: Returns to default value
- **Effect**: Creates space between video and viewport edges

## Recommended Settings

### For Clean Look
- Wallpaper: Dark solid colors (sonoma-dark, tahoe-dark)
- Blur: 20-30
- Padding: 15-20%

### For Artistic Effect
- Wallpaper: Colorful scenes (sequoia-blue-orange, sonoma-clouds)
- Blur: 40-60
- Padding: 10-15%

### For Subtle Background
- Wallpaper: Light tones (sonoma-light, ventura)
- Blur: 50-80
- Padding: 5-10%

### For Focus on Video
- Wallpaper: Any
- Blur: 80-100
- Padding: 20-30%

## Technical Notes

### Performance
- All wallpapers are optimized images
- Blur filter uses GPU acceleration
- Real-time updates with smooth performance
- Quality/performance balanced automatically

### Responsive
- Wallpaper always covers entire canvas
- Video always centered with padding
- Automatically adjusts to window resize
- Maintains aspect ratios

## Keyboard Shortcuts (Future)
```
[ ] Toggle Background: Ctrl+B
[ ] Cycle Wallpapers: Ctrl+W
[ ] Reset Blur: Ctrl+Shift+B
[ ] Reset Padding: Ctrl+Shift+P
```

## Tips

1. **Preview Before Export**: Test different settings to find your style
2. **Match Video Content**: Choose wallpaper colors that complement your video
3. **Consider Contrast**: Ensure video remains focal point
4. **Experiment**: Try different blur + padding combinations
5. **Less is More**: Subtle effects often look more professional

## Common Use Cases

### Professional Recording
- Wallpaper: sonoma-dark / tahoe-dark
- Blur: 30
- Padding: 15%

### Tutorial/Educational
- Wallpaper: ventura / sonoma-light  
- Blur: 50
- Padding: 20%

### Creative/Artistic
- Wallpaper: sequoia-blue-orange
- Blur: 40
- Padding: 10%

### Presentation
- Wallpaper: ipad-17-dark
- Blur: 60
- Padding: 25%
