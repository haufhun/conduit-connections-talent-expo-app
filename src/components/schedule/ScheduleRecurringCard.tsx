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
  RecurringScheduleOptions,
  WEEK_OF_MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
  WeekdayType,
} from "@/types/recurring-schedule";
import { getDayjsFromUtcDateString } from "@/utils/date";
import { getRecurringPresets } from "@/utils/recurring-presets";
import {
  convertToRRuleOptions,
  generateReadableDescription,
  parseRRuleOptions,
} from "@/utils/recurring-schedule";
import { RRuleOptions } from "@/validators/blockouts.validators";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  currentRRule?: RRuleOptions | null;
  errors?: FieldErrors<any>;
}

export default function ScheduleRecurringCard({
  control,
  setValue,
  startTime,
  endTime,
  currentRRule,
  errors,
}: RecurringScheduleCardProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Convert UTC ISO strings to Date objects
  const startDate = useMemo(
    () => getDayjsFromUtcDateString(startTime).toDate(),
    [startTime]
  );
  const endDate = useMemo(
    () => getDayjsFromUtcDateString(endTime).toDate(),
    [endTime]
  );

  // Generate presets based on start/end dates
  const presets = useMemo(
    () => getRecurringPresets(startDate, endDate),
    [startDate, endDate]
  );

  // Determine current selection value
  const getCurrentRepeatValue = useCallback((): string => {
    if (!currentRRule) return "None";

    // Check if current rrule matches any preset
    const matchingPreset = presets.find((preset) => {
      if (!preset.value || typeof preset.value === "string") return false;

      // Helper function to clean object by removing null, undefined, and empty arrays
      const cleanObject = (obj: any): any => {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                cleaned[key] = value;
              }
            } else {
              cleaned[key] = value;
            }
          }
        }
        return cleaned;
      };

      // Clean both objects for comparison
      const cleanedPreset = cleanObject(preset.value);
      const cleanedCurrent = cleanObject(currentRRule);

      // Deep compare cleaned RRuleOptions
      return JSON.stringify(cleanedPreset) === JSON.stringify(cleanedCurrent);
    });

    if (matchingPreset) {
      return matchingPreset.label;
    }

    return "CUSTOM";
  }, [currentRRule, presets]);

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
      // Clear the rrule
      setValue("rrule", null);
      setShowCustomForm(false);
    } else if (value === "CUSTOM") {
      // Show custom form but keep existing rrule if any
      setShowCustomForm(true);
      // If there's no rrule yet, set a default RRuleOptions
      if (!currentRRule) {
        const defaultOptions = convertToRRuleOptions(
          customRepeatOptions,
          startDate
        );
        setValue("rrule", defaultOptions);
      }
    } else {
      // Use preset rrule - get from presets array by index
      const presetIndex = parseInt(value);
      const preset = presets[presetIndex];

      if (preset && preset.value && typeof preset.value !== "string") {
        // Clone the preset value and apply current end type settings from customRepeatOptions
        let finalRRuleOptions = { ...preset.value };

        if (customRepeatOptions.endType === "AFTER_OCCURRENCES") {
          delete finalRRuleOptions.until;
          finalRRuleOptions.count = customRepeatOptions.occurrences || 20;
        } else if (
          customRepeatOptions.endType === "ON_DATE" &&
          customRepeatOptions.endDate
        ) {
          delete finalRRuleOptions.count;
          finalRRuleOptions.until = customRepeatOptions.endDate;
        }

        setValue("rrule", finalRRuleOptions);
      }
      setShowCustomForm(false);
    }
  };

  const [customRepeatOptions, setCustomRepeatOptions] =
    useState<RecurringScheduleOptions>(() => {
      if (currentRRule) {
        try {
          return parseRRuleOptions(currentRRule);
        } catch (error) {
          console.warn("Failed to parse initial RRULE:", error);
        }
      }
      return {
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
    });

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Update RRULE when custom options change
  useEffect(() => {
    if (showCustomForm) {
      const rruleOptions = convertToRRuleOptions(
        customRepeatOptions,
        startDate
      );
      setValue("rrule", rruleOptions);
    }
  }, [customRepeatOptions, startDate, showCustomForm, setValue]);

  const updateCustomRepeatOptions = useCallback(
    (updates: Partial<RecurringScheduleOptions>) => {
      setCustomRepeatOptions((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleWeekdayToggle = useCallback(
    (weekday: WeekdayType, isChecked: boolean) => {
      if (isChecked) {
        updateCustomRepeatOptions({
          weekdays: [...customRepeatOptions.weekdays, weekday],
        });
      } else {
        updateCustomRepeatOptions({
          weekdays: customRepeatOptions.weekdays.filter(
            (day) => day !== weekday
          ),
        });
      }
    },
    [customRepeatOptions.weekdays, updateCustomRepeatOptions]
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
          name="rrule"
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
                <SelectContent>
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
                  selectedValue={customRepeatOptions.frequency}
                  selectedLabel={
                    FREQUENCY_OPTIONS.find(
                      (option) => option.value === customRepeatOptions.frequency
                    )?.label
                  }
                  onValueChange={(value) =>
                    updateCustomRepeatOptions({ frequency: value as any })
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
                    <SelectContent>
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
                      value={customRepeatOptions.interval.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        updateCustomRepeatOptions({
                          interval: Math.max(1, num),
                        });
                      }}
                    />
                  </Input>
                  <Text className="text-typography-600 font-medium">
                    {customRepeatOptions.frequency.toLowerCase()}
                    {customRepeatOptions.interval > 1 ? "s" : ""}
                  </Text>
                </HStack>
              </FormControl>

              {/* Weekly Options */}
              {customRepeatOptions.frequency === "WEEKLY" && (
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
                        isChecked={customRepeatOptions.weekdays.includes(
                          weekday.value
                        )}
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
              {customRepeatOptions.frequency === "MONTHLY" && (
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
                      selectedValue={customRepeatOptions.monthlyType}
                      selectedLabel={
                        MONTHLY_TYPE_OPTIONS.find(
                          (option) =>
                            option.value === customRepeatOptions.monthlyType
                        )?.label
                      }
                      onValueChange={(value) =>
                        updateCustomRepeatOptions({ monthlyType: value as any })
                      }
                    >
                      <SelectTrigger size="lg" variant="outline">
                        <SelectInput placeholder="Select pattern" />
                        <SelectIcon as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
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

                  {customRepeatOptions.monthlyType === "DAY_OF_MONTH" && (
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
                          value={customRepeatOptions.dayOfMonth.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            updateCustomRepeatOptions({
                              dayOfMonth: Math.max(1, Math.min(31, num)),
                            });
                          }}
                        />
                      </Input>
                    </FormControl>
                  )}

                  {customRepeatOptions.monthlyType === "DAY_OF_WEEK" && (
                    <HStack space="md">
                      <FormControl className="flex-1">
                        <FormControlLabel>
                          <FormControlLabelText className="font-medium text-typography-600">
                            Week
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Select
                          selectedValue={customRepeatOptions.weekOfMonth.toString()}
                          selectedLabel={
                            WEEK_OF_MONTH_OPTIONS.find(
                              (option) =>
                                option.value === customRepeatOptions.weekOfMonth
                            )?.label
                          }
                          onValueChange={(value) =>
                            updateCustomRepeatOptions({
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
                            <SelectContent>
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
                          selectedValue={customRepeatOptions.dayOfWeek}
                          selectedLabel={
                            WEEKDAY_OPTIONS.find(
                              (option) =>
                                option.value === customRepeatOptions.dayOfWeek
                            )?.label
                          }
                          onValueChange={(value) =>
                            updateCustomRepeatOptions({
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
                            <SelectContent>
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
              selectedValue={customRepeatOptions.endType}
              selectedLabel={
                END_TYPE_OPTIONS.find(
                  (option) => option.value === customRepeatOptions.endType
                )?.label
              }
              onValueChange={(value) => {
                updateCustomRepeatOptions({ endType: value as any });
                // Update the preset RRULE if not in custom mode
                if (selectedRepeatValue !== "CUSTOM") {
                  const presetIndex = parseInt(selectedRepeatValue);
                  const preset = presets[presetIndex];

                  if (
                    preset &&
                    preset.value &&
                    typeof preset.value !== "string"
                  ) {
                    let updatedRRuleOptions = { ...preset.value };

                    if (value === "AFTER_OCCURRENCES") {
                      delete updatedRRuleOptions.until;
                      updatedRRuleOptions.count =
                        customRepeatOptions.occurrences || 20;
                    } else if (
                      value === "ON_DATE" &&
                      customRepeatOptions.endDate
                    ) {
                      delete updatedRRuleOptions.count;
                      updatedRRuleOptions.until = customRepeatOptions.endDate;
                    }

                    setValue("rrule", updatedRRuleOptions);
                  }
                }
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
                <SelectContent>
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

          {customRepeatOptions.endType === "ON_DATE" && (
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
                  {customRepeatOptions.endDate
                    ? customRepeatOptions.endDate.toLocaleDateString()
                    : "Select end date"}
                </ButtonText>
              </Button>
            </FormControl>
          )}

          {customRepeatOptions.endType === "AFTER_OCCURRENCES" && (
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
                  value={customRepeatOptions.occurrences?.toString() || "20"}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 20;
                    const finalNum = Math.max(1, num);
                    updateCustomRepeatOptions({
                      occurrences: finalNum,
                    });
                    // Update the preset RRULE if not in custom mode
                    if (selectedRepeatValue !== "CUSTOM") {
                      const presetIndex = parseInt(selectedRepeatValue);
                      const preset = presets[presetIndex];

                      if (
                        preset &&
                        preset.value &&
                        typeof preset.value !== "string"
                      ) {
                        const updatedRRuleOptions = { ...preset.value };
                        delete updatedRRuleOptions.until;
                        updatedRRuleOptions.count = finalNum;
                        setValue("rrule", updatedRRuleOptions);
                      }
                    }
                  }}
                  placeholder="20"
                />
              </Input>
            </FormControl>
          )}

          {/* End Date Picker */}
          {showEndDatePicker && (
            <DateTimePicker
              value={customRepeatOptions.endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  updateCustomRepeatOptions({ endDate: selectedDate });
                  // Update the preset RRULE if not in custom mode
                  if (selectedRepeatValue !== "CUSTOM") {
                    const presetIndex = parseInt(selectedRepeatValue);
                    const preset = presets[presetIndex];

                    if (
                      preset &&
                      preset.value &&
                      typeof preset.value !== "string"
                    ) {
                      const updatedRRuleOptions = { ...preset.value };
                      delete updatedRRuleOptions.count;
                      updatedRRuleOptions.until = selectedDate;
                      setValue("rrule", updatedRRuleOptions);
                    }
                  }
                }
              }}
              minimumDate={startDate}
            />
          )}

          {/* Readable Summary - only show for custom */}
          {showCustomForm && (
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
                {generateReadableDescription(customRepeatOptions)}
              </Text>
            </VStack>
          )}
        </VStack>
      )}

      {/* Form Errors */}
      {errors?.rrule && (
        // <Text>There is some sort of error!</Text>
        <FormControl>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {errors.rrule["byweekday"].message as string}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}
    </VStack>
  );
}
