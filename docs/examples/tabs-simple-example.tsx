/**
 * SIMPLE EXAMPLE: Custom Triggers with Tab Content
 *
 * This is the simplest possible example of using custom triggers
 * while keeping the native TabsContentWrapper functionality.
 */

import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "../../src/components/ui/tabs";

// Step 1: Create your custom trigger component
function MyCustomTrigger({
  value,
  label,
  emoji,
}: {
  value: string;
  label: string;
  emoji: string;
}) {
  // Get the tab state using the useTabs hook
  const { activeTab, setActiveTab } = useTabs();

  // Check if this trigger is active
  const isActive = activeTab === value;

  // Render your custom button/trigger
  return (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        padding: "12px 24px",
        border: isActive ? "2px solid blue" : "2px solid gray",
        backgroundColor: isActive ? "#e3f2fd" : "white",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      <span style={{ marginRight: "8px" }}>{emoji}</span>
      {label}
    </button>
  );
}

// Step 2: Use it in your component
export default function SimpleCustomTabsExample() {
  return (
    <Tabs defaultValue="profile">
      {/* Your custom triggers - NO TabsList needed! */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <MyCustomTrigger value="profile" label="My Profile" emoji="👤" />
        <MyCustomTrigger value="messages" label="Messages" emoji="💬" />
        <MyCustomTrigger
          value="notifications"
          label="Notifications"
          emoji="🔔"
        />
      </div>

      {/* Keep the native TabsContentWrapper - it handles all the magic! */}
      <TabsContentWrapper>
        <TabsContent value="profile">
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h2>Profile Content</h2>
            <p>This is your profile page content.</p>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h2>Messages Content</h2>
            <p>This is your messages page content.</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h2>Notifications Content</h2>
            <p>This is your notifications page content.</p>
          </div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// EVEN SIMPLER: Inline Custom Triggers
// ============================================================================

export function InlineCustomTriggers() {
  return (
    <Tabs defaultValue="home">
      {/* Define custom triggers inline */}
      <CustomTriggerBar />

      {/* Native content wrapper */}
      <TabsContentWrapper>
        <TabsContent value="home">Home Page</TabsContent>
        <TabsContent value="about">About Page</TabsContent>
        <TabsContent value="contact">Contact Page</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

function CustomTriggerBar() {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <nav style={{ marginBottom: "20px" }}>
      <button onClick={() => setActiveTab("home")}>
        {activeTab === "home" ? "🏠 Home (Active)" : "🏠 Home"}
      </button>
      <button onClick={() => setActiveTab("about")}>
        {activeTab === "about" ? "ℹ️ About (Active)" : "ℹ️ About"}
      </button>
      <button onClick={() => setActiveTab("contact")}>
        {activeTab === "contact" ? "📧 Contact (Active)" : "📧 Contact"}
      </button>
    </nav>
  );
}

// ============================================================================
// KEY TAKEAWAYS
// ============================================================================

/*

✅ WHAT YOU NEED:
1. <Tabs> wrapper with defaultValue
2. Your custom trigger components using useTabs() hook
3. <TabsContentWrapper> with <TabsContent> children

❌ WHAT YOU DON'T NEED:
1. <TabsList> - Skip it entirely!
2. <TabsTrigger> - Create your own!

🔑 THE PATTERN:

<Tabs defaultValue="...">
  <YourCustomTriggers />       ← Use useTabs() hook here
  
  <TabsContentWrapper>         ← Keep this!
    <TabsContent value="...">  ← And these!
      ...
    </TabsContent>
  </TabsContentWrapper>
</Tabs>

*/
