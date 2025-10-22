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
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  Icon,
  InfoIcon,
  RepeatIcon,
} from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  END_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  MONTHLY_TYPE_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
  WeekdayType,
} from "@/types/recurring-schedule";
import { getRecurringPresets } from "@/utils/recurring-presets";
import { generateReadableDescription } from "@/utils/recurring-schedule";
import { RecurringScheduleOptions } from "@/validators/blockouts.validators";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { Platform } from "react-native";

interface RecurringScheduleCardProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  startTime: string;
  endTime: string;
  currentRecurringSchedule?: RecurringScheduleOptions | null;
  errors?: FieldErrors<any>;
}

export default function ScheduleRecurringCard({
  control,
  setValue,
  startTime,
  endTime,
  currentRecurringSchedule,
  errors,
}: RecurringScheduleCardProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Convert UTC ISO strings to Date objects
  const startDate = useMemo(
    () => moment.utc(startTime).local().toDate(),
    [startTime]
  );
  const endDate = useMemo(
    () => moment.utc(endTime).local().toDate(),
    [endTime]
  );

  // Generate presets based on start/end dates
  const presets = useMemo(
    () => getRecurringPresets(startDate, endDate),
    [startDate, endDate]
  );

  // Determine current selection value
  const getCurrentRepeatValue = useCallback((): string => {
    if (!currentRecurringSchedule) return "None";

    // Check if current recurring schedule matches any preset
    const matchingPreset = presets.find((preset) => {
      if (!preset.value || typeof preset.value === "string") return false;

      // Deep compare RecurringScheduleOptions (excluding end conditions)
      const presetValue = preset.value;
      const currentValue = currentRecurringSchedule;

      if (preset.label.includes("Monthly on the fourth")) {
        console.log("Comparing monthly preset");
        console.log("presetValue", presetValue);
        console.log("currentValue", currentValue);
      }

      return (
        presetValue.frequency === currentValue.frequency &&
        presetValue.interval === currentValue.interval &&
        presetValue.monthlyType === currentValue.monthlyType &&
        presetValue.dayOfMonth === currentValue.dayOfMonth &&
        presetValue.weekOfMonth === currentValue.weekOfMonth &&
        presetValue.dayOfWeek === currentValue.dayOfWeek &&
        JSON.stringify(presetValue.weekdays) ===
          JSON.stringify(currentValue.weekdays)
      );
    });

    if (matchingPreset) {
      return matchingPreset.label;
    }

    return "CUSTOM";
  }, [currentRecurringSchedule, presets]);

  const [selectedRepeatValue, setSelectedRepeatValue] = useState<string>(() =>
    getCurrentRepeatValue()
  );

  // Update selected value when rrule or presets change
  useEffect(() => {
    const newValue = getCurrentRepeatValue();
    setSelectedRepeatValue(newValue);
    setShowCustomForm(newValue === "CUSTOM");
  }, [getCurrentRepeatValue]);

  const handleSelectionChange = (value: string) => {
    setSelectedRepeatValue(value);

    if (value === "None") {
      // Clear the recurring schedule
      setValue("recurringSchedule", null);
      setShowCustomForm(false);
    } else if (value === "CUSTOM") {
      // Show custom form - initialize with default if no existing schedule
      setShowCustomForm(true);
      if (!currentRecurringSchedule) {
        const defaultOptions: RecurringScheduleOptions = {
          frequency: "WEEKLY",
          interval: 1,
          weekdays: [],
          monthlyType: "DAY_OF_MONTH",
          dayOfMonth: startDate.getDate(),
          weekOfMonth: 1,
          dayOfWeek: "MONDAY",
          endType: "AFTER_OCCURRENCES",
          occurrences: 20,
        };
        setValue("recurringSchedule", defaultOptions);
      }
    } else {
      // Use preset recurring schedule
      const presetIndex = parseInt(value);
      const preset = presets[presetIndex];

      if (preset && preset.value && typeof preset.value !== "string") {
        setValue("recurringSchedule", preset.value);
      }
      setShowCustomForm(false);
    }
  };

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Update a specific field in the recurring schedule
  const updateRecurringSchedule = useCallback(
    (updates: Partial<RecurringScheduleOptions>) => {
      const current = currentRecurringSchedule || {
        frequency: "WEEKLY",
        interval: 1,
        weekdays: [],
        monthlyType: "DAY_OF_MONTH",
        dayOfMonth: startDate.getDate(),
        weekOfMonth: 1,
        dayOfWeek: "MONDAY",
        endType: "AFTER_OCCURRENCES",
        occurrences: 20,
      };

      const updated = { ...current, ...updates };
      setValue("recurringSchedule", updated);
    },
    [currentRecurringSchedule, startDate, setValue]
  );

  const handleWeekdayToggle = useCallback(
    (weekday: WeekdayType, isChecked: boolean) => {
      const currentWeekdays = currentRecurringSchedule?.weekdays || [];
      const updatedWeekdays = isChecked
        ? [...currentWeekdays, weekday]
        : currentWeekdays.filter((day: WeekdayType) => day !== weekday);

      updateRecurringSchedule({ weekdays: updatedWeekdays });
    },
    [currentRecurringSchedule, updateRecurringSchedule]
  );

  return (
    <VStack
      space="md"
      className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
    >
      <HStack space="sm" className="items-center">
        <Icon as={RepeatIcon} size="md" className="text-primary-600" />
        <Text size="lg" className="font-semibold text-typography-900">
          Repeat
        </Text>
      </HStack>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText className="font-medium text-typography-700">
            Repeat
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="recurringSchedule"
          render={({ field }) => (
            <Select
              selectedValue={selectedRepeatValue}
              selectedLabel={
                presets.find((preset) => preset.value === selectedRepeatValue)
                  ?.label
              }
              onValueChange={handleSelectionChange}
            >
              <SelectTrigger
                size="lg"
                variant="outline"
                className="bg-background-50"
              >
                <SelectInput placeholder="Select recurrence" />
                <SelectIcon as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="pb-8">
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {presets.map((preset, index) => (
                    <SelectItem
                      key={index}
                      label={preset.label}
                      value={
                        preset.value === null
                          ? "None"
                          : preset.value === "CUSTOM"
                          ? "CUSTOM"
                          : index.toString()
                      }
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
        />
      </FormControl>

      {/* Show recurrence options for all selections except "None" */}
      {selectedRepeatValue !== "None" && (
        <VStack space="md" className="mt-2 pt-4 border-t border-outline-200">
          {/* Only show full custom form for CUSTOM selection */}
          {showCustomForm && (
            <>
              <Text size="md" className="font-semibold text-typography-700">
                Custom Recurrence Pattern
              </Text>

              {/* Frequency Selection */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="font-medium text-typography-700">
                    Frequency
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  selectedValue={
                    currentRecurringSchedule?.frequency || "WEEKLY"
                  }
                  selectedLabel={
                    FREQUENCY_OPTIONS.find(
                      (option) =>
                        option.value === currentRecurringSchedule?.frequency
                    )?.label
                  }
                  onValueChange={(value) =>
                    updateRecurringSchedule({ frequency: value as any })
                  }
                >
                  <SelectTrigger
                    size="lg"
                    variant="outline"
                    className="bg-background-50"
                  >
                    <SelectInput placeholder="Select frequency" />
                    <SelectIcon as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="pb-8">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {FREQUENCY_OPTIONS.map((freq) => (
                        <SelectItem
                          key={freq.value}
                          label={freq.label}
                          value={freq.value}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              {/* Interval */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="font-medium text-typography-700">
                    Every
                  </FormControlLabelText>
                </FormControlLabel>
                <HStack space="md" className="items-center">
                  <Input
                    size="lg"
                    variant="outline"
                    className="flex-1 max-w-[100px] bg-background-50"
                  >
                    <InputField
                      keyboardType="numeric"
                      value={(
                        currentRecurringSchedule?.interval || 1
                      ).toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        updateRecurringSchedule({
                          interval: Math.max(1, num),
                        });
                      }}
                    />
                  </Input>
                  <Text className="text-typography-600 font-medium">
                    {(
                      currentRecurringSchedule?.frequency || "WEEKLY"
                    ).toLowerCase()}
                    {(currentRecurringSchedule?.interval || 1) > 1 ? "s" : ""}
                  </Text>
                </HStack>
              </FormControl>

              {/* Weekly Options */}
              {currentRecurringSchedule?.frequency === "WEEKLY" && (
                <FormControl>
                  <FormControlLabel>
                    <HStack space="xs" className="items-center">
                      <Icon
                        as={CalendarDaysIcon}
                        size="sm"
                        className="text-typography-700"
                      />
                      <FormControlLabelText className="font-medium text-typography-700">
                        On these days
                      </FormControlLabelText>
                    </HStack>
                  </FormControlLabel>
                  <VStack
                    space="sm"
                    className="bg-background-50 p-4 rounded-lg"
                  >
                    {WEEKDAY_OPTIONS.map((weekday) => (
                      <Checkbox
                        key={weekday.value}
                        size="md"
                        value={weekday.value}
                        isChecked={(
                          currentRecurringSchedule?.weekdays || []
                        ).includes(weekday.value)}
                        onChange={(isChecked) =>
                          handleWeekdayToggle(weekday.value, isChecked)
                        }
                        aria-label={weekday.label}
                        className="flex-row items-center"
                      >
                        <CheckboxIndicator className="mr-3">
                          <CheckboxIcon as={CheckIcon} />
                        </CheckboxIndicator>
                        <CheckboxLabel className="text-typography-700">
                          {weekday.label}
                        </CheckboxLabel>
                      </Checkbox>
                    ))}
                  </VStack>
                </FormControl>
              )}

              {/* Monthly Options */}
              {currentRecurringSchedule?.frequency === "MONTHLY" && (
                <VStack space="md" className="bg-background-50 p-4 rounded-lg">
                  <Text size="md" className="font-medium text-typography-700">
                    Monthly Options
                  </Text>

                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="font-medium text-typography-600">
                        Pattern
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Select
                      selectedValue={
                        currentRecurringSchedule?.monthlyType || "DAY_OF_MONTH"
                      }
                      selectedLabel={
                        MONTHLY_TYPE_OPTIONS.find(
                          (option) =>
                            option.value ===
                            currentRecurringSchedule?.monthlyType
                        )?.label
                      }
                      onValueChange={(value) =>
                        updateRecurringSchedule({ monthlyType: value as any })
                      }
                    >
                      <SelectTrigger size="lg" variant="outline">
                        <SelectInput placeholder="Select pattern" />
                        <SelectIcon as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent className="pb-8">
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          {MONTHLY_TYPE_OPTIONS.map((type) => (
                            <SelectItem
                              key={type.value}
                              label={type.label}
                              value={type.value}
                            />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </FormControl>

                  {currentRecurringSchedule?.monthlyType === "DAY_OF_MONTH" && (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText className="font-medium text-typography-600">
                          Day of month
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        size="lg"
                        variant="outline"
                        className="max-w-[100px]"
                      >
                        <InputField
                          keyboardType="numeric"
                          value={(
                            currentRecurringSchedule?.dayOfMonth ||
                            startDate.getDate()
                          ).toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            updateRecurringSchedule({
                              dayOfMonth: Math.max(1, Math.min(31, num)),
                            });
                          }}
                        />
                      </Input>
                    </FormControl>
                  )}

                  {currentRecurringSchedule?.monthlyType === "DAY_OF_WEEK" && (
                    <HStack space="md">
                      <FormControl className="flex-1">
                        <FormControlLabel>
                          <FormControlLabelText className="font-medium text-typography-600">
                            Week
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Select
                          selectedValue={(
                            currentRecurringSchedule?.weekOfMonth || 1
                          ).toString()}
                          selectedLabel={
                            WEEK_OF_MONTH_OPTIONS.find(
                              (option) =>
                                option.value ===
                                currentRecurringSchedule?.weekOfMonth
                            )?.label
                          }
                          onValueChange={(value) =>
                            updateRecurringSchedule({
                              weekOfMonth: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger size="lg" variant="outline">
                            <SelectInput placeholder="Select week" />
                            <SelectIcon as={ChevronDownIcon} />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent className="pb-8">
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              {WEEK_OF_MONTH_OPTIONS.map((week) => (
                                <SelectItem
                                  key={week.value}
                                  label={week.label}
                                  value={week.value.toString()}
                                />
                              ))}
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      </FormControl>

                      <FormControl className="flex-1">
                        <FormControlLabel>
                          <FormControlLabelText className="font-medium text-typography-600">
                            Day
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Select
                          selectedValue={
                            currentRecurringSchedule?.dayOfWeek || "MONDAY"
                          }
                          selectedLabel={
                            WEEKDAY_OPTIONS.find(
                              (option) =>
                                option.value ===
                                currentRecurringSchedule?.dayOfWeek
                            )?.label
                          }
                          onValueChange={(value) =>
                            updateRecurringSchedule({
                              dayOfWeek: value as WeekdayType,
                            })
                          }
                        >
                          <SelectTrigger size="lg" variant="outline">
                            <SelectInput placeholder="Select day" />
                            <SelectIcon as={ChevronDownIcon} />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent className="pb-8">
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              {WEEKDAY_OPTIONS.map((day) => (
                                <SelectItem
                                  key={day.value}
                                  label={day.label}
                                  value={day.value}
                                />
                              ))}
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      </FormControl>
                    </HStack>
                  )}
                </VStack>
              )}
            </>
          )}

          {/* End Options - Always show for any selection except "None" */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="font-medium text-typography-700">
                End Repeat
              </FormControlLabelText>
            </FormControlLabel>
            <Select
              selectedValue={
                currentRecurringSchedule?.endType || "AFTER_OCCURRENCES"
              }
              selectedLabel={
                END_TYPE_OPTIONS.find(
                  (option) => option.value === currentRecurringSchedule?.endType
                )?.label
              }
              onValueChange={(value) => {
                updateRecurringSchedule({ endType: value as any });
              }}
            >
              <SelectTrigger
                size="lg"
                variant="outline"
                className="bg-background-50"
              >
                <SelectInput placeholder="Select end condition" />
                <SelectIcon as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="pb-8">
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {END_TYPE_OPTIONS.map((type) => (
                    <SelectItem
                      key={type.value}
                      label={type.label}
                      value={type.value}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </FormControl>

          {currentRecurringSchedule?.endType === "ON_DATE" && (
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="font-medium text-typography-600">
                  End date
                </FormControlLabelText>
              </FormControlLabel>
              <Button
                size="lg"
                variant="outline"
                onPress={() => setShowEndDatePicker(true)}
                className="bg-background-50"
              >
                <ButtonText className="text-typography-700">
                  {currentRecurringSchedule?.endDate
                    ? currentRecurringSchedule.endDate.toLocaleDateString()
                    : "Select end date"}
                </ButtonText>
              </Button>
            </FormControl>
          )}

          {currentRecurringSchedule?.endType === "AFTER_OCCURRENCES" && (
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="font-medium text-typography-600">
                  Number of occurrences
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                size="lg"
                variant="outline"
                className="max-w-[150px] bg-background-50"
              >
                <InputField
                  keyboardType="numeric"
                  value={(
                    currentRecurringSchedule?.occurrences || 20
                  ).toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 20;
                    const finalNum = Math.max(1, num);
                    updateRecurringSchedule({
                      occurrences: finalNum,
                    });
                  }}
                  placeholder="20"
                />
              </Input>
            </FormControl>
          )}

          {/* End Date Picker */}
          {showEndDatePicker && (
            <DateTimePicker
              value={currentRecurringSchedule?.endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  updateRecurringSchedule({ endDate: selectedDate });
                }
              }}
              minimumDate={startDate}
            />
          )}

          {/* Readable Summary - only show for custom */}
          {showCustomForm && currentRecurringSchedule && (
            <VStack
              space="sm"
              className="mt-2 p-4 bg-primary-50 rounded-xl border border-primary-200"
            >
              <HStack space="xs" className="items-center">
                <Icon as={InfoIcon} size="sm" className="text-primary-700" />
                <Text size="md" className="font-semibold text-primary-700">
                  Summary
                </Text>
              </HStack>
              <Text size="sm" className="text-primary-600 leading-relaxed">
                {generateReadableDescription(currentRecurringSchedule)}
              </Text>
            </VStack>
          )}
        </VStack>
      )}

      {/* Form Errors */}
      {errors?.recurringSchedule && (
        <FormControl>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {typeof errors.recurringSchedule.message === "string"
                ? errors.recurringSchedule.message
                : "Invalid recurring schedule configuration"}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}
    </VStack>
  );
}
