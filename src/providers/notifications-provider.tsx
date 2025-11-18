// app/providers/NotificationsProvider.tsx
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

type NotificationsContextValue = {
  expoPushToken: string | null;
  lastNotification: Notifications.Notification | null;
  requestPermissions: () => Promise<void>;
  sendTestNotification: (
    title?: string,
    body?: string,
    data?: Record<string, any>
  ) => Promise<void>;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getExpoPushToken(): Promise<string> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    throw new Error("Must use physical device for push notifications");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    throw new Error(
      "Permission not granted to get push token for push notification"
    );
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    throw new Error(
      "Project ID not found. Ensure EAS projectId is available in Constants."
    );
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListenerRef = useRef<Notifications.Subscription | null>(
    null
  );
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Kick off registration on mount
    getExpoPushToken()
      .then((token) => setExpoPushToken(token))
      .catch((err) => {
        console.warn("Push registration failed:", err);
        setExpoPushToken(null);
      });

    // Listen for foreground notifications
    notificationListenerRef.current =
      Notifications.addNotificationReceivedListener((n) => {
        setLastNotification(n);
      });

    // Listen for user responses (taps) to notifications
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((r) => {
        // You can route/navigation here using r.notification.request.content.data
        // Example: Router.push based on a "screen" field in data
        console.log("Notification response:", r);
      });

    return () => {
      notificationListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const token = await getExpoPushToken();
      setExpoPushToken(token);
    } catch (err) {
      console.warn("Permission request failed:", err);
      throw err;
    }
  }, []);

  const sendTestNotification = useCallback(
    async (
      title = "Test Notification",
      body = "Hello from NotificationsProvider",
      data: Record<string, any> = {}
    ) => {
      if (!expoPushToken) {
        throw new Error(
          "No Expo push token yet. Ensure permissions are granted and registration completed."
        );
      }

      const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data,
      };

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to send test notification: ${res.status} ${text}`
        );
      }
    },
    [expoPushToken]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      expoPushToken,
      lastNotification,
      requestPermissions,
      sendTestNotification,
    }),
    [expoPushToken, lastNotification, requestPermissions, sendTestNotification]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return ctx;
}
