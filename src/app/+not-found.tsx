import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <VStack
        style={styles.container}
        space="lg"
        className="items-center justify-center"
      >
        <Text size="xl" bold>
          This screen does not exist.
        </Text>
        <Link href="/" asChild>
          <Button size="lg" variant="outline" action="primary">
            <ButtonText>Go to home screen!</ButtonText>
          </Button>
        </Link>
      </VStack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
