import { Button, ButtonText } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icon";
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
import {
  convertToRRule,
  generateReadableDescription,
  parseRRule,
} from "@/utils/recurring-schedule";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

interface RecurringScheduleFormProps {
  startDate: Date;
  onRRuleChange: (rrule: string) => void;
  initialRRule?: string;
}

export const RecurringScheduleForm: React.FC<RecurringScheduleFormProps> = ({
  startDate,
  onRRuleChange,
  // initialRRule,
}) => {
  const initialRRule = "RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=WE";

  const [options, setOptions] = useState<RecurringScheduleOptions>(() => {
    // If an initial RRULE is provided, parse it to get the options
    if (initialRRule) {
      try {
        // console.log("Parsing initial RRULE:", initialRRule);

        return parseRRule(initialRRule, startDate);
      } catch (error) {
        console.warn("Failed to parse initial RRULE:", error);
        // Fall back to defaults if parsing fails
      }
    }

    // Default options if no initial RRULE or parsing failed
    return {
      frequency: "WEEKLY",
      interval: 1,
      weekdays: [],
      monthlyType: "DAY_OF_MONTH",
      dayOfMonth: startDate.getDate(),
      weekOfMonth: 1,
      dayOfWeek: "MONDAY",
      endType: "NEVER",
    };
  });

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Update RRULE whenever options change
  useEffect(() => {
    const rrule = convertToRRule(options, startDate);
    onRRuleChange(rrule);
  }, [options, startDate, onRRuleChange]);

  const updateOptions = useCallback(
    (updates: Partial<RecurringScheduleOptions>) => {
      setOptions((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleWeekdayToggle = useCallback(
    (weekday: WeekdayType, isChecked: boolean) => {
      if (isChecked) {
        updateOptions({
          weekdays: [...options.weekdays, weekday],
        });
      } else {
        updateOptions({
          weekdays: options.weekdays.filter((day) => day !== weekday),
        });
      }
    },
    [options.weekdays, updateOptions]
  );

  const handleEndDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowEndDatePicker(false);
      if (selectedDate) {
        updateOptions({ endDate: selectedDate });
      }
    },
    [updateOptions]
  );

  return (
    <VStack
      space="lg"
      className="p-6 bg-background-0 rounded-xl border border-outline-200 shadow-sm"
    >
      <VStack space="md">
        <Text size="lg" className="font-semibold text-typography-900">
          🔄 Recurrence Pattern
        </Text>

        {/* Frequency Selection */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="font-medium text-typography-700">
              Repeat
            </FormControlLabelText>
          </FormControlLabel>
          <Select
            selectedValue={options.frequency}
            onValueChange={(value) =>
              updateOptions({ frequency: value as any })
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
                value={options.interval.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  updateOptions({ interval: Math.max(1, num) });
                }}
              />
            </Input>
            <Text className="text-typography-600 font-medium">
              {options.frequency.toLowerCase()}
              {options.interval > 1 ? "s" : ""}
            </Text>
          </HStack>
        </FormControl>

        {/* Weekly Options */}
        {options.frequency === "WEEKLY" && (
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="font-medium text-typography-700">
                📅 On these days
              </FormControlLabelText>
            </FormControlLabel>
            <VStack space="sm" className="bg-background-50 p-4 rounded-lg">
              {WEEKDAY_OPTIONS.map((weekday) => (
                <Checkbox
                  key={weekday.value}
                  size="md"
                  value={weekday.value}
                  isChecked={options.weekdays.includes(weekday.value)}
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
        {options.frequency === "MONTHLY" && (
          <VStack space="md" className="bg-background-50 p-4 rounded-lg">
            <Text size="md" className="font-medium text-typography-700">
              📆 Monthly Options
            </Text>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="font-medium text-typography-600">
                  Pattern
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={options.monthlyType}
                onValueChange={(value) =>
                  updateOptions({ monthlyType: value as any })
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

            {options.monthlyType === "DAY_OF_MONTH" && (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="font-medium text-typography-600">
                    Day of month
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" variant="outline" className="max-w-[100px]">
                  <InputField
                    keyboardType="numeric"
                    value={options.dayOfMonth.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      updateOptions({
                        dayOfMonth: Math.max(1, Math.min(31, num)),
                      });
                    }}
                  />
                </Input>
              </FormControl>
            )}

            {options.monthlyType === "DAY_OF_WEEK" && (
              <HStack space="md">
                <FormControl className="flex-1">
                  <FormControlLabel>
                    <FormControlLabelText className="font-medium text-typography-600">
                      Week
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Select
                    selectedValue={options.weekOfMonth.toString()}
                    onValueChange={(value) =>
                      updateOptions({ weekOfMonth: parseInt(value) })
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
                    selectedValue={options.dayOfWeek}
                    onValueChange={(value) =>
                      updateOptions({ dayOfWeek: value as WeekdayType })
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
              🏁 End
            </FormControlLabelText>
          </FormControlLabel>
          <Select
            selectedValue={options.endType}
            onValueChange={(value) => updateOptions({ endType: value as any })}
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

        {options.endType === "ON_DATE" && (
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
                {options.endDate
                  ? options.endDate.toLocaleDateString()
                  : "Select end date"}
              </ButtonText>
            </Button>
          </FormControl>
        )}

        {options.endType === "AFTER_OCCURRENCES" && (
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
                value={options.occurrences?.toString() || ""}
                onChangeText={(text) => {
                  const num = parseInt(text) || undefined;
                  updateOptions({
                    occurrences: num ? Math.max(1, num) : undefined,
                  });
                }}
                placeholder="e.g., 10"
              />
            </Input>
          </FormControl>
        )}

        {/* Readable Summary */}
        <VStack
          space="sm"
          className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200"
        >
          <Text size="md" className="font-semibold text-primary-700">
            ✨ Summary
          </Text>
          <Text size="sm" className="text-primary-600 leading-relaxed">
            {generateReadableDescription(options)}
          </Text>
        </VStack>
      </VStack>

      {/* End Date Picker */}
      {showEndDatePicker && (
        <DateTimePicker
          value={options.endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}
    </VStack>
  );
};
