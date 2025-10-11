import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContentWrapper,
} from "@/components/ui/tabs";
import SquiggleLoader from "@/components/ui/squiggle-loader";
import { TextShimmer } from "@/components/ui/text-shimmer";

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
          <div className="rounded-md border border-dashed p-6 text-sm flex items-center gap-2">
            <SquiggleLoader strokeColor="#86837e" />
            <TextShimmer duration={1}>
              Generating
            </TextShimmer>
          </div>
        </TabsContent>

        <TabsContent value="gradient">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-500">
            Configure gradient stops, angles, and preview the blend.
          </div>
        </TabsContent>

        <TabsContent value="color">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-500">
            Choose a solid color or enter a hex code for the background.
          </div>
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
