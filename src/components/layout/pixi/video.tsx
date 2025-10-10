import { Assets, Texture } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";

import { usePlayback } from "@/context/playback-context";

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

    const textureRatio = width / height;
    let renderWidth = viewportWidth;
    let renderHeight = viewportWidth / textureRatio;

    if (renderHeight > viewportHeight) {
      renderHeight = viewportHeight;
      renderWidth = viewportHeight * textureRatio;
    }

    renderWidth = Math.round(renderWidth);
    renderHeight = Math.round(renderHeight);

    const offsetX = Math.round((viewportWidth - renderWidth) / 2);
    const offsetY = Math.round((viewportHeight - renderHeight) / 2);

    return {
      width: renderWidth,
      height: renderHeight,
      x: offsetX,
      y: offsetY,
    };
  }, [texture, viewportSize]);

  return (
    <>
      <pixiSprite
        ref={spriteRef}
        texture={texture}
        width={layout.width}
        height={layout.height}
        x={layout.x}
        y={layout.y}
      />
    </>
  );
}
