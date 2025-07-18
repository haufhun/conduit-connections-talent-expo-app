import { useCreateTalentBlockout } from "@/api/blockouts_api";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon, CheckIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { getDayjsFromUtcDateString } from "@/utils/date";
import {
  CreateBlockoutInput,
  createBlockoutSchema,
} from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
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
      is_all_day: false,
      is_recurring: false,
      rrule: "",
      metadata: {},
    },
  });

  const isAllDay = watch("is_all_day");
  const isRecurring = watch("is_recurring");
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  useEffect(() => {
    if (isAllDay) {
      const currentStartTime = getDayjsFromUtcDateString(startTime);
      const currentEndTime = getDayjsFromUtcDateString(endTime);

      const startOfDay = currentStartTime.startOf("day");
      const endOfDay = currentEndTime.endOf("day");
      setValue("start_time", startOfDay.utc().toISOString());
      setValue("end_time", endOfDay.utc().toISOString());
    }
  }, [isAllDay, startTime, endTime, setValue]);

  // Memoized callback to prevent infinite re-renders
  const handleRRuleChange = useCallback(
    (rrule: string) => setValue("rrule", rrule),
    [setValue]
  );

  // Memoized startDate to prevent infinite re-renders in RecurringScheduleForm
  const memoizedStartDate = useMemo(
    () => getDayjsFromUtcDateString(startTime).toDate(),
    [startTime]
  );

  const onSubmit = async (data: CreateBlockoutInput) => {
    try {
      await createBlockout({
        title: data.title,
        description: data.description || undefined,
        start_time: data.start_time,
        end_time: data.end_time,
        is_all_day: data.is_all_day || false,
        is_recurring: data.is_recurring || false,
        rrule: data.is_recurring ? data.rrule : undefined,
        metadata: data.metadata || {},
      });

      router.back();
    } catch (error) {
      console.error("Error creating blockout:", error);
      Alert.alert("Error", "Failed to create blockout");
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary pb-[50px]">
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-[20px]">
          <VStack space="sm">
            <Text className="text-typography-600">
              Block out time when you&apos;re unavailable for gigs
            </Text>
          </VStack>

          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormControlLabel>
                  <FormControlLabelText>Title</FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder="Enter blockout title..."
                    value={value}
                    onChangeText={onChange}
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormControlLabel>
                  <FormControlLabelText>Description</FormControlLabelText>
                </FormControlLabel>
                <Textarea size="lg" className="min-h-[100px]">
                  <TextareaInput
                    placeholder="Add a description (optional)..."
                    value={value ?? ""}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </Textarea>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="is_all_day"
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <Checkbox
                  size="md"
                  value="all_day"
                  isChecked={value}
                  onChange={onChange}
                  aria-label="All day event"
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>All Day</CheckboxLabel>
                </Checkbox>
              </FormControl>
            )}
          />

          <DateRangePicker
            control={control}
            setValue={setValue}
            startTimeFieldName="start_time"
            endTimeFieldName="end_time"
            isAllDay={isAllDay}
          />

          <Controller
            control={control}
            name="is_recurring"
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <Checkbox
                  size="md"
                  value="recurring"
                  isChecked={value}
                  onChange={onChange}
                  aria-label="Recurring event"
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>Recurring</CheckboxLabel>
                </Checkbox>
              </FormControl>
            )}
          />

          {isRecurring && (
            <RecurringScheduleForm
              startDate={memoizedStartDate}
              onRRuleChange={handleRRuleChange}
              initialRRule={watch("rrule") || ""}
            />
          )}

          <Button
            size="lg"
            variant="solid"
            action="primary"
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
          >
            <ButtonText>
              {isSubmitting ? "Creating..." : "Create Blockout"}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
