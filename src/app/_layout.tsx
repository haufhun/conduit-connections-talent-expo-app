import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/hooks/useColorScheme";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "react-native-toast-notifications";

import "@/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode={colorScheme ?? "light"}>
      <ToastProvider>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <GestureHandlerRootView>
                <Stack
                  screenOptions={{
                    animation: "slide_from_right",
                    gestureDirection: "horizontal",
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth"
                    options={{
                      headerShown: false,
                      animation: "slide_from_left",
                    }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </GestureHandlerRootView>
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}
