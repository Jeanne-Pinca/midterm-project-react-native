import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    DefaultTheme,
    NavigationContainer,
    NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ApplicationDetailsScreen from "./screens/ApplicationDetailsScreen";
import ApplicationFormScreen from "./screens/ApplicationFormScreen";
import AppliedJobsScreen from "./screens/AppliedJobsScreen";
import FinderScreen from "./screens/FinderScreen";
import JobDetailsScreen from "./screens/JobDetailsScreen";
import SavedJobsScreen from "./screens/SavedJobsScreen";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  JobDetails: {
    jobId: string;
    source?: "finder" | "savedJobs" | "appliedJobs";
  };
  ApplicationForm: { jobId: string; source: "jobDetails" | "savedJobs" };
  ApplicationDetails: { jobId: string };
};

export type RootTabParamList = {
  Finder: undefined;
  SavedJobs: undefined;
  AppliedJobs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
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
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        <Stack.Screen
          name="ApplicationForm"
          component={ApplicationFormScreen}
        />
        <Stack.Screen
          name="ApplicationDetails"
          component={ApplicationDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
