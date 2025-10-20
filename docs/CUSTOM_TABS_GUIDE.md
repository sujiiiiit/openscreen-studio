# Quick Answer: Custom Tab Triggers

## Your Question

"I want to use the ui/tab component, but I don't want to use the native tab triggers and list. I want to use TabsContent with custom tab triggers."

## The Solution

### ✅ What Changed

The `tabs.tsx` component now supports:

1. **`useTabs()` hook** - Access tab state from any child component
2. **Controlled mode** - External state management with `value` and `onValueChange` props
3. **Better documentation** - JSDoc comments explaining usage patterns

### 🎯 Best Approach

**Keep**: `<Tabs>`, `<TabsContentWrapper>`, `<TabsContent>`
**Skip**: `<TabsList>`, `<TabsTrigger>`
**Use**: `useTabs()` hook in your custom components

```tsx
import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "@/components/ui/tabs";

// Your custom trigger
function MyTrigger({ value, label }) {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? "active" : ""}
    >
      {label}
    </button>
  );
}

// Your component
function MyComponent() {
  return (
    <Tabs defaultValue="tab1">
      {/* Custom triggers */}
      <div>
        <MyTrigger value="tab1" label="Tab 1" />
        <MyTrigger value="tab2" label="Tab 2" />
      </div>

      {/* Native content wrapper - keeps all the animation magic! */}
      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
```

## 📁 Files Created

1. **`tabs.tsx`** (updated)
   - Enhanced with controlled mode support
   - Better JSDoc documentation
   - No breaking changes to existing code

2. **`tabs-simple-example.tsx`** ⭐ **START HERE**
   - Simplest possible example
   - Shows exactly what you need
   - Inline and component-based patterns

3. **`tabs-examples.tsx`**
   - 5 different usage patterns
   - Real-world scenarios
   - Sidebar, stepper, mixed triggers, etc.

4. **`TABS_USAGE.md`**
   - Complete reference guide
   - API documentation
   - Common patterns and troubleshooting

## 🚀 Quick Start

**Option 1: Simple inline triggers**

```tsx
<Tabs defaultValue="home">
  <nav>
    <CustomButton value="home">Home</CustomButton>
    <CustomButton value="about">About</CustomButton>
  </nav>

  <TabsContentWrapper>
    <TabsContent value="home">...</TabsContent>
    <TabsContent value="about">...</TabsContent>
  </TabsContentWrapper>
</Tabs>
```

**Option 2: Reusable trigger component**

```tsx
function CustomTrigger({ value, children }) {
  const { activeTab, setActiveTab } = useTabs();
  return <button onClick={() => setActiveTab(value)}>{children}</button>;
}
```

**Option 3: Controlled mode (external state)**

```tsx
const [tab, setTab] = useState("home");

<Tabs value={tab} onValueChange={setTab} defaultValue="home">
  {/* Your triggers */}
  <TabsContentWrapper>...</TabsContentWrapper>
</Tabs>;
```

## ⚡ Key Points

1. **Always wrap in `<Tabs>`** - Provides the context
2. **Use `useTabs()` hook** - Gets `{ activeTab, setActiveTab }`
3. **Keep `<TabsContentWrapper>`** - Handles animations
4. **Match values** - Trigger values must match content values
5. **No breaking changes** - Existing code still works!

## 📖 Next Steps

1. Check `tabs-simple-example.tsx` for the basics
2. Explore `tabs-examples.tsx` for advanced patterns
3. Read `TABS_USAGE.md` for complete documentation
4. Your existing code using native triggers still works!

## 💡 Why This Approach?

- **Flexible**: Use any UI element as a trigger
- **Powerful**: Full control over styling and behavior
- **Simple**: Just one hook: `useTabs()`
- **Compatible**: Works with existing native triggers
- **Type-safe**: Full TypeScript support
- **Animated**: Keep all the smooth transitions
