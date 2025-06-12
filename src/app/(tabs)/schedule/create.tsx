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
import { createBlockoutSchema } from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateBlockoutScreen() {
  const router = useRouter();
  const { mutateAsync: createBlockout } = useCreateTalentBlockout();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      is_all_day: false,
      is_recurring: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
  const memoizedStartDate = useMemo(() => new Date(startTime), [startTime]);

  const onSubmit = async (data: any) => {
    try {
      await createBlockout({
        title: data.title,
        description: data.description || undefined,
        start_time: data.start_time,
        end_time: data.end_time,
        is_all_day: data.is_all_day || false,
        timezone:
          data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDateTimeChange = (
    type: "start" | "end",
    mode: "date" | "time",
    selectedDate?: Date
  ) => {
    if (!selectedDate) return;

    const currentDateTime = new Date(type === "start" ? startTime : endTime);

    if (mode === "date") {
      // Update only the date part
      currentDateTime.setFullYear(selectedDate.getFullYear());
      currentDateTime.setMonth(selectedDate.getMonth());
      currentDateTime.setDate(selectedDate.getDate());
    } else {
      // Update only the time part
      currentDateTime.setHours(selectedDate.getHours());
      currentDateTime.setMinutes(selectedDate.getMinutes());
    }

    setValue(
      type === "start" ? "start_time" : "end_time",
      currentDateTime.toISOString()
    );

    // Auto-adjust times to maintain valid start < end relationship
    if (type === "start") {
      const currentEndTime = new Date(endTime);
      if (currentDateTime >= currentEndTime) {
        // Set end time to 1 hour after the new start time
        const newEndTime = new Date(currentDateTime.getTime() + 60 * 60 * 1000);
        setValue("end_time", newEndTime.toISOString());
      }
    } else if (type === "end") {
      const currentStartTime = new Date(startTime);
      if (currentDateTime <= currentStartTime) {
        // Set start time to 1 hour before the new end time
        const newStartTime = new Date(
          currentDateTime.getTime() - 60 * 60 * 1000
        );
        setValue("start_time", newStartTime.toISOString());
      }
    }

    // Hide pickers
    if (type === "start") {
      setShowStartDatePicker(false);
      setShowStartTimePicker(false);
    } else {
      setShowEndDatePicker(false);
      setShowEndTimePicker(false);
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
                      variant="outline"
                      className="flex-1"
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <ButtonText>{formatDate(value)}</ButtonText>
                    </Button>
                    {!isAllDay && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        onPress={() => setShowStartTimePicker(true)}
                      >
                        <ButtonText>
                          {new Date(value).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </ButtonText>
                      </Button>
                    )}
                  </HStack>
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
                      variant="outline"
                      className="flex-1"
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <ButtonText>{formatDate(value)}</ButtonText>
                    </Button>
                    {!isAllDay && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        onPress={() => setShowEndTimePicker(true)}
                      >
                        <ButtonText>
                          {new Date(value).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </ButtonText>
                      </Button>
                    )}
                  </HStack>
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

        {/* Date/Time Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(startTime)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleDateTimeChange("start", "date", selectedDate)
            }
          />
        )}

        {showStartTimePicker && !isAllDay && (
          <DateTimePicker
            value={new Date(startTime)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleDateTimeChange("start", "time", selectedDate)
            }
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={new Date(endTime)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleDateTimeChange("end", "date", selectedDate)
            }
          />
        )}

        {showEndTimePicker && !isAllDay && (
          <DateTimePicker
            value={new Date(endTime)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleDateTimeChange("end", "time", selectedDate)
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
