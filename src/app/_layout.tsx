import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
// import { useColorScheme } from "@/hooks/useColorScheme";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { ToastProvider } from "react-native-toast-notifications";

import "@/global.css";
import { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const colorScheme = "light"; // Default to light theme for now
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        const updateAvail = await Updates.checkForUpdateAsync();
        if (updateAvail.isAvailable) {
          createReloadAppAlert();
          return;
        }
      } catch (e) {
        console.log("Error finding new update");
      }
    }

    prepare();
  }, []);

  const createReloadAppAlert = () => {
    Alert.alert(
      "New Updates Available",
      "There is a new update available. Would you like to reload and use the latest update?",
      [
        // {
        //   text: 'Not Now',
        //   onPress: () => console.log('Cancel Pressed'),
        //   style: 'cancel',
        // },
        {
          text: "Reload",
          onPress: () => Updates.reloadAsync(),
          style: "default",
        },
      ]
    );
  };

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode={colorScheme ?? "light"}>
      <ToastProvider>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              // value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              value={DefaultTheme}
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
