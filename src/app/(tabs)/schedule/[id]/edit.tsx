import {
  useDeleteTalentBlockout,
  useGetTalentBlockoutById,
  useUpdateTalentBlockout,
} from "@/api/blockouts_api";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
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
import { UpdateTalentBlockout } from "@/types/blockouts";
import { canEditBlockout } from "@/utils/blockout-permissions";
import { updateBlockoutSchema } from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Get user's timezone, with fallback for development
  const getTimezone = useCallback(() => {
    if (__DEV__) {
      return "America/Chicago"; // Central Time for local simulator
    }
    return dayjs.tz.guess();
  }, []);

  // Format date using dayjs in user's timezone
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Select Date";
    return dayjs(dateString).tz(getTimezone()).format("ddd, MMM D, YYYY");
  };

  // Format time using dayjs in user's timezone
  const formatTime = (dateString: string) => {
    return dayjs(dateString).tz(getTimezone()).format("h:mm A");
  };

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
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(updateBlockoutSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      is_all_day: false,
      is_recurring: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      rrule: "",
    },
  });

  // Update form when blockout data is loaded
  useEffect(() => {
    if (blockout) {
      reset({
        title: blockout.title,
        description: blockout.description || "",
        start_time: blockout.start_time,
        end_time: blockout.end_time,
        is_all_day: blockout.is_all_day,
        is_recurring: blockout.is_recurring,
        timezone: blockout.timezone,
        rrule: blockout.rrule || "",
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
    () =>
      dayjs(startTime || new Date().toISOString())
        .tz(getTimezone())
        .toDate(),
    [startTime, getTimezone]
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

  // Handle loading and error states
  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
        <VStack className="flex-1 justify-center items-center p-[20px]">
          <Text className="text-typography-600">
            Loading blockout details...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error || !blockout) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
        <VStack
          className="flex-1 justify-center items-center p-[20px]"
          space="md"
        >
          <Text className="text-typography-600">
            Error loading blockout details
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  // Check if blockout can be edited
  if (!canEdit) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary pb-[50px]">
        <VStack
          className="flex-1 justify-center items-center p-[20px]"
          space="md"
        >
          <Text className="text-typography-600 text-center">
            This blockout cannot be edited because it has already ended.
          </Text>
          <Text className="text-typography-500 text-center text-sm">
            Blockouts can only be edited if their end time is in the future.
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: UpdateTalentBlockout) => {
    try {
      if (!blockoutId) {
        Alert.alert("Error", "Blockout ID is missing");
        return;
      }

      await updateBlockout({
        blockoutId,
        updates: {
          title: data.title,
          description: data.description || undefined,
          start_time: data.start_time,
          end_time: data.end_time,
          is_all_day: data.is_all_day || false,
          timezone:
            data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_recurring: data.is_recurring || false,
          rrule: data.is_recurring ? data.rrule : undefined,
        },
      });

      router.back();
    } catch (error) {
      console.error("Error updating blockout:", error);
      Alert.alert("Error", "Failed to update blockout");
    }
  };

  const handleDateTimeChange = (
    type: "start" | "end",
    mode: "date" | "time",
    selectedDate?: Date
  ) => {
    if (!selectedDate) return;

    // Get current datetime using dayjs and update only the date or time portion
    // This preserves the user's timezone while updating the selected component
    const currentTimeValue = type === "start" ? startTime : endTime;
    if (!currentTimeValue) return;

    const currentDateTime = dayjs(currentTimeValue).tz(getTimezone());

    let updatedDateTime;
    if (mode === "date") {
      // Update only the date part
      const selected = dayjs(selectedDate);
      updatedDateTime = currentDateTime
        .year(selected.year())
        .month(selected.month())
        .date(selected.date());
    } else {
      // Update only the time part
      const selected = dayjs(selectedDate);
      updatedDateTime = currentDateTime
        .hour(selected.hour())
        .minute(selected.minute());
    }

    setValue(
      type === "start" ? "start_time" : "end_time",
      updatedDateTime.toISOString()
    );

    // Auto-adjust times to maintain valid start < end relationship
    if (type === "start" && endTime) {
      const currentEndTime = dayjs(endTime);
      if (
        updatedDateTime.isAfter(currentEndTime) ||
        updatedDateTime.isSame(currentEndTime)
      ) {
        // Set end time to 1 hour after the new start time
        const newEndTime = updatedDateTime.add(1, "hour");
        setValue("end_time", newEndTime.toISOString());
      }
    } else if (type === "end" && startTime) {
      const currentStartTime = dayjs(startTime);
      if (
        updatedDateTime.isBefore(currentStartTime) ||
        updatedDateTime.isSame(currentStartTime)
      ) {
        // Set start time to 1 hour before the new end time
        const newStartTime = updatedDateTime.subtract(1, "hour");
        setValue("start_time", newStartTime.toISOString());
      }
    }

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
    <>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary pb-[50px]">
        <Stack.Screen
          options={{
            title: "Edit Blockout",
            headerRight: canEdit ? deleteButton : undefined,
          }}
        />

        <ScrollView className="flex-1">
          <VStack space="lg" className="p-[20px]">
            <VStack space="sm">
              <Text className="text-typography-600">
                Update your blockout details
              </Text>
            </VStack>
            <Controller
              control={control}
              name="title"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              <Text size="sm" className="text-typography-500 px-1">
                All times are displayed in your local timezone ({getTimezone()})
              </Text>

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
                          <ButtonText>
                            {value ? formatTime(value) : "Select Time"}
                          </ButtonText>
                        </Button>
                      )}
                    </HStack>

                    {/* Date/Time Picker positioned directly below start time fields */}
                    {selectedField === "start-date" &&
                      showStartDatePicker &&
                      value && (
                        <VStack className="items-center mt-4">
                          <DateTimePicker
                            value={dayjs(value).tz(getTimezone()).toDate()}
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(event, selectedDate) =>
                              handleDateTimeChange(
                                "start",
                                "date",
                                selectedDate
                              )
                            }
                          />
                        </VStack>
                      )}

                    {selectedField === "start-time" &&
                      showStartTimePicker &&
                      !isAllDay &&
                      value && (
                        <VStack className="items-center mt-4">
                          <DateTimePicker
                            value={dayjs(value).tz(getTimezone()).toDate()}
                            mode="time"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(event, selectedDate) =>
                              handleDateTimeChange(
                                "start",
                                "time",
                                selectedDate
                              )
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
                          <ButtonText>
                            {value ? formatTime(value) : "Select Time"}
                          </ButtonText>
                        </Button>
                      )}
                    </HStack>

                    {/* Date/Time Picker positioned directly below end time fields */}
                    {selectedField === "end-date" &&
                      showEndDatePicker &&
                      value && (
                        <VStack className="items-center mt-4">
                          <DateTimePicker
                            value={dayjs(value).tz(getTimezone()).toDate()}
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(event, selectedDate) =>
                              handleDateTimeChange("end", "date", selectedDate)
                            }
                          />
                        </VStack>
                      )}

                    {selectedField === "end-time" &&
                      showEndTimePicker &&
                      !isAllDay &&
                      value && (
                        <VStack className="items-center mt-4">
                          <DateTimePicker
                            value={dayjs(value).tz(getTimezone()).toDate()}
                            mode="time"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(event, selectedDate) =>
                              handleDateTimeChange("end", "time", selectedDate)
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
                {isSubmitting ? "Updating..." : "Update Blockout"}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
