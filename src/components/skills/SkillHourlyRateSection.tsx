import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { TalentSkill } from "@/types/skills";
import {
  skillHourlyRateSchema,
  type SkillHourlyRateSchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, TouchableOpacity } from "react-native";

interface SkillHourlyRateSectionProps {
  skill: TalentSkill;
  isLoading: boolean;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

export default function SkillHourlyRateSection({
  skill,
  isLoading,
  onUpdateSkill,
}: SkillHourlyRateSectionProps) {
  const [hourlyRateModalVisible, setHourlyRateModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillHourlyRateSchemaType>({
    resolver: zodResolver(skillHourlyRateSchema),
    defaultValues: {
      hourly_rate: skill.hourly_rate,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateSkill(data);
      setHourlyRateModalVisible(false);
    } catch (error) {
      console.error("Error updating hourly rate:", error);
      Alert.alert("Error", "Failed to update hourly rate");
    }
  });

  const handleModalOpen = () => {
    reset({ hourly_rate: skill.hourly_rate });
    setHourlyRateModalVisible(true);
  };

  return (
    <VStack className="bg-white rounded-xl p-6 border border-outline-200 shadow-sm">
      <HStack className="justify-between items-center mb-4">
        <HStack className="items-center" space="sm">
          <IconSymbol
            name="dollarsign.circle.fill"
            size={20}
            color={BrandColors.TERTIARY}
          />
          <Text size="lg" bold className="text-typography-900">
            Hourly Rate
          </Text>
        </HStack>
        <TouchableOpacity
          onPress={handleModalOpen}
          className="p-2 rounded-full bg-primary-50"
        >
          <IconSymbol
            name="square.and.pencil"
            size={16}
            color={BrandColors.PRIMARY}
          />
        </TouchableOpacity>
      </HStack>
      <VStack className="bg-background-50 p-4 rounded-lg">
        {skill.hourly_rate ? (
          <Text size="lg" className="text-typography-700">
            ${skill.hourly_rate}/hr
          </Text>
        ) : (
          <Text className="text-typography-500 italic">No rate specified</Text>
        )}
      </VStack>

      {/* Hourly Rate Edit Modal */}
      <Modal
        isOpen={hourlyRateModalVisible}
        onClose={() => setHourlyRateModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Hourly Rate
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Controller
              control={control}
              name="hourly_rate"
              render={({ field: { value, onChange } }) => (
                <FormControl isInvalid={Boolean(errors.hourly_rate)}>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="Hourly rate (e.g., 50)"
                      value={value?.toString() ?? ""}
                      maxLength={3}
                      onChangeText={(text) =>
                        onChange(text === "" ? 0 : parseFloat(text))
                      }
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  {errors.hourly_rate?.message && (
                    <Text size="xs" className="text-error-600">
                      {errors.hourly_rate.message}
                    </Text>
                  )}
                </FormControl>
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setHourlyRateModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={onSubmit}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
