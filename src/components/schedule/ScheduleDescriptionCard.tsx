import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { Control, Controller, FieldError } from "react-hook-form";

interface ScheduleDescriptionCardProps {
  control?: Control<any>;
  error?: FieldError;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ScheduleDescriptionCard({
  control,
  error,
  value,
  onChange,
}: ScheduleDescriptionCardProps) {
  // If using with react-hook-form Controller
  if (control) {
    return (
      <VStack
        space="md"
        className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
      >
        <HStack space="sm" className="items-center">
          <IconSymbol
            name="text.alignleft"
            size={20}
            color={BrandColors.TERTIARY}
          />
          <Text size="lg" className="font-semibold text-typography-900">
            Description
          </Text>
        </HStack>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <FormControl isInvalid={Boolean(error)}>
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
      </VStack>
    );
  }

  // If using with direct value/onChange props (for non-react-hook-form usage)
  return (
    <VStack
      space="md"
      className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
    >
      <HStack space="sm" className="items-center">
        <IconSymbol
          name="text.alignleft"
          size={20}
          color={BrandColors.TERTIARY}
        />
        <Text size="lg" className="font-semibold text-typography-900">
          Description
        </Text>
      </HStack>
      <FormControl isInvalid={Boolean(error)}>
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
    </VStack>
  );
}
