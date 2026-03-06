import {
    createContext,
    createElement,
    ReactNode,
    useContext,
    useMemo,
} from "react";

type AppTheme = {
  colors: {
    backgroundGradient: [string, string, ...string[]];
  };
};

type ThemeContextValue = {
  theme: AppTheme;
};

const lightTheme: AppTheme = {
  colors: {
    backgroundGradient: ["#f8fafc", "#eef2ff", "#fdf4ff"],
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      theme: lightTheme,
    }),
    [],
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
