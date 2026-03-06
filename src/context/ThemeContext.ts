import {
    createContext,
    createElement,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type AppTheme = {
  colors: {
    backgroundGradient: [string, string, ...string[]];
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    surface: string;
    border: string;
    icon: string;
  };
};

type ThemeContextValue = {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleThemeMode: () => void;
};

const lightTheme: AppTheme = {
  colors: {
    backgroundGradient: ["#f8fafc", "#eef2ff", "#fdf4ff"],
    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#6b7280",
    surface: "#ffffff",
    border: "#e5e7eb",
    icon: "#111827",
  },
};

const darkTheme: AppTheme = {
  colors: {
    backgroundGradient: ["#0f172a", "#111827", "#1e1b4b"],
    textPrimary: "#f9fafb",
    textSecondary: "#d1d5db",
    textMuted: "#9ca3af",
    surface: "#1f2937",
    border: "#374151",
    icon: "#f9fafb",
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleThemeMode = useCallback(() => {
    setIsDarkMode((currentValue) => !currentValue);
  }, []);

  const value = useMemo(
    () => ({
      theme: isDarkMode ? darkTheme : lightTheme,
      isDarkMode,
      toggleThemeMode,
    }),
    [isDarkMode, toggleThemeMode],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
