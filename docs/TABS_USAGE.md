# Tabs Component - Usage Guide

## Overview

The `Tabs` component provides a flexible, context-based tab system that supports both native and custom triggers. You can use it in multiple ways depending on your needs.

## Architecture

```
Tabs (Context Provider)
├── TabsContext { activeTab, setActiveTab }
├── Any custom triggers (using useTabs hook)
├── TabsList (optional - native trigger container)
│   └── TabsTrigger (optional - native trigger)
└── TabsContentWrapper (content manager)
    └── TabsContent (individual content)
```

## Quick Reference

### 1. Standard Usage (Native Triggers)

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContentWrapper,
  TabsContent,
} from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>

  <TabsContentWrapper>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </TabsContentWrapper>
</Tabs>;
```

**When to use:** Simple tab interfaces with standard trigger styling.

---

### 2. Custom Triggers Only (Your Use Case!)

```tsx
import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "@/components/ui/tabs";

function CustomTriggers() {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div className="my-custom-layout">
      <button
        onClick={() => setActiveTab("tab1")}
        className={activeTab === "tab1" ? "active" : ""}
      >
        Custom Tab 1
      </button>
      <button
        onClick={() => setActiveTab("tab2")}
        className={activeTab === "tab2" ? "active" : ""}
      >
        Custom Tab 2
      </button>
    </div>
  );
}

export function MyComponent() {
  return (
    <Tabs defaultValue="tab1">
      <CustomTriggers />

      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
```

**When to use:**

- Custom trigger designs
- Triggers in different locations (sidebar, header, etc.)
- Non-button triggers (cards, images, etc.)
- Complex layouts

---

### 3. Controlled Mode (External State)

```tsx
import { useState } from "react";
import { Tabs, TabsContentWrapper, TabsContent } from "@/components/ui/tabs";

function MyComponent() {
  const [currentTab, setCurrentTab] = useState("tab1");

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} defaultValue="tab1">
      <button onClick={() => setCurrentTab("tab1")}>Tab 1</button>
      <button onClick={() => setCurrentTab("tab2")}>Tab 2</button>

      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
```

**When to use:**

- Need to control tab state from parent
- Programmatic tab switching
- Integration with forms or wizards
- URL-based routing

---

### 4. Mixed Approach

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "@/components/ui/tabs";

function QuickActions() {
  const { setActiveTab } = useTabs();
  return (
    <button onClick={() => setActiveTab("special")}>Go to Special Tab</button>
  );
}

<Tabs defaultValue="tab1">
  <div className="flex justify-between">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <QuickActions />
  </div>

  <TabsContentWrapper>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
    <TabsContent value="special">Special Content</TabsContent>
  </TabsContentWrapper>
</Tabs>;
```

**When to use:** Native triggers for main tabs, custom triggers for auxiliary actions.

---

## API Reference

### `<Tabs>`

Container component that provides tab context.

**Props:**

- `defaultValue: string` - Initial active tab (required)
- `value?: string` - Controlled value (optional)
- `onValueChange?: (value: string) => void` - Controlled change handler (optional)
- `className?: string` - Additional CSS classes
- `children: ReactNode` - Child components

---

### `useTabs()` Hook

Access tab state from any child component.

**Returns:**

```tsx
{
  activeTab: string;      // Current active tab value
  setActiveTab: (value: string) => void;  // Function to change active tab
}
```

**Important:** Must be used within a `<Tabs>` component.

---

### `<TabsContentWrapper>`

Manages rendering and animation of tab content.

**Props:**

- `children: ReactNode` - TabsContent components
- `className?: string` - Additional CSS classes

**Features:**

- Smooth opacity transitions
- Slide animations based on tab direction
- Automatic pointer-events management

---

### `<TabsContent>`

Individual tab content panel.

**Props:**

- `value: string` - Unique identifier matching trigger value
- `children: ReactNode` - Content to display

---

### `<TabsList>` (Optional)

Container for native tab triggers.

**Props:**

- `children: ReactNode` - TabsTrigger components
- `className?: string` - Additional CSS classes

---

### `<TabsTrigger>` (Optional)

Native tab trigger button.

**Props:**

- `value: string` - Unique identifier matching content value
- `children: ReactNode` - Trigger label/content

**Features:**

- Animated indicator background
- Automatic active state styling
- Accessible button element

---

## Common Patterns

### Pattern 1: Sidebar Navigation

```tsx
function Sidebar() {
  const { activeTab, setActiveTab } = useTabs();

  const items = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={activeTab === item.id ? "active" : ""}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </nav>
  );
}
```

### Pattern 2: Card-Based Triggers

```tsx
function CardTriggers() {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div
        onClick={() => setActiveTab("basic")}
        className={`cursor-pointer p-6 border rounded-lg ${
          activeTab === "basic" ? "border-blue-500 bg-blue-50" : ""
        }`}
      >
        <h3>Basic Plan</h3>
        <p>$10/month</p>
      </div>
      {/* More cards... */}
    </div>
  );
}
```

### Pattern 3: URL-Based Tabs

```tsx
function UrlTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setSearchParams({ tab: value })}
      defaultValue="overview"
    >
      {/* Your triggers and content */}
    </Tabs>
  );
}
```

### Pattern 4: Keyboard Navigation

```tsx
function KeyboardTabs() {
  const { activeTab, setActiveTab } = useTabs();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "1") setActiveTab("tab1");
      if (e.key === "2") setActiveTab("tab2");
      if (e.key === "3") setActiveTab("tab3");
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTab]);

  return <div>Press 1, 2, or 3 to switch tabs</div>;
}
```

---

## TypeScript Support

All components are fully typed. When using `useTabs()`, you get complete type safety:

```tsx
const { activeTab, setActiveTab } = useTabs();
// activeTab: string
// setActiveTab: (value: string) => void
```

---

## Animation Details

The component uses Framer Motion for smooth transitions:

- **Opacity**: 250ms fade in/out
- **Slide**: 32px horizontal offset based on tab direction
- **Timing**: easeOut for natural movement
- **Indicator**: 200ms tween animation for the active tab indicator

---

## Tips & Best Practices

1. **Always wrap in `<Tabs>`** - Even with custom triggers, you need the context provider
2. **Use unique values** - Each tab needs a unique value identifier
3. **Keep `<TabsContentWrapper>`** - It handles all the animation and rendering logic
4. **One `<TabsContent>` per tab** - Match the value to your trigger values
5. **Access state anywhere** - Use `useTabs()` in any child component, at any depth
6. **Consider controlled mode** - When you need programmatic control or persistence

---

## Troubleshooting

**Error: "useTabs must be used within a Tabs component"**

- Make sure your component using `useTabs()` is inside a `<Tabs>` wrapper

**Tabs not switching:**

- Verify that trigger values match content values exactly
- Check that `setActiveTab` is being called correctly

**Content not animating:**

- Ensure you're using `<TabsContentWrapper>` and `<TabsContent>` components
- Don't conditionally render TabsContent components

**State not updating in controlled mode:**

- Make sure you're passing both `value` and `onValueChange` props
- Verify your state setter is working correctly
