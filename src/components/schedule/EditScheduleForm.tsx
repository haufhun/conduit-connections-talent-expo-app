import { useUpdateTalentBlockout } from "@/api/blockouts_api";
import ScheduleDateTimeCard from "@/components/schedule/ScheduleDateTimeCard";
import ScheduleDescriptionCard from "@/components/schedule/ScheduleDescriptionCard";
import ScheduleRecurringCard from "@/components/schedule/ScheduleRecurringCard";
import ScheduleTitleCard from "@/components/schedule/ScheduleTitleCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { TalentBlockoutDatabase } from "@/types/blockouts";
import {
  createRRuleFromOptions,
  getRRuleOptions,
  UpdateBlockoutInput,
  updateBlockoutSchema,
} from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { RRule } from "rrule";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
  blockoutData: TalentBlockoutDatabase;
};

const EditScheduleForm = ({ blockoutData }: Props) => {
  const router = useRouter();
  const { mutateAsync: updateBlockout } = useUpdateTalentBlockout();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(updateBlockoutSchema),
    defaultValues: {
      title: blockoutData.title,
      description: blockoutData.description,
      start_time: blockoutData.start_time,
      end_time: blockoutData.end_time,
      timezone: blockoutData.timezone,
      is_all_day: blockoutData.is_all_day,
      rrule: blockoutData.rrule
        ? getRRuleOptions(RRule.fromString(blockoutData.rrule))
        : null,
    },
  });
  const isAllDay = watch("is_all_day");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const currentRRule = watch("rrule");

  const onSubmit = async (data: UpdateBlockoutInput) => {
    try {
      // Convert RRuleOptions to string for API
      let rruleString: string | null = null;
      if (data.rrule) {
        const rule = createRRuleFromOptions(data.rrule);
        rruleString = rule.toString(); // Make sure we get the DTSTART and the RRULE part
      }

      await updateBlockout({
        blockoutId: blockoutData.blockout_id,
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
        <ScheduleRecurringCard
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
  );
};

export default EditScheduleForm;
