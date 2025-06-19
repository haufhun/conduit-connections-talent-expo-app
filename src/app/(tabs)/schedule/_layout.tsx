import { Stack } from "expo-router";

const ScheduleLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="create"
        options={{
          title: "Create New Blockout",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Blockout",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default ScheduleLayout;
