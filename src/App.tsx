import { ThemeProvider } from "./components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import TitleBar from "@/components/layout/titlebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/layout/sidebar";
import Main from "@/components/layout/main";
import Footer from "@/components/layout/footer";
import { PlaybackProvider } from "@/context/playback-context";
import { PresentationProvider } from "@/context/presentation-context";
export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider delayDuration={0}>
        <PresentationProvider>
          <PlaybackProvider>
            <div className="h-dvh w-dvw overflow-hidden">
              <TitleBar />
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel order={1}>
                  <section className="flex h-full flex-row">
                    <Sidebar />
                    <Main />
                  </section>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  minSize={30}
                  order={2}
                  defaultSize={31}
                  maxSize={60}
                >
                  <Footer />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </PlaybackProvider>
        </PresentationProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
