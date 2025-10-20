# Tabs Component Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ <Tabs defaultValue="tab1">                                   │
│                                                               │
│  Context Provider                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │ TabsContext: { activeTab, setActiveTab }           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌──────────────────────── TRIGGERS ────────────────────┐   │
│  │                                                       │   │
│  │  Option A: Native Triggers                           │   │
│  │  ┌──────────────────────────────────────┐            │   │
│  │  │ <TabsList>                           │            │   │
│  │  │   <TabsTrigger value="tab1">         │            │   │
│  │  │   <TabsTrigger value="tab2">         │            │   │
│  │  └──────────────────────────────────────┘            │   │
│  │                                                       │   │
│  │  Option B: Custom Triggers (Your Use Case!)          │   │
│  │  ┌──────────────────────────────────────┐            │   │
│  │  │ function MyTriggers() {              │            │   │
│  │  │   const { activeTab, setActiveTab }  │            │   │
│  │  │     = useTabs();                     │            │   │
│  │  │                                      │            │   │
│  │  │   return (                           │            │   │
│  │  │     <div>                            │            │   │
│  │  │       <button                        │            │   │
│  │  │         onClick={() =>               │            │   │
│  │  │           setActiveTab("tab1")       │            │   │
│  │  │       >                              │            │   │
│  │  │         Custom Tab 1                 │            │   │
│  │  │       </button>                      │            │   │
│  │  │       <button                        │            │   │
│  │  │         onClick={() =>               │            │   │
│  │  │           setActiveTab("tab2")       │            │   │
│  │  │       >                              │            │   │
│  │  │         Custom Tab 2                 │            │   │
│  │  │       </button>                      │            │   │
│  │  │     </div>                           │            │   │
│  │  │   );                                 │            │   │
│  │  │ }                                    │            │   │
│  │  └──────────────────────────────────────┘            │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────── CONTENT ─────────────────────┐   │
│  │                                                       │   │
│  │  <TabsContentWrapper>  (Keep this!)                  │   │
│  │    <TabsContent value="tab1">                        │   │
│  │      Content for Tab 1                               │   │
│  │    </TabsContent>                                    │   │
│  │    <TabsContent value="tab2">                        │   │
│  │      Content for Tab 2                               │   │
│  │    </TabsContent>                                    │   │
│  │  </TabsContentWrapper>                               │   │
│  │                                                       │   │
│  │  Features:                                           │   │
│  │  ✓ Smooth fade animations                           │   │
│  │  ✓ Slide transitions                                │   │
│  │  ✓ Automatic show/hide                              │   │
│  │  ✓ Pointer-events management                        │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interaction                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│         Custom Trigger Click: setActiveTab("tab2")      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│             Tabs Context Updates: activeTab             │
│             From "tab1" → "tab2"                        │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
┌───────────────────────┐   ┌───────────────────────┐
│  Custom Triggers      │   │  TabsContentWrapper   │
│  Re-render with       │   │  Animates content     │
│  new activeTab        │   │  transition           │
└───────────────────────┘   └───────────────────────┘
```

## The Hook Pattern

```typescript
// Inside your custom trigger component:

const { activeTab, setActiveTab } = useTabs();
//      │            │
//      │            └─── Function to change active tab
//      │
//      └─────────────── Current active tab value


// Usage:
onClick={() => setActiveTab("newTab")}
className={activeTab === "tab1" ? "active" : ""}
```

## Comparison: Native vs Custom

### Native Triggers (Before)

```tsx
<Tabs defaultValue="tab1">
  <TabsList>                      ← Specific container
    <TabsTrigger value="tab1">    ← Specific button
    <TabsTrigger value="tab2">    ← Specific button
  </TabsList>

  <TabsContentWrapper>
    <TabsContent value="tab1">...</TabsContent>
    <TabsContent value="tab2">...</TabsContent>
  </TabsContentWrapper>
</Tabs>
```

**Pros:** Ready to use, consistent styling
**Cons:** Limited customization, fixed layout

### Custom Triggers (Your Approach)

```tsx
<Tabs defaultValue="tab1">
  <YourCustomLayout>
    {" "}
    ← Any layout!
    <YourCustomTrigger /> ← Any component!
    <AnyElement /> ← Anything!
  </YourCustomLayout>

  <TabsContentWrapper>
    {" "}
    ← Keep this part!
    <TabsContent value="tab1">...</TabsContent>
    <TabsContent value="tab2">...</TabsContent>
  </TabsContentWrapper>
</Tabs>
```

**Pros:** Complete control, any design, flexible layout
**Cons:** You style it yourself (but that's what you want!)

## Key Concepts

### 1. Context Provider Pattern

- `<Tabs>` creates a context
- Any child component can access it with `useTabs()`
- Works at any nesting level

### 2. Separation of Concerns

- **Triggers**: Control which tab is active
- **Content**: Display the active tab's content
- **State**: Managed by context, shared between both

### 3. Value Matching

```tsx
<button onClick={() => setActiveTab("profile")}>  ← Trigger

<TabsContent value="profile">                     ← Content

// "profile" must match exactly!
```

## Common Patterns Visualized

### Pattern 1: Sidebar + Content

```
┌────────┬──────────────────────────┐
│ Nav 1  │                          │
│ Nav 2  │    Tab Content Area      │
│ Nav 3  │                          │
│        │                          │
└────────┴──────────────────────────┘
   ↑                ↑
Custom           Native
Triggers         Content
```

### Pattern 2: Header Tabs

```
┌──────────────────────────────────┐
│ [Tab1] [Tab2] [Tab3]             │
├──────────────────────────────────┤
│                                  │
│     Tab Content Area             │
│                                  │
└──────────────────────────────────┘
```

### Pattern 3: Card Selection

```
┌──────┐  ┌──────┐  ┌──────┐
│Card 1│  │Card 2│  │Card 3│
└──────┘  └──────┘  └──────┘
   ↓
┌──────────────────────────────┐
│  Selected Card Content       │
└──────────────────────────────┘
```

### Pattern 4: Mixed Triggers

```
┌──────────────────────────────────┐
│ [Native1] [Native2]    [Custom]  │
├──────────────────────────────────┤
│                                  │
│     Tab Content Area             │
│                                  │
└──────────────────────────────────┘
```

## Mental Model

Think of the tabs component as having three layers:

```
Layer 1: State Management (Tabs Context)
         ─────────────────────────
         Keeps track of activeTab

         ↕ (useTabs hook)

Layer 2: Triggers (Your Custom UI)
         ─────────────────────────
         Buttons, cards, links, etc.
         Call setActiveTab()

         ↕ (Context communication)

Layer 3: Content Display (TabsContentWrapper)
         ─────────────────────────
         Shows/hides content based on activeTab
         Handles animations
```

You control Layer 2, the component handles Layer 1 & 3!
