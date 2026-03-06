import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { JobProvider } from "./src/context/JobContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import Navigation from "./src/navigation";

function AppShell() {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.colors.backgroundGradient}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <JobProvider>
          <Navigation />
        </JobProvider>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
