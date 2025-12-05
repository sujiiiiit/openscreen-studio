import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContentWrapper,
} from "@/components/ui/tabs";
import WallpaperTabContent from "./wallpaper";
import ColorTabContent from "./color";
import GradientTabContent from "./gradient";

export default function BackgroundTabs() {
  return (
    <Tabs defaultValue="wallpaper">
      <TabsList>
        <TabsTrigger value="wallpaper">Wallpaper</TabsTrigger>
        <TabsTrigger value="gradient">Gradient</TabsTrigger>
        <TabsTrigger value="color">Color</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>
      <TabsContentWrapper>
        <TabsContent value="wallpaper">
          <WallpaperTabContent />
        </TabsContent>

        <TabsContent value="gradient">
          <GradientTabContent />
        </TabsContent>

        <TabsContent value="color">
          <ColorTabContent />
        </TabsContent>

        <TabsContent value="image">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-500">
            Drop or pick an image to use as your background.
          </div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
