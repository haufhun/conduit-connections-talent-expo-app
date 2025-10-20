import { useCreateTalentBlockout } from "@/api/blockouts_api";
import ScheduleDateTimeCard from "@/components/schedule/ScheduleDateTimeCard";
import ScheduleDescriptionCard from "@/components/schedule/ScheduleDescriptionCard";
import ScheduleRecurringCard from "@/components/schedule/ScheduleRecurringCard";
import ScheduleTitleCard from "@/components/schedule/ScheduleTitleCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  convertRecurringScheduleToRRule,
  CreateBlockoutInput,
  createBlockoutSchema,
} from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import moment from "moment-timezone";
import { useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateBlockoutScreen() {
  const router = useRouter();
  const { mutateAsync: createBlockout } = useCreateTalentBlockout();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(createBlockoutSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: moment.utc().startOf("hour").add(1, "hour").toISOString(),
      end_time: moment.utc().startOf("hour").add(2, "hour").toISOString(),
      timezone: moment.tz.guess(),
      is_all_day: false,
      recurringSchedule: null,
    },
  });

  const isAllDay = watch("is_all_day");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const currentRecurringSchedule = watch("recurringSchedule");

  const onSubmit = async (data: CreateBlockoutInput) => {
    console.log("Creating blockout with data:", data);

    try {
      // Convert RecurringScheduleOptions to RRULE string for API
      let rruleString: string | undefined = undefined;
      if (data.recurringSchedule) {
        const startDate = moment(data.start_time).toDate();
        rruleString = convertRecurringScheduleToRRule(
          data.recurringSchedule,
          startDate
        );
      }

      await createBlockout({
        title: data.title,
        description: data.description || undefined,
        start_time: data.start_time,
        end_time: data.end_time,
        timezone: data.timezone,
        is_all_day: data.is_all_day || false,
        rrule: rruleString,
      });

      router.back();
    } catch {
      Alert.alert("Error", "Failed to create blockout");
    }
  };

  console.log("form recurringSchedule: ", currentRecurringSchedule);

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
          <ScheduleRecurringCard
            control={control}
            setValue={setValue}
            startTime={startTime}
            endTime={endTime}
            currentRecurringSchedule={currentRecurringSchedule as any}
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
