import { JobProvider } from "./src/context/JobContext";
import Navigation from "./src/navigation";

export default function App() {
  return (
    <JobProvider>
      <Navigation />
    </JobProvider>
  );
}
