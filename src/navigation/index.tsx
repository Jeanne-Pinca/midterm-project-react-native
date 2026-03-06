import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useSlidingTabIndicator } from "./hooks/useSlidingTabIndicator";

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
const ACTIVE_LINE_WIDTH = 100;

function SlidingTabBar(props: BottomTabBarProps) {
  const { theme } = useTheme();
  const { onBarLayout, indicatorStyle } = useSlidingTabIndicator({
    activeIndex: props.state.index,
    tabCount: props.state.routes.length,
    indicatorWidth: ACTIVE_LINE_WIDTH,
  });

  return (
    <View onLayout={onBarLayout}>
      <Animated.View
        pointerEvents="none"
        style={[
          tabStyles.activeLine,
          { backgroundColor: "#e7a7f0" },
          indicatorStyle,
        ]}
      />
      <BottomTabBar
        {...props}
        style={[
          {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
      />
    </View>
  );
}

function renderTabIcon(
  iconName: keyof typeof MaterialCommunityIcons.glyphMap,
  color: string,
  size: number,
) {
  return (
    <View style={tabStyles.iconWrap}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </View>
  );
}

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <SlidingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        tabBarActiveTintColor: "#e7a7f0",
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontWeight: "600",
        },
        sceneStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Tab.Screen
        name="Finder"
        component={FinderScreen}
        options={{
          title: "Job Finder",
          tabBarIcon: ({ color, size }) =>
            renderTabIcon("briefcase-search", color, size),
        }}
      />
      <Tab.Screen
        name="SavedJobs"
        component={SavedJobsScreen}
        options={{
          title: "Saved Jobs",
          tabBarIcon: ({ color, size }) =>
            renderTabIcon("bookmark", color, size),
        }}
      />
      <Tab.Screen
        name="AppliedJobs"
        component={AppliedJobsScreen}
        options={{
          title: "Applied Jobs",
          tabBarIcon: ({ color, size }) =>
            renderTabIcon("file-document-check", color, size),
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  activeLine: {
    position: "absolute",
    top: 0,
    height: 3,
    borderRadius: 999,
    zIndex: 10,
  },
});

export default function Navigation() {
  const { isDarkMode, theme } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(isDarkMode ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
        primary: "#e7a7f0",
        background: "transparent",
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
      },
    }),
    [
      isDarkMode,
      theme.colors.border,
      theme.colors.surface,
      theme.colors.textPrimary,
    ],
  );

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
