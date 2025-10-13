import {
  useDeleteTalentBlockout,
  useGetTalentBlockoutById,
  useUpdateTalentBlockout,
} from "@/api/blockouts_api";
import RecurringScheduleCard from "@/components/schedule/RecurringScheduleCard";
import ScheduleDateTimeCard from "@/components/schedule/ScheduleDateTimeCard";
import ScheduleDescriptionCard from "@/components/schedule/ScheduleDescriptionCard";
import ScheduleTitleCard from "@/components/schedule/ScheduleTitleCard";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { canEditBlockout } from "@/utils/blockout-permissions";
import { getDayjsFromUtcDateString } from "@/utils/date";
import {
  createRRuleFromOptions,
  getRRuleOptions,
  updateBlockoutSchema,
} from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RRule } from "rrule";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditBlockoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const blockoutId = params.id ? parseInt(params.id) : 0;

  const {
    data: blockout,
    isLoading,
    error,
  } = useGetTalentBlockoutById(blockoutId, !!blockoutId);
  const { mutateAsync: updateBlockout } = useUpdateTalentBlockout();
  const { mutateAsync: deleteBlockout, isPending } = useDeleteTalentBlockout();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(updateBlockoutSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: dayjs.utc().startOf("hour").add(1, "hour").toISOString(),
      end_time: dayjs.utc().startOf("hour").add(2, "hour").toISOString(),
      timezone: dayjs.tz.guess(),
      is_all_day: false,
      rrule: undefined,
    },
  });

  // Update form when blockout data is loaded
  useEffect(() => {
    if (blockout) {
      // Convert rrule string from database to RRuleOptions
      let rruleOptions = null;
      if (blockout.rrule) {
        try {
          const rule = RRule.fromString(blockout.rrule);
          rruleOptions = getRRuleOptions(rule);
        } catch (error) {
          console.warn("Failed to parse RRULE:", error);
        }
      }

      reset({
        title: blockout.title,
        description: blockout.description || "",
        start_time: getDayjsFromUtcDateString(
          blockout.start_time
        ).toISOString(),
        end_time: getDayjsFromUtcDateString(blockout.end_time).toISOString(),
        timezone: blockout.timezone,
        is_all_day: blockout.is_all_day,
        rrule: rruleOptions,
      });
    }
  }, [blockout, reset]);

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

  // Check if blockout can be edited (end time must be in the future)
  const canEdit = blockout ? canEditBlockout(blockout) : false;

  const isAllDay = watch("is_all_day");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const currentRRule = watch("rrule");

  // Handle loading and error states
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

  // Check if blockout can be edited
  if (!canEdit) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
        <VStack className="flex-1 justify-center items-center p-6" space="md">
          <VStack
            className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
            space="md"
          >
            <Text className="text-typography-900 font-semibold text-lg text-center">
              Cannot Edit Blockout
            </Text>
            <Text className="text-typography-600 text-center">
              This blockout cannot be edited because it has already ended.
            </Text>
            <Text className="text-typography-500 text-center text-sm">
              Blockouts can only be edited if their end time is in the future.
            </Text>
            <Button
              onPress={() => router.back()}
              action="secondary"
              className="mt-2"
            >
              <ButtonText>Go Back</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: any) => {
    try {
      if (!blockoutId) {
        Alert.alert("Error", "Blockout ID is missing");
        return;
      }

      // Convert RRuleOptions to string for API
      let rruleString: string | undefined = undefined;
      if (data.rrule) {
        const rule = createRRuleFromOptions(data.rrule);
        rruleString = rule.toString(); // Make sure we get the DTSTART and the RRULE part
      }

      await updateBlockout({
        blockoutId,
        updates: {
          title: data.title,
          description: data.description || undefined,
          start_time: data.start_time,
          end_time: data.end_time,
          timezone: data.timezone,
          is_all_day: data.is_all_day || false,
          rrule: rruleString,
        },
      });

      router.back();
    } catch {
      Alert.alert("Error", "Failed to update blockout");
    }
  };

  return (
    <>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
        <Stack.Screen
          options={{
            title: "Edit Blockout",
            headerRight: canEdit ? deleteButton : undefined,
          }}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <VStack space="lg" className="p-6">
            {/* Header Card */}
            <VStack
              space="sm"
              className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm"
            >
              <Text size="xl" bold className="text-typography-900 mb-2">
                Edit Blockout
              </Text>
              <Text className="text-typography-600">
                Update your blockout details
              </Text>
            </VStack>

            {/* Title Card */}
            <ScheduleTitleCard control={control} />

            {/* Description Card */}
            <ScheduleDescriptionCard control={control} />

            {/* All Day & Date/Time Card */}
            <ScheduleDateTimeCard
              control={control}
              setValue={setValue}
              isAllDay={isAllDay ?? false}
            />

            {/* Recurring Card */}
            <RecurringScheduleCard
              control={control}
              setValue={setValue}
              startTime={startTime || dayjs.utc().toISOString()}
              endTime={endTime || dayjs.utc().toISOString()}
              currentRRule={currentRRule || null}
              errors={errors}
            />

            {/* Submit Button Card */}
            <VStack className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm">
              <Button
                size="lg"
                variant="solid"
                action="primary"
                onPress={handleSubmit(onSubmit)}
                isDisabled={isSubmitting}
                className="rounded-xl"
              >
                <ButtonText className="font-semibold">
                  {isSubmitting ? "Updating..." : "Update Blockout"}
                </ButtonText>
              </Button>
            </VStack>
          </VStack>

          {/* Bottom padding */}
          <VStack className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
