import {
  useDeleteTalentBlockout,
  useGetTalentBlockoutById,
} from "@/api/blockouts_api";
import EditScheduleForm from "@/components/schedule/EditScheduleForm";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { canEditBlockout } from "@/utils/blockout-permissions";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBlockoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
  }>();
  const { mutateAsync: deleteBlockout, isPending } = useDeleteTalentBlockout();

  const blockoutId = params.id ? parseInt(params.id) : 0;

  const {
    data: blockout,
    isLoading,
    error,
  } = useGetTalentBlockoutById(blockoutId, !!blockoutId);

  // Check if blockout can be edited (end time must be in the future)
  const canEdit = blockout ? canEditBlockout(blockout) : false;

  const deleteButton = () => (
    <Button
      size="md"
      variant="link"
      action="negative"
      onPress={() => {
        Alert.alert(
          "Delete Blockout",
          "Are you sure you want to delete this blockout? This action cannot be undone.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                await deleteBlockout(blockoutId);
                router.back();
              },
            },
          ]
        );
      }}
      className="mr-2"
    >
      {isPending ? <ButtonSpinner /> : <ButtonIcon as={Trash2} />}
    </Button>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
        <VStack className="flex-1 justify-center items-center p-6">
          <VStack className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm">
            <Text className="text-typography-600">
              Loading blockout details...
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error || !blockout) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
        <VStack className="flex-1 justify-center items-center p-6" space="md">
          <VStack className="bg-white rounded-2xl p-6 border border-error-200 shadow-sm">
            <Text className="text-error-600 text-center font-medium mb-4">
              Error loading blockout details
            </Text>
            <Button onPress={() => router.back()} action="secondary">
              <ButtonText>Go Back</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
        <Stack.Screen
          options={{
            title: "Edit Blockout",
            headerRight: canEdit ? deleteButton : undefined,
          }}
        />
        <EditScheduleForm blockoutId={blockoutId} blockoutData={blockout} />
      </SafeAreaView>
    </>
  );
}
