import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="skill/create"
        options={{
          title: "Add New Skill",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="skill/select"
        options={{
          title: "Select Skill",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="skill/[id]"
        options={{
          title: "",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
