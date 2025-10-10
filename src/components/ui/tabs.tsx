"use client";

import { useState, useCallback, type ReactNode } from "react";
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

// Context-like pattern using simple props composition
export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // Build an ordered list of tab values from any TabsList children so we can
  // compute animation direction based on visual order (indices).
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

  const handleChange = useCallback(
    (value: string) => {
      if (value === activeTab) return;
      setActiveTab(value);
    },
    [activeTab],
  );

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`}>
      {Array.isArray(children)
        ? children.map((child) =>
            typeof child === "object" && "type" in child
              ? child.type === TabsList
                ? {
                    ...child,
                    props: {
                      ...child.props,
                      activeTab,
                      onChange: handleChange,
                    },
                  }
                : child.type === TabsContentWrapper
                  ? {
                      ...child,
                      props: { ...child.props, activeTab },
                    }
                  : child
              : child,
          )
        : children}
    </div>
  );
}

export function TabsList({
  children,
  className,
  activeTab,
  onChange,
}: TabsListProps & { activeTab?: string; onChange?: (v: string) => void }) {
  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      {Array.isArray(children)
        ? children.map((child) =>
            typeof child === "object" && "props" in child
              ? {
                  ...child,
                  props: { ...child.props, activeTab, onChange },
                }
              : child,
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
  const isActive = value === activeTab;

  return (
    <button
      type="button"
      onClick={() => onChange?.(value)}
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
  const tabContents: { value: string; content: ReactNode }[] = [];

  // Extract tab contents from children
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
    <div
      className={`relative min-h-[200px] overflow-hidden ${className ?? ""}`}
    >
      {tabContents.map(({ value, content }) => {
        const isActive = value === activeTab;
        const tabIndex = tabContents.findIndex((tab) => tab.value === value);
        const activeIndex = tabContents.findIndex(
          (tab) => tab.value === activeTab,
        );

        return (
          <motion.div
            key={value}
            className="absolute inset-0 w-full"
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              x: isActive ? 0 : tabIndex > activeIndex ? 32 : -32,
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
  // This component serves as a declarative way to define tab content
  // The actual rendering is handled by TabsContentWrapper
  // It exists only to be parsed by the wrapper component
  return null;
}
