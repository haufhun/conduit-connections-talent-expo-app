import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { Control, Controller, FieldError } from "react-hook-form";

interface ScheduleTitleCardProps {
  control: Control<any>;
  error?: FieldError;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ScheduleTitleCard({
  control,
  error,
  value,
  onChange,
}: ScheduleTitleCardProps) {
  // If using with react-hook-form Controller
  if (control) {
    return (
      <VStack
        space="md"
        className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
      >
        <HStack space="sm" className="items-center">
          <IconSymbol
            name="doc.text.fill"
            size={20}
            color={BrandColors.SECONDARY}
          />
          <Text size="lg" className="font-semibold text-typography-900">
            Title
          </Text>
        </HStack>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <FormControl isInvalid={Boolean(error)}>
              <Input size="lg" variant="outline" className="bg-background-50">
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
          name="doc.text.fill"
          size={20}
          color={BrandColors.SECONDARY}
        />
        <Text size="lg" className="font-semibold text-typography-900">
          Title
        </Text>
      </HStack>
      <FormControl isInvalid={Boolean(error)}>
        <Input size="lg" variant="outline" className="bg-background-50">
          <InputField
            placeholder="Enter blockout title..."
            value={value || ""}
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
    </VStack>
  );
}
