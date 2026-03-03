import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppliedJobsScreen from "./screens/AppliedJobsScreen";
import FinderScreen from "./screens/FinderScreen";
import JobDetailsScreen from "./screens/JobDetailsScreen";
import SavedJobsScreen from "./screens/SavedJobsScreen";

const ApplicationFormScreen =
  require("./screens/ApplicationFormScreen").default;

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  JobDetails: { jobId: string };
  ApplicationForm: { jobId: string; source: "jobDetails" | "savedJobs" };
};

export type RootTabParamList = {
  Finder: undefined;
  SavedJobs: undefined;
  AppliedJobs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Finder"
        component={FinderScreen}
        options={{
          title: "Job Finder",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="briefcase-search"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SavedJobs"
        component={SavedJobsScreen}
        options={{
          title: "Saved Jobs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AppliedJobs"
        component={AppliedJobsScreen}
        options={{
          title: "Applied Jobs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="file-document-check"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        <Stack.Screen
          name="ApplicationForm"
          component={ApplicationFormScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
