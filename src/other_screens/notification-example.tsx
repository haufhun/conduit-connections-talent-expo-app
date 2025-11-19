// app/index.tsx
import { useNotifications } from "@/providers/notifications-provider";
import React from "react";
import { Button, Text, View } from "react-native";

export default function Home() {
  const {
    expoPushToken,
    lastNotification,
    requestPermissions,
    sendTestNotification,
  } = useNotifications();

  return (
    <View
      style={{
        flex: 1,
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Expo Push Token: {expoPushToken ?? "Not registered"}</Text>
      <Text>
        Last notification:{" "}
        {lastNotification
          ? JSON.stringify(lastNotification.request.content)
          : "None"}
      </Text>
      <Button title="Request Permissions" onPress={requestPermissions} />
      <Button
        title="Send Test Notification"
        onPress={() =>
          sendTestNotification("Hello", "This is a test", { screen: "details" })
        }
      />
    </View>
  );
}
