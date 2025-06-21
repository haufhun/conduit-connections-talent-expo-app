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
import { getDayjsFromUtcDateString } from "@/utils/date";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
} from "react-hook-form";
import { Platform } from "react-native";

// Format date using dayjs in user's timezone
const formatDate = (dateString: string) => {
  return getDayjsFromUtcDateString(dateString).format("ddd, MMM D, YYYY");
};

// Format time using dayjs in user's timezone
const formatTime = (dateString: string) => {
  return getDayjsFromUtcDateString(dateString).format("h:mm A");
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
                className="flex-1"
                onPress={() => handleFieldPress("start-date")}
              >
                <ButtonText>{formatDate(value)}</ButtonText>
              </Button>
              {!isAllDay && (
                <Button
                  size="lg"
                  variant={selectedField === "start-time" ? "solid" : "outline"}
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
                  value={new Date(value)}
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
                    value={new Date(value)}
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
                className="flex-1"
                onPress={() => handleFieldPress("end-date")}
              >
                <ButtonText>{formatDate(value)}</ButtonText>
              </Button>
              {!isAllDay && (
                <Button
                  size="lg"
                  variant={selectedField === "end-time" ? "solid" : "outline"}
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
                  value={getDayjsFromUtcDateString(value).toDate()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_event, selectedDate) =>
                    handleDateTimeChange("end", selectedDate)
                  }
                />
              </VStack>
            )}

            {selectedField === "end-time" && showEndTimePicker && !isAllDay && (
              <VStack className="items-center mt-4">
                <DateTimePicker
                  value={getDayjsFromUtcDateString(value).toDate()}
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
