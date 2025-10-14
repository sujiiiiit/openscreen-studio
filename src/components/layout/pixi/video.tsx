import { Assets, Texture, Graphics, BlurFilter } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";

import { usePlayback } from "@/context/playback-context";
import { useBackground } from "@/context/background-context";

type BunnySpriteProps = {
  onVideoDimensions?: (dimensions: { width: number; height: number }) => void;
  onVideoDuration?: (durationSeconds: number) => void;
  viewportSize: { width: number; height: number };
};

export default function VideoTexture({
  onVideoDimensions,
  onVideoDuration,
  viewportSize,
}: BunnySpriteProps) {
  // The Pixi.js `Sprite`
  const spriteRef = useRef(null);

  const [texture, setTexture] = useState(Texture.EMPTY);

  const { registerVideoElement, setDurationHint } = usePlayback();
  const { padding, enabled: backgroundEnabled, videoBorderRadius, videoShadow } = useBackground();
  
  // Animated padding for smooth transitions
  const [animatedPadding, setAnimatedPadding] = useState(padding);
  const targetPaddingRef = useRef(padding);

  // Animated border radius for smooth transitions
  const [animatedBorderRadius, setAnimatedBorderRadius] = useState(videoBorderRadius);
  const targetBorderRadiusRef = useRef(videoBorderRadius);

  // Animated shadow for smooth transitions
  const [animatedShadow, setAnimatedShadow] = useState(videoShadow);
  const targetShadowRef = useRef(videoShadow);

  // Smooth padding animation
  useEffect(() => {
    targetPaddingRef.current = padding;
    
    let animationFrame: number;
    const animate = () => {
      setAnimatedPadding((current) => {
        const target = targetPaddingRef.current;
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
  }, [padding]);

  // Smooth border radius animation
  useEffect(() => {
    targetBorderRadiusRef.current = videoBorderRadius;
    
    let animationFrame: number;
    const animate = () => {
      setAnimatedBorderRadius((current) => {
        const target = targetBorderRadiusRef.current;
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
  }, [videoBorderRadius]);

  // Smooth shadow animation
  useEffect(() => {
    targetShadowRef.current = videoShadow;
    
    let animationFrame: number;
    const animate = () => {
      setAnimatedShadow((current) => {
        const target = targetShadowRef.current;
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
  }, [videoShadow]);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    const sourceUrl = "/video/output.mp4";

    let disposed = false;
    let currentUrl: string | null = null;

    const hydrateTexture = (nextTexture: Texture) => {
      setTexture(nextTexture);

      if (onVideoDimensions) {
        const width = nextTexture.width || nextTexture.source?.width || 0;
        const height = nextTexture.height || nextTexture.source?.height || 0;

        if (width && height) {
          onVideoDimensions({ width, height });
        }
      }
    };

    const attemptLoad = async () => {
      try {
        const loaded = await Assets.load<Texture>(sourceUrl);
        console.log("Loaded video texture", loaded);
        if (disposed) {
          return;
        }
        currentUrl = sourceUrl;
        hydrateTexture(loaded);
        return;
      } catch (error) {
        console.error(`Failed to load video texture from ${sourceUrl}`, error);
      }
    };

    void attemptLoad();

    return () => {
      disposed = true;
      if (currentUrl) {
        void Assets.unload(currentUrl);
      }
      setTexture(Texture.EMPTY);
      registerVideoElement(null);
    };
  }, [
    onVideoDimensions,
    onVideoDuration,
    registerVideoElement,
    setDurationHint,
  ]);

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
      };
    }

    // Calculate padding in pixels
    const paddingPx = backgroundEnabled
      ? (Math.min(viewportWidth, viewportHeight) * animatedPadding) / 100
      : 0;

    // Available area after padding
    const availableWidth = viewportWidth - paddingPx * 2;
    const availableHeight = viewportHeight - paddingPx * 2;

    // Scale video to fit within padded area (contain)
    const textureRatio = width / height;
    let renderWidth = availableWidth;
    let renderHeight = availableWidth / textureRatio;

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = availableHeight * textureRatio;
    }

    renderWidth = Math.round(renderWidth);
    renderHeight = Math.round(renderHeight);

    // Center the video in viewport
    const offsetX = Math.round(viewportWidth / 2);
    const offsetY = Math.round(viewportHeight / 2);

    return {
      width: renderWidth,
      height: renderHeight,
      x: offsetX,
      y: offsetY,
    };
  }, [texture, viewportSize, animatedPadding, backgroundEnabled]);

  // Create rounded rectangle mask
  const mask = useMemo(() => {
    if (animatedBorderRadius === 0 || !layout.width || !layout.height) {
      return undefined;
    }

    const graphics = new Graphics();
    
    // Calculate border radius as percentage of smallest dimension
    // This makes it scale proportionally with video size
    // animatedBorderRadius is 0-100, we convert to percentage of smallest side
    const smallestDimension = Math.min(layout.width, layout.height);
    const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100;
    
    // Draw rounded rectangle at sprite's actual position
    // Since sprite is at (layout.x, layout.y) with anchor 0.5 (centered),
    // the mask must be drawn in world coordinates
    // Use higher precision by drawing with sub-pixel accuracy
    graphics.roundRect(
      layout.x - layout.width / 2,
      layout.y - layout.height / 2,
      layout.width,
      layout.height,
      radiusInPixels
    );
    
    // Fill with solid white for mask
    graphics.fill({ 
      color: 0xffffff, 
      alpha: 1 
    });
    
    return graphics;
  }, [layout, animatedBorderRadius]);

  // Create Mac-style shadow using Graphics (rendered behind video)
  const shadowProps = useMemo(() => {
    if (animatedShadow === 0 || !backgroundEnabled || !layout.width || !layout.height) {
      return undefined;
    }

    // Calculate shadow properties based on animatedShadow (0-100)
    // Mac-style: very soft, dark, with slight vertical offset and large spread
    const shadowOffset = (animatedShadow / 100) * 20; // 0-20px vertical offset (more offset for depth)
    const shadowAlpha = Math.min((animatedShadow / 100) * 0.5, 0.5); // 0-0.5 alpha (darker for Mac look)
    const shadowSpread = (animatedShadow / 100) * 40; // 0-40px spread (larger diffusion area)
    const blurStrength = (animatedShadow / 100) * 40; // 0-40 blur (more blur for softer edges)
    
    // Calculate border radius for shadow (matching video)
    const smallestDimension = Math.min(layout.width, layout.height);
    const radiusInPixels = (smallestDimension * animatedBorderRadius) / 100;
    
    // Shadow dimensions and position
    // Larger spread for softer, more diffused appearance
    const shadowWidth = layout.width + shadowSpread * 2;
    const shadowHeight = layout.height + shadowSpread * 2;
    const shadowX = layout.x - shadowWidth / 2;
    const shadowY = layout.y - shadowHeight / 2 + shadowOffset;
    
    return {
      x: shadowX,
      y: shadowY,
      width: shadowWidth,
      height: shadowHeight,
      radius: radiusInPixels + shadowSpread * 0.5, // Slightly larger radius for shadow
      alpha: shadowAlpha,
      blur: blurStrength,
    };
  }, [layout, animatedBorderRadius, animatedShadow, backgroundEnabled]);

  // Create blur filter for shadow with high quality settings
  const shadowBlurFilter = useMemo(() => {
    if (!shadowProps) return undefined;
    
    // Use maximum quality settings for smooth, non-pixelated shadow
    // quality: 15 (higher = smoother, more passes)
    // kernelSize: 15 (larger = softer blur)
    // resolution: higher for crisp rendering
    const filter = new BlurFilter({
      strength: shadowProps.blur,
      quality: 15, // Maximum quality for smooth blur
      kernelSize: 15, // Large kernel for soft, diffused shadow
      resolution: 2, // Higher resolution for crisp rendering
    });
    
    return filter;
  }, [shadowProps]);

  return (
    <>
      {/* Shadow Graphics - rendered behind video */}
      {shadowProps && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.roundRect(
              shadowProps.x,
              shadowProps.y,
              shadowProps.width,
              shadowProps.height,
              shadowProps.radius
            );
            g.fill({ color: 0x000000, alpha: shadowProps.alpha });
          }}
          filters={shadowBlurFilter ? [shadowBlurFilter] : undefined}
        />
      )}
      
      {/* Video sprite */}
      <pixiSprite
        ref={spriteRef}
        texture={texture}
        width={layout.width}
        height={layout.height}
        x={layout.x}
        y={layout.y}
        anchor={0.5}
        mask={mask}
      />
    </>
  );
}
