import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { CalendarDaysIcon, Icon } from "@/components/ui/icon";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/providers/auth-provider";
import { CircleUserRound } from "lucide-react-native";

export default function TabLayout() {
  const { session, mounting } = useAuth();
  const colorScheme = useColorScheme();

  if (mounting) {
    return <ActivityIndicator size="large" />;
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Icon as={CircleUserRound} className="h-8 w-8" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <Icon as={CalendarDaysIcon} className="h-8 w-8" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
