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
  const getCurrentValue = useCallback((): string => {
    if (!currentRRule) return "NONE";

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

  const [selectedValue, setSelectedValue] = useState<string>(() =>
    getCurrentValue()
  );

  // State for preset end options
  const [presetEndType, setPresetEndType] = useState<
    "AFTER_OCCURRENCES" | "ON_DATE"
  >("AFTER_OCCURRENCES");
  const [presetOccurrences, setPresetOccurrences] = useState(20);
  const [presetEndDate, setPresetEndDate] = useState<Date | undefined>();
  const [showPresetEndDatePicker, setShowPresetEndDatePicker] = useState(false);

  // Update selected value when rrule or presets change
  useEffect(() => {
    const newValue = getCurrentValue();
    setSelectedValue(newValue);
    setShowCustomForm(newValue === "CUSTOM");
  }, [getCurrentValue]);

  const handleSelectionChange = (value: string) => {
    setSelectedValue(value);

    if (value === "NONE") {
      // Clear the rrule
      setValue("rrule", null);
      setShowCustomForm(false);
    } else if (value === "CUSTOM") {
      // Show custom form but keep existing rrule if any
      setShowCustomForm(true);
      // If there's no rrule yet, set a default RRuleOptions
      if (!currentRRule) {
        const defaultOptions = convertToRRuleOptions(customOptions, startDate);
        setValue("rrule", defaultOptions);
      }
    } else {
      // Use preset rrule - get from presets array by index
      const presetIndex = parseInt(value);
      const preset = presets[presetIndex];

      if (preset && preset.value && typeof preset.value !== "string") {
        // Clone the preset value and apply current end type settings
        let finalRRuleOptions = { ...preset.value };

        if (presetEndType === "AFTER_OCCURRENCES") {
          delete finalRRuleOptions.until;
          finalRRuleOptions.count = presetOccurrences;
        } else if (presetEndDate) {
          delete finalRRuleOptions.count;
          finalRRuleOptions.until = presetEndDate;
        }

        setValue("rrule", finalRRuleOptions);
      }
      setShowCustomForm(false);
    }
  };

  // Custom form state management
  const [customOptions, setCustomOptions] = useState<RecurringScheduleOptions>(
    () => {
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
    }
  );

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Update RRULE when custom options change
  useEffect(() => {
    if (showCustomForm) {
      const rruleOptions = convertToRRuleOptions(customOptions, startDate);
      setValue("rrule", rruleOptions);
    }
  }, [customOptions, startDate, showCustomForm, setValue]);

  const updateCustomOptions = useCallback(
    (updates: Partial<RecurringScheduleOptions>) => {
      setCustomOptions((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleWeekdayToggle = useCallback(
    (weekday: WeekdayType, isChecked: boolean) => {
      if (isChecked) {
        updateCustomOptions({
          weekdays: [...customOptions.weekdays, weekday],
        });
      } else {
        updateCustomOptions({
          weekdays: customOptions.weekdays.filter((day) => day !== weekday),
        });
      }
    },
    [customOptions.weekdays, updateCustomOptions]
  );

  const handleEndDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowEndDatePicker(false);
      if (selectedDate) {
        updateCustomOptions({ endDate: selectedDate });
      }
    },
    [updateCustomOptions]
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
              selectedValue={selectedValue}
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
                          ? "NONE"
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

      {/* Show End controls for preset selections */}
      {selectedValue !== "NONE" && selectedValue !== "CUSTOM" && (
        <VStack space="md" className="mt-2 pt-4 border-t border-outline-200">
          <Text size="md" className="font-semibold text-typography-700">
            End Repeat
          </Text>

          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="font-medium text-typography-700">
                End
              </FormControlLabelText>
            </FormControlLabel>
            <Select
              selectedValue={presetEndType}
              onValueChange={(value) => {
                setPresetEndType(value as "AFTER_OCCURRENCES" | "ON_DATE");
                // Update the preset RRULE with new end condition
                if (selectedValue !== "NONE" && selectedValue !== "CUSTOM") {
                  const presetIndex = parseInt(selectedValue);
                  const preset = presets[presetIndex];

                  if (
                    preset &&
                    preset.value &&
                    typeof preset.value !== "string"
                  ) {
                    let updatedRRuleOptions = { ...preset.value };

                    if (value === "AFTER_OCCURRENCES") {
                      delete updatedRRuleOptions.until;
                      updatedRRuleOptions.count = presetOccurrences;
                    } else if (presetEndDate) {
                      delete updatedRRuleOptions.count;
                      updatedRRuleOptions.until = presetEndDate;
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

          {presetEndType === "ON_DATE" && (
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="font-medium text-typography-600">
                  End date
                </FormControlLabelText>
              </FormControlLabel>
              <Button
                size="lg"
                variant="outline"
                onPress={() => setShowPresetEndDatePicker(true)}
                className="bg-background-50"
              >
                <ButtonText className="text-typography-700">
                  {presetEndDate
                    ? presetEndDate.toLocaleDateString()
                    : "Select end date"}
                </ButtonText>
              </Button>
            </FormControl>
          )}

          {presetEndType === "AFTER_OCCURRENCES" && (
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
                  value={presetOccurrences.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 20;
                    const finalNum = Math.max(1, num);
                    setPresetOccurrences(finalNum);
                    // Update the preset RRULE with new count
                    if (
                      selectedValue !== "NONE" &&
                      selectedValue !== "CUSTOM"
                    ) {
                      const presetIndex = parseInt(selectedValue);
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
        </VStack>
      )}

      {/* Preset End Date Picker */}
      {showPresetEndDatePicker && (
        <DateTimePicker
          value={presetEndDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event: any, selectedDate?: Date) => {
            setShowPresetEndDatePicker(false);
            if (selectedDate) {
              setPresetEndDate(selectedDate);
              // Update the preset RRULE with new end date
              if (selectedValue !== "NONE" && selectedValue !== "CUSTOM") {
                const presetIndex = parseInt(selectedValue);
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

      {/* Custom Recurrence Form - shown inline when Custom is selected */}
      {showCustomForm && (
        <VStack space="md" className="mt-2 pt-4 border-t border-outline-200">
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
              selectedValue={customOptions.frequency}
              onValueChange={(value) =>
                updateCustomOptions({ frequency: value as any })
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
                  value={customOptions.interval.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    updateCustomOptions({ interval: Math.max(1, num) });
                  }}
                />
              </Input>
              <Text className="text-typography-600 font-medium">
                {customOptions.frequency.toLowerCase()}
                {customOptions.interval > 1 ? "s" : ""}
              </Text>
            </HStack>
          </FormControl>

          {/* Weekly Options */}
          {customOptions.frequency === "WEEKLY" && (
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
              <VStack space="sm" className="bg-background-50 p-4 rounded-lg">
                {WEEKDAY_OPTIONS.map((weekday) => (
                  <Checkbox
                    key={weekday.value}
                    size="md"
                    value={weekday.value}
                    isChecked={customOptions.weekdays.includes(weekday.value)}
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
          {customOptions.frequency === "MONTHLY" && (
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
                  selectedValue={customOptions.monthlyType}
                  onValueChange={(value) =>
                    updateCustomOptions({ monthlyType: value as any })
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

              {customOptions.monthlyType === "DAY_OF_MONTH" && (
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="font-medium text-typography-600">
                      Day of month
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" variant="outline" className="max-w-[100px]">
                    <InputField
                      keyboardType="numeric"
                      value={customOptions.dayOfMonth.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        updateCustomOptions({
                          dayOfMonth: Math.max(1, Math.min(31, num)),
                        });
                      }}
                    />
                  </Input>
                </FormControl>
              )}

              {customOptions.monthlyType === "DAY_OF_WEEK" && (
                <HStack space="md">
                  <FormControl className="flex-1">
                    <FormControlLabel>
                      <FormControlLabelText className="font-medium text-typography-600">
                        Week
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Select
                      selectedValue={customOptions.weekOfMonth.toString()}
                      onValueChange={(value) =>
                        updateCustomOptions({ weekOfMonth: parseInt(value) })
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
                      selectedValue={customOptions.dayOfWeek}
                      onValueChange={(value) =>
                        updateCustomOptions({ dayOfWeek: value as WeekdayType })
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

          {/* End Options */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="font-medium text-typography-700">
                End Repeat
              </FormControlLabelText>
            </FormControlLabel>
            <Select
              selectedValue={customOptions.endType}
              onValueChange={(value) =>
                updateCustomOptions({ endType: value as any })
              }
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

          {customOptions.endType === "ON_DATE" && (
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
                  {customOptions.endDate
                    ? customOptions.endDate.toLocaleDateString()
                    : "Select end date"}
                </ButtonText>
              </Button>
            </FormControl>
          )}

          {customOptions.endType === "AFTER_OCCURRENCES" && (
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
                  value={customOptions.occurrences?.toString() || "20"}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 20;
                    updateCustomOptions({
                      occurrences: Math.max(1, num),
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
              value={customOptions.endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}

          {/* Readable Summary */}
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
              {generateReadableDescription(customOptions)}
            </Text>
          </VStack>
        </VStack>
      )}

      {/* Form Errors */}
      {errors?.rrule && (
        <FormControlError className="mt-2">
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            {errors.rrule.message as string}
          </FormControlErrorText>
        </FormControlError>
      )}
    </VStack>
  );
}
