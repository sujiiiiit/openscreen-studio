import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "electron-theme",
  ...props
}: ThemeProviderProps) {
  const isBrowser = typeof window !== "undefined";

  const getSystemTheme = () =>
    isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const readStoredTheme = () => {
    if (!isBrowser) return null;

    try {
      return window.localStorage.getItem(storageKey) as Theme | null;
    } catch (_) {
      return null;
    }
  };

  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = readStoredTheme();

    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      return storedTheme;
    }

    return defaultTheme;
  });

  useEffect(() => {
    if (!isBrowser) return;

    const root = window.document.documentElement;

    const applyTheme = (targetTheme: Theme) => {
      const resolvedTheme =
        targetTheme === "system" ? getSystemTheme() : targetTheme;

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    };

    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, isBrowser]);

  const value = {
    theme,
    setTheme: (nextTheme: Theme) => {
      if (isBrowser) {
        try {
          window.localStorage.setItem(storageKey, nextTheme);
        } catch (_) {
          // Ignore storage errors
        }
      }

      setThemeState(nextTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
