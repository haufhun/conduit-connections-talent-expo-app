import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { CalendarDaysIcon, CheckIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

interface ScheduleDateTimeCardProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  isAllDay: boolean;
  startTimeFieldName?: string;
  endTimeFieldName?: string;
}

export default function ScheduleDateTimeCard({
  control,
  setValue,
  isAllDay,
  startTimeFieldName = "start_time",
  endTimeFieldName = "end_time",
}: ScheduleDateTimeCardProps) {
  return (
    <VStack
      space="md"
      className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
    >
      <HStack space="sm" className="items-center">
        <Icon as={CalendarDaysIcon} size="md" className="text-primary-600" />
        <Text size="lg" className="font-semibold text-typography-900">
          Date & Time
        </Text>
      </HStack>

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
              className="bg-background-50 p-3 rounded-lg"
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel className="text-typography-700 font-medium">
                All Day
              </CheckboxLabel>
            </Checkbox>
          </FormControl>
        )}
      />

      <DateRangePicker
        control={control}
        setValue={setValue}
        startTimeFieldName={startTimeFieldName}
        endTimeFieldName={endTimeFieldName}
        isAllDay={isAllDay}
      />
    </VStack>
  );
}
