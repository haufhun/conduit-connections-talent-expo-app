import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { PRIMARY_COLOR } from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { Platform } from "react-native";

// Format date using moment in user's timezone
const formatDate = (dateString: string) => {
  return moment.utc(dateString).local().format("ddd, MMM D, YYYY");
};

// Format time using moment in user's timezone
const formatTime = (dateString: string) => {
  return moment.utc(dateString).local().format("h:mm A");
};

interface DateRangePickerProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  startTimeFieldName: Path<T>;
  endTimeFieldName: Path<T>;
  isAllDay?: boolean;
  startLabel?: string;
  endLabel?: string;
}

export function DateRangePicker<T extends FieldValues>({
  control,
  setValue,
  startTimeFieldName,
  endTimeFieldName,
  isAllDay = false,
  startLabel = "Start",
  endLabel = "End",
}: DateRangePickerProps<T>) {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Watch the start and end times to track changes
  const startTime = useWatch({ control, name: startTimeFieldName });
  const endTime = useWatch({ control, name: endTimeFieldName });

  // Use ref to store the previous start time
  const previousStartTimeRef = useRef<string | null>(null);

  // Effect to adjust end time when start time changes
  useEffect(() => {
    if (!startTime || !endTime) return;

    // Skip on initial mount
    if (previousStartTimeRef.current === null) {
      previousStartTimeRef.current = startTime;
      return;
    }

    // Check if start time has changed
    if (previousStartTimeRef.current !== startTime) {
      const previousStart = moment(previousStartTimeRef.current);
      const newStart = moment(startTime);
      const currentEnd = moment(endTime);

      // Calculate the duration between previous start and current end
      const durationMs = currentEnd.diff(previousStart);

      // Apply the same duration to the new start time
      const newEnd = newStart.add(durationMs, "millisecond");

      // Update the end time
      setValue(endTimeFieldName, newEnd.toISOString() as any);

      // Update the previous start time
      previousStartTimeRef.current = startTime;
    }
  }, [startTime, endTime, setValue, endTimeFieldName]);

  // Computed values based on selectedField
  const showStartDatePicker = selectedField === "start-date";
  const showStartTimePicker = selectedField === "start-time";
  const showEndDatePicker = selectedField === "end-date";
  const showEndTimePicker = selectedField === "end-time";

  const handleDateTimeChange = (
    type: "start" | "end",
    selectedDate: Date | undefined
  ) => {
    if (!selectedDate) return;

    // The DateTimePicker returns a Date object in local time
    // Convert it to ISO string which will be in UTC
    setValue(
      type === "start" ? startTimeFieldName : endTimeFieldName,
      selectedDate.toISOString() as any
    );
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
    <VStack space="md">
      <Controller
        control={control}
        name={startTimeFieldName}
        render={({ field: { value }, fieldState: { error } }) => (
          <FormControl isInvalid={Boolean(error)}>
            <FormControlLabel>
              <FormControlLabelText>
                {startLabel} {isAllDay ? "Date" : "Date & Time"}
              </FormControlLabelText>
            </FormControlLabel>
            <HStack space="sm">
              <Button
                size="lg"
                variant={selectedField === "start-date" ? "solid" : "outline"}
                style={{ flex: isAllDay ? 1.0 : 0.6 }}
                onPress={() => handleFieldPress("start-date")}
              >
                <ButtonText numberOfLines={1} adjustsFontSizeToFit>
                  {formatDate(value)}
                </ButtonText>
              </Button>
              {!isAllDay && (
                <Button
                  size="lg"
                  variant={selectedField === "start-time" ? "solid" : "outline"}
                  style={{ flex: 0.4 }}
                  onPress={() => handleFieldPress("start-time")}
                >
                  <ButtonText numberOfLines={1} adjustsFontSizeToFit>
                    {formatTime(value)}
                  </ButtonText>
                </Button>
              )}
              {/* {isAllDay && <HStack style={{ flex: 0.4 }} />} */}
            </HStack>

            {/* Date/Time Picker positioned directly below start time fields */}
            {selectedField === "start-date" && showStartDatePicker && (
              <VStack className="items-center">
                <DateTimePicker
                  value={moment.utc(value).local().toDate()}
                  mode="date"
                  accentColor={PRIMARY_COLOR}
                  display={Platform.OS === "ios" ? "inline" : "default"}
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
                    value={moment.utc(value).local().toDate()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
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
        name={endTimeFieldName}
        render={({ field: { value }, fieldState: { error } }) => (
          <FormControl isInvalid={Boolean(error)}>
            <FormControlLabel>
              <FormControlLabelText>
                {endLabel} {isAllDay ? "Date" : "Date & Time"}
              </FormControlLabelText>
            </FormControlLabel>
            <HStack space="sm">
              <Button
                size="lg"
                variant={selectedField === "end-date" ? "solid" : "outline"}
                style={{ flex: isAllDay ? 1.0 : 0.6 }}
                onPress={() => handleFieldPress("end-date")}
              >
                <ButtonText numberOfLines={1} adjustsFontSizeToFit>
                  {formatDate(value)}
                </ButtonText>
              </Button>
              {!isAllDay && (
                <Button
                  size="lg"
                  variant={selectedField === "end-time" ? "solid" : "outline"}
                  style={{ flex: 0.4 }}
                  onPress={() => handleFieldPress("end-time")}
                >
                  <ButtonText numberOfLines={1} adjustsFontSizeToFit>
                    {formatTime(value)}
                  </ButtonText>
                </Button>
              )}
              {/* {isAllDay && <HStack style={{ flex: 0.4 }} />} */}
            </HStack>

            {/* Date/Time Picker positioned directly below end time fields */}
            {selectedField === "end-date" && showEndDatePicker && (
              <VStack className="items-center mt-4">
                <DateTimePicker
                  value={moment.utc(value).local().toDate()}
                  mode="date"
                  accentColor={PRIMARY_COLOR}
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(_event, selectedDate) =>
                    handleDateTimeChange("end", selectedDate)
                  }
                />
              </VStack>
            )}

            {selectedField === "end-time" && showEndTimePicker && !isAllDay && (
              <VStack className="items-center mt-4">
                <DateTimePicker
                  value={moment.utc(value).local().toDate()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
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
  );
}
