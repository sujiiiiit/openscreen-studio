import { Application } from "@pixi/react";
import { type Application as PixiApplication } from "pixi.js";
import CompositeScene from "./composite";

type ExportRendererProps = {
  width: number;
  height: number;
  resolution?: number;
  onInit: (app: PixiApplication) => void;
};

export default function ExportRenderer({
  width,
  height,
  resolution = 1,
  onInit,
}: ExportRendererProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        visibility: "hidden",
        pointerEvents: "none",
        zIndex: -1000,
      }}
    >
      <Application
        width={width}
        height={height}
        resolution={resolution}
        backgroundAlpha={0}
        onInit={onInit}
        autoStart={false} // We will manually tick/render
        antialias={true}
        preserveDrawingBuffer={true} // Important for capturing canvas
      >
        <CompositeScene viewportSize={{ width, height }} />
      </Application>
    </div>
  );
}
