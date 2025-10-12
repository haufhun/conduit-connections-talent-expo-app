import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon, ChevronRightIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

interface SelectSkillSectionProps {
  selectedSkillName: string | null;
  error?: string;
}

export default function SelectSkillSection({
  selectedSkillName,
  error,
}: SelectSkillSectionProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile/skill/select");
  };

  return (
    <VStack
      space="md"
      className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
    >
      <HStack className="justify-between items-center">
        <HStack space="sm" className="items-center">
          <IconSymbol
            name="list.bullet"
            size={20}
            color={BrandColors.PRIMARY}
          />
          <Text size="lg" className="font-semibold text-typography-900">
            Select Skill
          </Text>
        </HStack>
      </HStack>

      <FormControl isInvalid={Boolean(error)}>
        <TouchableOpacity onPress={handlePress}>
          <FormControlLabel>
            <FormControlLabelText className="font-medium text-typography-700">
              Choose a skill to add to your profile
            </FormControlLabelText>
          </FormControlLabel>

          <Input
            size="lg"
            variant="outline"
            isReadOnly
            isDisabled
            pointerEvents="none"
            className="bg-background-50"
          >
            <InputField
              placeholder="Tap to select a skill..."
              value={selectedSkillName || ""}
              editable={false}
              style={{ color: selectedSkillName ? "#000" : "#999" }}
            />
            <InputSlot>
              <InputIcon as={ChevronRightIcon} />
            </InputSlot>
          </Input>
        </TouchableOpacity>

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText size="sm">{error}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    </VStack>
  );
}
