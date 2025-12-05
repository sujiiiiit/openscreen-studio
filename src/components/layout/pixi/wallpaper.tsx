import { Assets, BlurFilter, Texture, NoiseFilter, Graphics } from "pixi.js";
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
    grainStrength,
    gradientSettings,
  } = useBackground();

  // Animated blur strength for smooth transitions
  const [animatedBlur, setAnimatedBlur] = useState(blurStrength);
  const targetBlurRef = useRef(blurStrength);

  // Smooth blur animation using requestAnimationFrame
  useEffect(() => {
    targetBlurRef.current = blurStrength;

    let animationFrame: number;
    let isAnimating = true;

    const animate = () => {
      setAnimatedBlur((current) => {
        const target = targetBlurRef.current;
        const diff = target - current;

        // Smooth interpolation (ease out)
        if (Math.abs(diff) < 0.1) {
          isAnimating = false;
          return target;
        }

        isAnimating = true;
        return current + diff * 0.15; // 15% towards target each frame
      });

      if (isAnimating) {
        animationFrame = requestAnimationFrame(animate);
      }
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

  // Create noise filter for grainy texture
  const noiseFilter = useMemo(() => {
    if (grainStrength <= 0) return undefined;

    return new NoiseFilter({
      noise: grainStrength / 100, // Convert 0-100 to 0-1
      seed: Math.random(), // Random seed for static noise
    });
  }, [grainStrength]);

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

  // Create gradient texture when in gradient mode
  const gradientTexture = useMemo(() => {
    if (backgroundMode !== "gradient" || !gradientSettings) {
      return null;
    }

    const { width, height } = viewportSize;
    const { type, angle, stops } = gradientSettings;

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Sort stops by position
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);

    let gradient: CanvasGradient;

    if (type === "linear") {
      // Convert angle to radians and calculate gradient line
      const angleRad = (angle * Math.PI) / 180;
      const diagonal = Math.sqrt(width * width + height * height);
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate start and end points for the gradient line
      const dx = Math.cos(angleRad) * diagonal / 2;
      const dy = Math.sin(angleRad) * diagonal / 2;

      const x0 = centerX - dx;
      const y0 = centerY - dy;
      const x1 = centerX + dx;
      const y1 = centerY + dy;

      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    } else if (type === "radial") {
      // Create radial gradient from center
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.sqrt(width * width + height * height) / 2;

      gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
    } else if (type === "conic") {
      // Create conic gradient
      const centerX = width / 2;
      const centerY = height / 2;
      const angleRad = (angle * Math.PI) / 180;

      gradient = ctx.createConicGradient(angleRad, centerX, centerY);
    } else {
      return null;
    }

    // Add color stops to the gradient
    sortedStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    // Draw the gradient on canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Create texture from canvas
    const tex = Texture.from(canvas);
    
    // Clean up canvas
    canvas.remove();

    return tex;
  }, [backgroundMode, gradientSettings, viewportSize]);

  if (!enabled || texture === Texture.EMPTY) {
    return null;
  }

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

  // If in color mode, render solid color instead of wallpaper
  if (backgroundMode === "color" && backgroundColor) {
    return (
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.rect(0, 0, viewportSize.width, viewportSize.height);
          g.fill(hexToRgb(backgroundColor));
        }}
        filters={noiseFilter ? [noiseFilter] : undefined}
      />
    );
  }

  // If in gradient mode, render gradient background
  if (backgroundMode === "gradient" && gradientTexture) {
    return (
      <pixiGraphics
        draw={(g: Graphics) => {
          g.clear();
          g.rect(0, 0, viewportSize.width, viewportSize.height);
          g.fill({ texture: gradientTexture });
        }}
        filters={noiseFilter ? [noiseFilter] : undefined}
      />
    );
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
      filters={noiseFilter ? [blurFilter, noiseFilter] : [blurFilter]}
    />
  );
}
