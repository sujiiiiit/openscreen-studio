import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface PresentationContextType {
  isPresenting: boolean;
  setIsPresenting: (value: boolean) => void;
  togglePresentation: () => void;
  registerPresentationHandler: (handler: () => Promise<void>) => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(
  undefined,
);

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationHandler, setPresentationHandler] = useState<
    (() => Promise<void>) | null
  >(null);

  const registerPresentationHandler = useCallback(
    (handler: () => Promise<void>) => {
      setPresentationHandler(() => handler);
    },
    [],
  );

  const togglePresentation = useCallback(async () => {
    if (presentationHandler) {
      try {
        await presentationHandler();
      } catch (error) {
        console.error("Failed to toggle presentation mode", error);
      }
    }
  }, [presentationHandler]);

  return (
    <PresentationContext.Provider
      value={{
        isPresenting,
        setIsPresenting,
        togglePresentation,
        registerPresentationHandler,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error("usePresentation must be used within PresentationProvider");
  }
  return context;
}
