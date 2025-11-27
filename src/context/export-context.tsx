import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

interface ExportContextType {
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  isExporting: boolean;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
  exportProgress: number;
  setExportProgress: Dispatch<SetStateAction<number>>;
  exportTimeRemaining: number | null;
  setExportTimeRemaining: Dispatch<SetStateAction<number | null>>;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export function ExportProvider({ children }: { children: ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTimeRemaining, setExportTimeRemaining] = useState<number | null>(
    null,
  );

  return (
    <ExportContext.Provider
      value={{
        isSettingsOpen,
        setIsSettingsOpen,
        isExporting,
        setIsExporting,
        exportProgress,
        setExportProgress,
        exportTimeRemaining,
        setExportTimeRemaining,
      }}
    >
      {children}
    </ExportContext.Provider>
  );
}

export function useExport() {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error("useExport must be used within ExportProvider");
  }
  return context;
}
