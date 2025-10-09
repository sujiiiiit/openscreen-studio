import { useCallback, useState } from "react";

interface UseSidebarTabsOptions {
  defaultOpen?: boolean;
}

export function useSidebarTabs<TTab extends string>(
  initialTab: TTab,
  options?: UseSidebarTabsOptions,
) {
  const { defaultOpen = true } = options ?? {};

  const [activeTab, setActiveTab] = useState<TTab>(initialTab);
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const selectTab = useCallback((nextTab: TTab) => {
    setActiveTab((previous) => {
      if (previous === nextTab) {
        setIsOpen((value) => !value);
        return previous;
      }

      setIsOpen(true);
      return nextTab;
    });
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return {
    activeTab,
    selectTab,
    isOpen,
    open,
    close,
    toggle,
    setActiveTab,
    setIsOpen,
  } as const;
}
