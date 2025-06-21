import { useCreateTalentBlockout } from "@/api/blockouts_api";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);
// Format date using dayjs in user's timezone
const formatDate = (dateString: string) => {
  return getDayjsFromUtcDateString(dateString).format("ddd, MMM D, YYYY");
};

// Format time using dayjs in user's timezone
const formatTime = (dateString: string) => {
  return getDayjsFromUtcDateString(dateString).format("h:mm A");
};

export default function CreateBlockoutScreen() {
  const router = useRouter();
  const { mutateAsync: createBlockout } = useCreateTalentBlockout();

  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Computed values based on selectedField
  const showStartDatePicker = selectedField === "start-date";
  const showStartTimePicker = selectedField === "start-time";
  const showEndDatePicker = selectedField === "end-date";
  const showEndTimePicker = selectedField === "end-time";

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

  // Clear time field selections when all-day is toggled
  useEffect(() => {
    if (
      isAllDay &&
      (selectedField === "start-time" || selectedField === "end-time")
    ) {
      setSelectedField(null);
    }
  }, [isAllDay, selectedField]);

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

  const handleDateTimeChange = (type: "start" | "end", selectedDate?: Date) => {
    if (!selectedDate) return;

    console.log("selectedDate", selectedDate);

    setValue(
      type === "start" ? "start_time" : "end_time",
      selectedDate.toISOString()
    );

    // // Get current datetime using dayjs and update only the date or time portion
    // // This preserves the user's timezone while updating the selected component
    // const currentTimeValue = type === "start" ? startTime : endTime;
    // const currentDateTime = getDayjsFromUtcDateString(currentTimeValue).tz(
    //   getTimezone()
    // );

    // let updatedDateTime;
    // if (mode === "date") {
    //   // Update only the date part
    //   const selected = getDayjsFromUtcDate(selectedDate);
    //   updatedDateTime = currentDateTime
    //     .year(selected.year())
    //     .month(selected.month())
    //     .date(selected.date());
    // } else {
    //   // Update only the time part
    //   const selected = getDayjsFromUtcDate(selectedDate);
    //   updatedDateTime = currentDateTime
    //     .hour(selected.hour())
    //     .minute(selected.minute());
    // }

    // setValue(
    //   type === "start" ? "start_time" : "end_time",
    //   updatedDateTime.toISOString()
    // );

    // // Auto-adjust times to maintain valid start < end relationship
    // if (type === "start") {
    //   const currentEndTime = getDayjsFromUtcDateString(endTime);
    //   if (
    //     updatedDateTime.isAfter(currentEndTime) ||
    //     updatedDateTime.isSame(currentEndTime)
    //   ) {
    //     // Set end time to 1 hour after the new start time
    //     const newEndTime = updatedDateTime.add(1, "hour");
    //     setValue("end_time", newEndTime.toISOString());
    //   }
    // } else if (type === "end") {
    //   const currentStartTime = getDayjsFromUtcDateString(startTime);
    //   if (
    //     updatedDateTime.isBefore(currentStartTime) ||
    //     updatedDateTime.isSame(currentStartTime)
    //   ) {
    //     // Set start time to 1 hour before the new end time
    //     const newStartTime = updatedDateTime.subtract(1, "hour");
    //     setValue("start_time", newStartTime.toISOString());
    //   }
    // }

    // Don't clear selected field - let user manually deselect
  };

  const handleFieldPress = (fieldType: string) => {
    // Toggle selection or select new field
    if (selectedField === fieldType) {
      setSelectedField(null);
    } else {
      setSelectedField(fieldType);
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

          <VStack space="md">
            <Controller
              control={control}
              name="start_time"
              render={({ field: { value }, fieldState: { error } }) => (
                <FormControl isInvalid={Boolean(error)}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      Start {isAllDay ? "Date" : "Date & Time"}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <HStack space="sm">
                    <Button
                      size="lg"
                      variant={
                        selectedField === "start-date" ? "solid" : "outline"
                      }
                      className="flex-1"
                      onPress={() => handleFieldPress("start-date")}
                    >
                      <ButtonText>{formatDate(value)}</ButtonText>
                    </Button>
                    {!isAllDay && (
                      <Button
                        size="lg"
                        variant={
                          selectedField === "start-time" ? "solid" : "outline"
                        }
                        className="flex-1"
                        onPress={() => handleFieldPress("start-time")}
                      >
                        <ButtonText>{formatTime(value)}</ButtonText>
                      </Button>
                    )}
                  </HStack>

                  {/* Date/Time Picker positioned directly below start time fields */}
                  {selectedField === "start-date" && showStartDatePicker && (
                    <VStack className="items-center mt-4">
                      <DateTimePicker
                        value={new Date(startTime)}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_event, selectedDate) =>
                          handleDateTimeChange("start", selectedDate)
                        }
                      />
                    </VStack>
                  )}

                  {selectedField === "start-time" &&
                    showStartTimePicker &&
                    !isAllDay && (
                      <VStack className="items-center mt-4">
                        <DateTimePicker
                          value={new Date(startTime)}
                          mode="time"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={(_event, selectedDate) =>
                            handleDateTimeChange("start", selectedDate)
                          }
                        />
                      </VStack>
                    )}

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
              name="end_time"
              render={({ field: { value }, fieldState: { error } }) => (
                <FormControl isInvalid={Boolean(error)}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      End {isAllDay ? "Date" : "Date & Time"}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <HStack space="sm">
                    <Button
                      size="lg"
                      variant={
                        selectedField === "end-date" ? "solid" : "outline"
                      }
                      className="flex-1"
                      onPress={() => handleFieldPress("end-date")}
                    >
                      <ButtonText>{formatDate(value)}</ButtonText>
                    </Button>
                    {!isAllDay && (
                      <Button
                        size="lg"
                        variant={
                          selectedField === "end-time" ? "solid" : "outline"
                        }
                        className="flex-1"
                        onPress={() => handleFieldPress("end-time")}
                      >
                        <ButtonText>{formatTime(value)}</ButtonText>
                      </Button>
                    )}
                  </HStack>

                  {/* Date/Time Picker positioned directly below end time fields */}
                  {selectedField === "end-date" && showEndDatePicker && (
                    <VStack className="items-center mt-4">
                      <DateTimePicker
                        value={getDayjsFromUtcDateString(endTime).toDate()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_event, selectedDate) =>
                          handleDateTimeChange("end", selectedDate)
                        }
                      />
                    </VStack>
                  )}

                  {selectedField === "end-time" &&
                    showEndTimePicker &&
                    !isAllDay && (
                      <VStack className="items-center mt-4">
                        <DateTimePicker
                          value={getDayjsFromUtcDateString(endTime).toDate()}
                          mode="time"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={(_event, selectedDate) =>
                            handleDateTimeChange("end", selectedDate)
                          }
                        />
                      </VStack>
                    )}

                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText size="sm">
                      {error?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </VStack>

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
