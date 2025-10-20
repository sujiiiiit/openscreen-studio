/**
 * MIGRATION GUIDE: From Native to Custom Triggers
 *
 * This file shows the exact transformation from using native
 * TabsList/TabsTrigger to custom triggers.
 */

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "../../src/components/ui/tabs";

// ============================================================================
// BEFORE: Using Native Triggers
// ============================================================================

export function BeforeExample() {
  return (
    <Tabs defaultValue="general">
      {/* Native trigger system */}
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      {/* Content */}
      <TabsContentWrapper>
        <TabsContent value="general">
          <div>General settings content</div>
        </TabsContent>
        <TabsContent value="privacy">
          <div>Privacy settings content</div>
        </TabsContent>
        <TabsContent value="notifications">
          <div>Notification settings content</div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// AFTER: Using Custom Triggers
// ============================================================================

// Step 1: Create your custom trigger component
function SettingsTrigger({
  value,
  icon,
  label,
  description,
}: {
  value: string;
  icon: string;
  label: string;
  description: string;
}) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <div
          className={`font-semibold ${isActive ? "text-blue-700" : "text-gray-900"}`}
        >
          {label}
        </div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </button>
  );
}

// Step 2: Use it in your component
export function AfterExample() {
  return (
    <Tabs defaultValue="general">
      {/* Custom triggers - much more powerful! */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SettingsTrigger
          value="general"
          icon="⚙️"
          label="General"
          description="Basic app settings"
        />
        <SettingsTrigger
          value="privacy"
          icon="🔒"
          label="Privacy"
          description="Security & privacy"
        />
        <SettingsTrigger
          value="notifications"
          icon="🔔"
          label="Notifications"
          description="Alert preferences"
        />
      </div>

      {/* Content stays the same! */}
      <TabsContentWrapper>
        <TabsContent value="general">
          <div>General settings content</div>
        </TabsContent>
        <TabsContent value="privacy">
          <div>Privacy settings content</div>
        </TabsContent>
        <TabsContent value="notifications">
          <div>Notification settings content</div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// PROGRESSIVE ENHANCEMENT: Start Simple, Add Features
// ============================================================================

// Level 1: Minimal custom trigger
export function MinimalCustom() {
  function SimpleTrigger({ value, label }: { value: string; label: string }) {
    const { setActiveTab } = useTabs();
    return <button onClick={() => setActiveTab(value)}>{label}</button>;
  }

  return (
    <Tabs defaultValue="tab1">
      <SimpleTrigger value="tab1" label="Tab 1" />
      <SimpleTrigger value="tab2" label="Tab 2" />

      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// Level 2: Add active state styling
export function StyledCustom() {
  function StyledTrigger({ value, label }: { value: string; label: string }) {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;

    return (
      <button
        onClick={() => setActiveTab(value)}
        className={isActive ? "active-tab" : "inactive-tab"}
      >
        {label}
      </button>
    );
  }

  return (
    <Tabs defaultValue="tab1">
      <StyledTrigger value="tab1" label="Tab 1" />
      <StyledTrigger value="tab2" label="Tab 2" />

      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// Level 3: Add icons and descriptions
export function EnhancedCustom() {
  function EnhancedTrigger({
    value,
    icon,
    label,
    description,
  }: {
    value: string;
    icon: string;
    label: string;
    description: string;
  }) {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;

    return (
      <button
        onClick={() => setActiveTab(value)}
        className={`trigger-card ${isActive ? "active" : ""}`}
      >
        <div className="icon">{icon}</div>
        <div className="label">{label}</div>
        <div className="description">{description}</div>
      </button>
    );
  }

  return (
    <Tabs defaultValue="tab1">
      <EnhancedTrigger
        value="tab1"
        icon="📊"
        label="Analytics"
        description="View your stats"
      />
      <EnhancedTrigger
        value="tab2"
        icon="🎨"
        label="Design"
        description="Customize appearance"
      />

      <TabsContentWrapper>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// DIFFERENT LAYOUTS: Same Logic, Different UI
// ============================================================================

// Vertical sidebar layout
export function SidebarLayout() {
  function SidebarItem({ value, label }: { value: string; label: string }) {
    const { activeTab, setActiveTab } = useTabs();
    return (
      <div
        onClick={() => setActiveTab(value)}
        className={`sidebar-item ${activeTab === value ? "active" : ""}`}
      >
        {label}
      </div>
    );
  }

  return (
    <Tabs defaultValue="home">
      <div className="flex">
        <aside className="w-64">
          <SidebarItem value="home" label="Home" />
          <SidebarItem value="profile" label="Profile" />
          <SidebarItem value="settings" label="Settings" />
        </aside>

        <main className="flex-1">
          <TabsContentWrapper>
            <TabsContent value="home">Home Page</TabsContent>
            <TabsContent value="profile">Profile Page</TabsContent>
            <TabsContent value="settings">Settings Page</TabsContent>
          </TabsContentWrapper>
        </main>
      </div>
    </Tabs>
  );
}

// Dropdown-style layout
export function DropdownLayout() {
  function DropdownTrigger() {
    const { activeTab, setActiveTab } = useTabs();

    return (
      <select
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
        className="form-select"
      >
        <option value="overview">Overview</option>
        <option value="details">Details</option>
        <option value="history">History</option>
      </select>
    );
  }

  return (
    <Tabs defaultValue="overview">
      <div className="mb-4">
        <label>Select View: </label>
        <DropdownTrigger />
      </div>

      <TabsContentWrapper>
        <TabsContent value="overview">Overview Content</TabsContent>
        <TabsContent value="details">Details Content</TabsContent>
        <TabsContent value="history">History Content</TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// Icon-only mobile navigation
export function MobileNavLayout() {
  function NavIcon({
    value,
    icon,
    label,
  }: {
    value: string;
    icon: string;
    label: string;
  }) {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;

    return (
      <button
        onClick={() => setActiveTab(value)}
        className={`nav-icon ${isActive ? "active" : ""}`}
      >
        <div className="icon">{icon}</div>
        <div className="label">{label}</div>
      </button>
    );
  }

  return (
    <Tabs defaultValue="home">
      <TabsContentWrapper>
        <TabsContent value="home">Home Screen</TabsContent>
        <TabsContent value="search">Search Screen</TabsContent>
        <TabsContent value="notifications">Notifications Screen</TabsContent>
        <TabsContent value="profile">Profile Screen</TabsContent>
      </TabsContentWrapper>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        <NavIcon value="home" icon="🏠" label="Home" />
        <NavIcon value="search" icon="🔍" label="Search" />
        <NavIcon value="notifications" icon="🔔" label="Alerts" />
        <NavIcon value="profile" icon="👤" label="Profile" />
      </nav>
    </Tabs>
  );
}

// ============================================================================
// KEY TAKEAWAY
// ============================================================================

/*

THE MIGRATION CHECKLIST:

1. ❌ Remove <TabsList>
2. ❌ Remove <TabsTrigger>
3. ✅ Keep <Tabs>
4. ✅ Keep <TabsContentWrapper>
5. ✅ Keep <TabsContent>
6. ✅ Create custom trigger component
7. ✅ Use useTabs() hook in your trigger
8. ✅ Call setActiveTab() on click/change
9. ✅ Check activeTab for styling

WHAT STAYS:
- The Tabs wrapper
- The TabsContentWrapper
- All TabsContent components
- The value matching system

WHAT CHANGES:
- How triggers look
- How triggers are arranged
- How triggers behave
- Complete control is yours!

*/
