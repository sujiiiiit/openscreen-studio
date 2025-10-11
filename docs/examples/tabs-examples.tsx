/**
 * Examples of using the Tabs component with different patterns
 */

import { useState } from "react";
import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  TabsList,
  TabsTrigger,
  useTabs,
} from "../../src/components/ui/tabs";

// ============================================================================
// Example 1: Standard Usage (Native Triggers)
// ============================================================================
export function StandardTabsExample() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContentWrapper>
        <TabsContent value="overview">
          <div>Overview content</div>
        </TabsContent>
        <TabsContent value="analytics">
          <div>Analytics content</div>
        </TabsContent>
        <TabsContent value="settings">
          <div>Settings content</div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// Example 2: Custom Triggers with useTabs Hook
// ============================================================================

// Custom trigger component using the useTabs hook
function CustomTabButton({ value, children, icon }: { value: string; children: React.ReactNode; icon?: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
        isActive 
          ? "bg-blue-500 text-white shadow-lg scale-105" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {icon && <span>{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  );
}

export function CustomTriggersExample() {
  return (
    <Tabs defaultValue="video">
      {/* Custom trigger section - no TabsList needed! */}
      <div className="flex gap-3">
        <CustomTabButton value="video" icon="🎥">
          Video Settings
        </CustomTabButton>
        <CustomTabButton value="audio" icon="🎵">
          Audio Settings
        </CustomTabButton>
        <CustomTabButton value="output" icon="💾">
          Output Settings
        </CustomTabButton>
      </div>

      {/* Standard content wrapper */}
      <TabsContentWrapper>
        <TabsContent value="video">
          <div className="p-4 border rounded">Video configuration...</div>
        </TabsContent>
        <TabsContent value="audio">
          <div className="p-4 border rounded">Audio configuration...</div>
        </TabsContent>
        <TabsContent value="output">
          <div className="p-4 border rounded">Output configuration...</div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

// ============================================================================
// Example 3: Completely Custom Layout
// ============================================================================

// Sidebar navigation using tabs
function SidebarNav() {
  const { activeTab, setActiveTab } = useTabs();

  const navItems = [
    { value: "dashboard", label: "Dashboard", icon: "📊" },
    { value: "projects", label: "Projects", icon: "📁" },
    { value: "team", label: "Team", icon: "👥" },
    { value: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav className="w-64 bg-gray-50 p-4 space-y-2">
      {navItems.map((item) => (
        <button
          key={item.value}
          onClick={() => setActiveTab(item.value)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors ${
            activeTab === item.value
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function SidebarLayoutExample() {
  return (
    <Tabs defaultValue="dashboard">
      <div className="flex h-screen">
        {/* Custom sidebar navigation */}
        <SidebarNav />

        {/* Main content area */}
        <main className="flex-1 p-8">
          <TabsContentWrapper>
            <TabsContent value="dashboard">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p>Dashboard content goes here...</p>
            </TabsContent>
            <TabsContent value="projects">
              <h1 className="text-2xl font-bold mb-4">Projects</h1>
              <p>Projects content goes here...</p>
            </TabsContent>
            <TabsContent value="team">
              <h1 className="text-2xl font-bold mb-4">Team</h1>
              <p>Team content goes here...</p>
            </TabsContent>
            <TabsContent value="settings">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p>Settings content goes here...</p>
            </TabsContent>
          </TabsContentWrapper>
        </main>
      </div>
    </Tabs>
  );
}

// ============================================================================
// Example 4: Controlled Mode with External State
// ============================================================================

export function ControlledTabsExample() {
  const [activeTab, setActiveTab] = useState("step1");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleNext = () => {
    if (!completedSteps.includes(activeTab)) {
      setCompletedSteps([...completedSteps, activeTab]);
    }

    if (activeTab === "step1") setActiveTab("step2");
    else if (activeTab === "step2") setActiveTab("step3");
  };

  const canProceed = (step: string) => {
    if (step === "step1") return true;
    if (step === "step2") return completedSteps.includes("step1");
    if (step === "step3") return completedSteps.includes("step2");
    return false;
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="step1">
        {/* Custom stepper UI */}
        <div className="flex justify-between mb-8">
          {["step1", "step2", "step3"].map((step, index) => (
            <button
              key={step}
              onClick={() => canProceed(step) && setActiveTab(step)}
              disabled={!canProceed(step)}
              className={`flex items-center gap-2 ${
                !canProceed(step) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeTab === step
                    ? "bg-blue-500 text-white"
                    : completedSteps.includes(step)
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                }`}
              >
                {completedSteps.includes(step) ? "✓" : index + 1}
              </div>
              <span>Step {index + 1}</span>
            </button>
          ))}
        </div>

        <TabsContentWrapper>
          <TabsContent value="step1">
            <div className="p-6 border rounded">
              <h2 className="text-xl mb-4">Step 1: Basic Info</h2>
              <p>Enter your basic information...</p>
              <button
                onClick={handleNext}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            </div>
          </TabsContent>
          <TabsContent value="step2">
            <div className="p-6 border rounded">
              <h2 className="text-xl mb-4">Step 2: Details</h2>
              <p>Enter additional details...</p>
              <button
                onClick={handleNext}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            </div>
          </TabsContent>
          <TabsContent value="step3">
            <div className="p-6 border rounded">
              <h2 className="text-xl mb-4">Step 3: Review</h2>
              <p>Review and submit...</p>
              <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
                Submit
              </button>
            </div>
          </TabsContent>
        </TabsContentWrapper>
      </Tabs>

      {/* External controls */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          External state: Current tab = {activeTab}, Completed = [
          {completedSteps.join(", ")}]
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Mixed - Some Custom, Some Native Triggers
// ============================================================================

function QuickAccessButtons() {
  const { setActiveTab } = useTabs();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab("help")}
        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded"
      >
        Need Help?
      </button>
      <button
        onClick={() => setActiveTab("shortcuts")}
        className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded"
      >
        Keyboard Shortcuts
      </button>
    </div>
  );
}

export function MixedTriggersExample() {
  return (
    <Tabs defaultValue="editor">
      <div className="flex justify-between items-center mb-4">
        {/* Native tab triggers */}
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        {/* Custom quick access buttons */}
        <QuickAccessButtons />
      </div>

      <TabsContentWrapper>
        <TabsContent value="editor">
          <div>Editor view...</div>
        </TabsContent>
        <TabsContent value="preview">
          <div>Preview view...</div>
        </TabsContent>
        <TabsContent value="code">
          <div>Code view...</div>
        </TabsContent>
        <TabsContent value="help">
          <div>Help documentation...</div>
        </TabsContent>
        <TabsContent value="shortcuts">
          <div>Keyboard shortcuts reference...</div>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
