import WallpaperSprite from "./wallpaper";
import VideoTexture from "./video";

type CompositeSceneProps = {
  onVideoDimensions?: (dimensions: { width: number; height: number }) => void;
  viewportSize: { width: number; height: number };
};

export default function CompositeScene({
  onVideoDimensions,
  viewportSize,
}: CompositeSceneProps) {
  return (
    <pixiContainer>
      {/* Background layer - wallpaper with blur */}
      <WallpaperSprite viewportSize={viewportSize} />

      {/* Foreground layer - video with padding */}
      <VideoTexture
        onVideoDimensions={onVideoDimensions}
        viewportSize={viewportSize}
      />
    </pixiContainer>
  );
}
