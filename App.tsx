import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { JobProvider } from "./src/context/JobContext";
import Navigation from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <JobProvider>
          <Navigation />
        </JobProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
