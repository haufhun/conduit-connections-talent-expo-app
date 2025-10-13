import { useCreateTalentBlockout } from "@/api/blockouts_api";
import RecurringScheduleCard from "@/components/schedule/RecurringScheduleCard";
import ScheduleDateTimeCard from "@/components/schedule/ScheduleDateTimeCard";
import ScheduleDescriptionCard from "@/components/schedule/ScheduleDescriptionCard";
import ScheduleTitleCard from "@/components/schedule/ScheduleTitleCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  CreateBlockoutInput,
  createBlockoutSchema,
} from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default function CreateBlockoutScreen() {
  const router = useRouter();
  const { mutateAsync: createBlockout } = useCreateTalentBlockout();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(createBlockoutSchema),
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

  const isAllDay = watch("is_all_day");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const currentRRule = watch("rrule");

  const onSubmit = async (data: CreateBlockoutInput) => {
    try {
      await createBlockout({
        title: data.title,
        description: data.description || undefined,
        start_time: data.start_time,
        end_time: data.end_time,
        timezone: data.timezone,
        is_all_day: data.is_all_day || false,
        rrule: data.rrule && data.rrule !== "NONE" ? data.rrule : undefined,
      });

      router.back();
    } catch {
      Alert.alert("Error", "Failed to create blockout");
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-6">
          {/* Header Card */}
          <VStack
            space="sm"
            className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm"
          >
            <Text size="xl" bold className="text-typography-900 mb-2">
              Create New Blockout
            </Text>
            <Text className="text-typography-600">
              Block out time when you&apos;re unavailable for gigs
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
            startTime={startTime}
            endTime={endTime}
            currentRRule={currentRRule || ""}
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
                {isSubmitting ? "Creating..." : "Create Blockout"}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>

        {/* Bottom padding */}
        <VStack className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
