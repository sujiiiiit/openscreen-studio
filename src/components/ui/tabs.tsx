"use client";

import {
  useState,
  useCallback,
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { motion } from "framer-motion";

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

type TabsListProps = {
  children: ReactNode;
  className?: string;
};

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
};

type TabsContentProps = {
  value: string;
  children: ReactNode;
};

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a Tabs component.");
  }
  return context;
}

export const useTabs = useTabsContext;

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultValue);

  const setActiveTab = useCallback((value: string) => {
    setActiveTabState((prev) => (prev === value ? prev : value));
  }, []);

  const orderedTabValues: string[] = [];
  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (
        typeof child === "object" &&
        child &&
        "type" in child &&
        child.type === TabsList
      ) {
        const listChildren = (child.props && child.props.children) ?? null;
        if (Array.isArray(listChildren)) {
          listChildren.forEach((lc) => {
            if (
              typeof lc === "object" &&
              lc &&
              "props" in lc &&
              lc.props &&
              typeof lc.props.value === "string"
            ) {
              orderedTabValues.push(lc.props.value);
            }
          });
        }
      }
    });
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`flex w-full flex-col gap-6 ${className ?? ""}`}>
        {Array.isArray(children)
          ? children.map((child) =>
              typeof child === "object" && "type" in child
                ? child.type === TabsList
                  ? {
                      ...child,
                      props: {
                        ...child.props,
                        activeTab,
                        onChange: setActiveTab,
                      },
                    }
                  : child.type === TabsContentWrapper
                    ? {
                        ...child,
                        props: { ...child.props, activeTab },
                      }
                    : child
                : child
            )
          : children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  activeTab,
  onChange,
}: TabsListProps & { activeTab?: string; onChange?: (v: string) => void }) {
  const context = useContext(TabsContext);
  const resolvedActiveTab = activeTab ?? context?.activeTab;
  const resolvedOnChange = onChange ?? context?.setActiveTab;

  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      {Array.isArray(children)
        ? children.map((child) =>
            typeof child === "object" && "props" in child
              ? {
                  ...child,
                  props: {
                    ...child.props,
                    activeTab: resolvedActiveTab,
                    onChange: resolvedOnChange,
                  },
                }
              : child
          )
        : children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  activeTab,
  onChange,
}: TabsTriggerProps & { activeTab?: string; onChange?: (v: string) => void }) {
  const context = useContext(TabsContext);
  const resolvedActiveTab = activeTab ?? context?.activeTab;
  const resolvedOnChange = onChange ?? context?.setActiveTab;
  const isActive = value === resolvedActiveTab;

  return (
    <button
      type="button"
      onClick={() => resolvedOnChange?.(value)}
      className="relative rounded-full px-4 py-2 text-sm transition-colors"
    >
      {isActive && (
        <motion.span
          layoutId="tabs-indicator"
          className="absolute inset-0 rounded-full bg-primary-active-bg"
          transition={{ type: "tween", duration: 0.2 }}
        />
      )}
      <span
        className={`relative z-10 ${isActive ? "text-primary-active" : "text-primary"}`}
      >
        {children}
      </span>
    </button>
  );
}

export function TabsContentWrapper({
  children,
  className,
  activeTab,
}: {
  children: ReactNode;
  className?: string;
  activeTab?: string;
}) {
  const context = useContext(TabsContext);
  const resolvedActiveTab = activeTab ?? context?.activeTab;
  const tabContents: { value: string; content: ReactNode }[] = [];

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (
        typeof child === "object" &&
        child &&
        "props" in child &&
        child.type === TabsContent
      ) {
        const childProps = child.props as TabsContentProps;
        tabContents.push({
          value: childProps.value,
          content: childProps.children,
        });
      }
    });
  }

  return (
    <div className={`flex ${className ?? ""}`}>
      {tabContents.map(({ value, content }) => {
        const isActive = value === resolvedActiveTab;
        const tabIndex = tabContents.findIndex((tab) => tab.value === value);
        const activeIndex = resolvedActiveTab
          ? tabContents.findIndex((tab) => tab.value === resolvedActiveTab)
          : -1;

        return (
          <motion.div
            key={value}
            className={`w-full ${isActive ? "relative" : "absolute"} `}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              x:
                isActive || activeIndex === -1
                  ? 0
                  : tabIndex > activeIndex
                    ? 32
                    : -32,
              pointerEvents: isActive ? "auto" : "none",
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
              opacity: { duration: isActive ? 0.25 : 0.15 },
            }}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}

export function TabsContent(_props: TabsContentProps) {
  return null;
}
