import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import AttendanceScreen from "@/screens/AttendanceScreen";
import WorkersScreen from "@/screens/WorkersScreen";
import SummaryScreen from "@/screens/SummaryScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AddWorkerScreen from "@/screens/AddWorkerScreen";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import UserProfileScreen from "@/screens/UserProfileScreen";

export type MainTabParamList = {
  AttendanceTab: undefined;
  WorkersTab: undefined;
  SummaryTab: undefined;
  SettingsTab: undefined;
  AdminDashboardTab: undefined;
  UserProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddWorker: { workerId?: string } | undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AdminTabs() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="AdminDashboardTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          title: "Admin",
          headerTitle: () => <HeaderTitle title="Admin Panel" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="shield" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: t.tabs.settings,
          headerTitle: t.settings.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function UserTabs() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="AttendanceTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceScreen}
        options={{
          title: t.tabs.attendance,
          headerTitle: () => <HeaderTitle title={t.app.name} />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkersTab"
        component={WorkersScreen}
        options={{
          title: t.tabs.workers,
          headerTitle: t.workers.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SummaryTab"
        component={SummaryScreen}
        options={{
          title: t.tabs.summary,
          headerTitle: t.summary.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfileTab"
        component={UserProfileScreen}
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: t.tabs.settings,
          headerTitle: t.settings.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { userType } = useAuth();

  const isAdmin = userType === "admin";

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={isAdmin ? AdminTabs : UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddWorker"
        component={AddWorkerScreen}
        options={{
          presentation: "modal",
          headerTitle: t.workers.addWorker,
        }}
      />
    </Stack.Navigator>
  );
}
