import { Assets, BlurFilter, Texture } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";

import { useBackground } from "@/context/background-context";

type WallpaperSpriteProps = {
  viewportSize: { width: number; height: number };
};

export default function WallpaperSprite({
  viewportSize,
}: WallpaperSpriteProps) {
  const spriteRef = useRef(null);
  const [texture, setTexture] = useState(Texture.EMPTY);
  const {
    wallpaperUrl,
    blurStrength,
    enabled,
    backgroundColor,
    backgroundMode,
  } = useBackground();

  // Animated blur strength for smooth transitions
  const [animatedBlur, setAnimatedBlur] = useState(blurStrength);
  const targetBlurRef = useRef(blurStrength);

  // Smooth blur animation using requestAnimationFrame
  useEffect(() => {
    targetBlurRef.current = blurStrength;

    let animationFrame: number;
    const animate = () => {
      setAnimatedBlur((current) => {
        const target = targetBlurRef.current;
        const diff = target - current;

        // Smooth interpolation (ease out)
        if (Math.abs(diff) < 0.1) {
          return target;
        }

        return current + diff * 0.15; // 15% towards target each frame
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [blurStrength]);

  // Load wallpaper texture
  useEffect(() => {
    if (!enabled || !wallpaperUrl) {
      setTexture(Texture.EMPTY);
      return;
    }

    let disposed = false;
    let currentUrl: string | null = null;

    const loadTexture = async () => {
      try {
        // Check if already cached to avoid reloading
        if (Assets.cache.has(wallpaperUrl)) {
          const cached = Assets.cache.get(wallpaperUrl);
          if (!disposed) {
            currentUrl = wallpaperUrl;
            setTexture(cached);
          }
          return;
        }

        // Load new texture
        const loaded = await Assets.load<Texture>(wallpaperUrl);
        if (disposed) {
          return;
        }
        currentUrl = wallpaperUrl;
        setTexture(loaded);
        console.log(`Successfully loaded wallpaper: ${wallpaperUrl}`);
      } catch (error) {
        console.error(
          `Failed to load wallpaper texture from ${wallpaperUrl}`,
          error,
        );
        // Set empty texture on error instead of crashing
        if (!disposed) {
          setTexture(Texture.EMPTY);
        }
      }
    };

    void loadTexture();

    return () => {
      disposed = true;
      // Note: We keep textures cached for reuse, only unload on unmount
      if (currentUrl && !Assets.cache.has(currentUrl)) {
        void Assets.unload(currentUrl).catch(() => {
          // Ignore unload errors
        });
      }
      setTexture(Texture.EMPTY);
    };
  }, [wallpaperUrl, enabled]);

  // Create blur filter with adjustable strength
  // CSS backdrop-filter style: uniform blur without edges
  const blurFilter = useMemo(() => {
    const filter = new BlurFilter({
      strength: animatedBlur, // Use animated value
      quality: 4, // Balanced quality (default: 4)
      kernelSize: 5, // Standard kernel for uniform blur
    });

    // IMPORTANT: Don't use repeatEdgePixels - it causes bright edge halos
    // Instead, we extend the sprite size to cover the blur overflow
    filter.repeatEdgePixels = false;

    // Set padding to account for blur spread
    // This tells PixiJS how much extra space the filter needs
    filter.padding = animatedBlur * 2;

    return filter;
  }, [animatedBlur]);

  // Calculate layout to fill entire viewport (like CSS background-size: cover)
  // Extended to account for blur padding and prevent dark edges
  const layout = useMemo(() => {
    const width = texture.width || texture.baseTexture?.width || 0;
    const height = texture.height || texture.baseTexture?.height || 0;
    const { width: viewportWidth, height: viewportHeight } = viewportSize;

    if (!width || !height || !viewportWidth || !viewportHeight) {
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      };
    }

    // Add EXTRA padding to extend wallpaper well beyond viewport edges
    // This ensures blur filter never samples from outside the sprite
    // Match the filter's padding requirements
    const blurPadding = animatedBlur * 2 + 50; // Use animated blur
    const paddedViewportWidth = viewportWidth + blurPadding * 2;
    const paddedViewportHeight = viewportHeight + blurPadding * 2;

    // Scale to cover entire padded viewport (like CSS backdrop-filter behavior)
    const textureRatio = width / height;
    const viewportRatio = paddedViewportWidth / paddedViewportHeight;

    let renderWidth: number;
    let renderHeight: number;

    if (textureRatio > viewportRatio) {
      // Texture is wider than viewport - match height and overflow width
      renderHeight = paddedViewportHeight;
      renderWidth = paddedViewportHeight * textureRatio;
    } else {
      // Texture is taller than viewport - match width and overflow height
      renderWidth = paddedViewportWidth;
      renderHeight = paddedViewportWidth / textureRatio;
    }

    // Round to ensure pixel-perfect rendering
    renderWidth = Math.round(renderWidth);
    renderHeight = Math.round(renderHeight);

    // Center the wallpaper - use anchor 0.5 so x,y is center point
    const offsetX = Math.round(viewportWidth / 2);
    const offsetY = Math.round(viewportHeight / 2);

    return {
      width: renderWidth,
      height: renderHeight,
      x: offsetX,
      y: offsetY,
      scaleX: renderWidth / width,
      scaleY: renderHeight / height,
    };
  }, [texture, viewportSize, animatedBlur]);

  if (!enabled || texture === Texture.EMPTY) {
    return null;
  }

  // If in color mode, render solid color instead of wallpaper
  if (backgroundMode === "color" && backgroundColor) {
    // Convert hex to RGB integer for PixiJS
    const hexToRgb = (hex: string): number => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return 0x000000;
      return (
        parseInt(result[1], 16) * 65536 +
        parseInt(result[2], 16) * 256 +
        parseInt(result[3], 16)
      );
    };

    return (
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.beginFill(hexToRgb(backgroundColor));
          g.drawRect(0, 0, viewportSize.width, viewportSize.height);
          g.endFill();
        }}
      />
    );
  }

  // Debug: Log layout to verify coverage
  if (process.env.NODE_ENV === "development") {
    console.log("Wallpaper layout:", {
      viewport: viewportSize,
      rendered: { width: layout.width, height: layout.height },
      position: { x: layout.x, y: layout.y },
      blurStrength,
    });
  }

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      width={layout.width}
      height={layout.height}
      x={layout.x}
      y={layout.y}
      anchor={0.5}
      filters={[blurFilter]}
    />
  );
}
