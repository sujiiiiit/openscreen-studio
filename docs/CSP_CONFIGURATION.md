# Content Security Policy (CSP) Configuration

## Issue Resolution

### Problem

PixiJS Assets loader was being blocked by Content Security Policy when trying to use Web Workers for image loading:

```
Refused to create a worker from 'blob:...' because it violates the following
Content Security Policy directive: "script-src 'self' 'unsafe-inline'".
```

### Root Cause

PixiJS v8 uses Web Workers (via blob URLs) for efficient image loading and processing. The default CSP configuration was blocking:

1. **Blob URLs** for worker scripts
2. **Worker creation** from blob sources
3. **Image loading** from blob URLs

## Solution Implemented

### 1. HTML Meta Tag CSP (index.html)

Updated the Content Security Policy in `index.html` to allow:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' blob:; 
           worker-src 'self' blob:; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: blob:; 
           font-src 'self'; 
           connect-src 'self' ws: wss: https://huggingface.co; 
           media-src 'self' blob: data:;"
/>
```

**Key Changes:**

- `script-src`: Added `blob:` to allow blob URL scripts
- `worker-src`: Added directive with `'self' blob:` to allow workers
- `img-src`: Added `blob:` for blob URL images

### 2. Electron CSP Headers (window-manager.ts)

Added CSP headers via Electron's webRequest API:

```typescript
this.mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: file:; font-src 'self'; connect-src 'self' ws: wss: https://huggingface.co; media-src 'self' blob: data: file:;",
        ],
      },
    });
  },
);
```

**Additional Electron Features:**

- `file:` protocol support for local file access
- Consistent with HTML CSP policy
- Applied to all responses in the Electron window

### 3. Improved Error Handling (wallpaper.tsx)

Enhanced the wallpaper component with better error handling:

```typescript
// Check cache before loading
if (Assets.cache.has(wallpaperUrl)) {
  const cached = Assets.cache.get(wallpaperUrl);
  // Use cached texture
}

// Better error handling
try {
  const loaded = await Assets.load<Texture>(wallpaperUrl);
  setTexture(loaded);
} catch (error) {
  console.error("Failed to load wallpaper", error);
  setTexture(Texture.EMPTY); // Graceful fallback
}
```

**Improvements:**

- Texture caching to avoid reloading
- Graceful fallback to empty texture on error
- Better cleanup on unmount
- Detailed error logging

## CSP Directive Explanations

### `default-src 'self'`

Base policy: Only allow resources from same origin

### `script-src 'self' 'unsafe-inline' blob:`

- `'self'`: Scripts from same origin
- `'unsafe-inline'`: Inline `<script>` tags (required for Vite HMR)
- `blob:`: Blob URL scripts (required for Web Workers)

### `worker-src 'self' blob:`

- `'self'`: Workers from same origin
- `blob:`: Workers from blob URLs (PixiJS requirement)

### `img-src 'self' data: blob: file:`

- `'self'`: Images from same origin
- `data:`: Data URLs for images
- `blob:`: Blob URL images (canvas exports, processed images)
- `file:`: Local file system (Electron only)

### `media-src 'self' blob: data: file:`

- `'self'`: Media from same origin
- `blob:`: Blob URL media (video recordings)
- `data:`: Data URL media
- `file:`: Local media files (Electron only)

### `connect-src 'self' ws: wss: https://huggingface.co`

- `'self'`: API calls to same origin
- `ws:` / `wss:`: WebSocket connections (HMR, live reload)
- `https://huggingface.co`: External API for transcription

## Security Considerations

### Why These Relaxations Are Safe

1. **`blob:` URLs are ephemeral**
   - Created by the application itself
   - Not persistent across sessions
   - Cannot be manipulated by external sources

2. **Workers are sandboxed**
   - Web Workers run in isolated contexts
   - No access to DOM or window object
   - Limited to message passing

3. **Blob images are generated internally**
   - Created from canvas operations
   - Result of PixiJS texture processing
   - Not loaded from external sources

### What Still Remains Protected

1. **No `unsafe-eval`**: Prevents dynamic code execution
2. **No wildcard sources**: All sources explicitly listed
3. **No external scripts**: Only same-origin scripts allowed
4. **Limited external connections**: Only specific domains allowed

## Testing CSP Configuration

### Verify Worker Support

```javascript
// In browser console
const blob = new Blob(['console.log("Worker works!")']);
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
// Should not throw CSP error
```

### Verify PixiJS Loading

```javascript
// Check if PixiJS can load textures
import { Assets } from "pixi.js";
await Assets.load("/assets/background/test.jpg");
// Should load without CSP errors
```

### Common CSP Violations to Watch For

1. **Inline event handlers**: Avoid `onclick="..."` in HTML
2. **Inline styles**: Use CSS classes instead (or keep `'unsafe-inline'`)
3. **External CDNs**: Must be explicitly added to CSP
4. **Dynamic script loading**: Consider using import() instead

## Troubleshooting

### If Workers Still Blocked

1. Check browser console for specific CSP violation
2. Verify `worker-src` directive is present
3. Ensure `blob:` is in both `script-src` and `worker-src`
4. Clear browser cache and reload

### If Images Not Loading

1. Verify `blob:` in `img-src` directive
2. Check image file exists in correct location
3. Verify file permissions (Electron)
4. Check network tab for 404 errors

### If Electron-Specific Issues

1. Ensure CSP headers are set before loading content
2. Check `webRequest.onHeadersReceived` is firing
3. Verify file:// protocol support for local files
4. Check Electron security warnings in console

## Future Improvements

### Considerations for Production

1. **Stricter CSP for production**:

   ```typescript
   const isDev = process.env.NODE_ENV === "development";
   const csp = isDev
     ? devCSP // With 'unsafe-inline'
     : prodCSP; // Stricter policy
   ```

2. **Nonce-based inline scripts**:
   - Generate unique nonce per request
   - Add to script tags: `<script nonce="random">`
   - Add to CSP: `script-src 'nonce-random'`

3. **Hash-based inline scripts**:
   - Calculate SHA256 of inline scripts
   - Add to CSP: `script-src 'sha256-hash'`

4. **Report-only mode for testing**:
   ```html
   <meta http-equiv="Content-Security-Policy-Report-Only" content="..." />
   ```

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [PixiJS v8 Assets Documentation](https://pixijs.com/8.x/guides/basics/assets)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Electron Security Guide](https://www.electronjs.org/docs/latest/tutorial/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
