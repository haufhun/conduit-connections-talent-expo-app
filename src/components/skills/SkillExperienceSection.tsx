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
  skillExperienceSchema,
  type SkillExperienceSchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, TouchableOpacity } from "react-native";

interface SkillExperienceSectionProps {
  skill: TalentSkill;
  isLoading: boolean;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

export default function SkillExperienceSection({
  skill,
  isLoading,
  onUpdateSkill,
}: SkillExperienceSectionProps) {
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillExperienceSchemaType>({
    resolver: zodResolver(skillExperienceSchema),
    defaultValues: {
      years_of_experience: skill.years_of_experience,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateSkill(data);
      setExperienceModalVisible(false);
    } catch (error) {
      console.error("Error updating experience:", error);
      Alert.alert("Error", "Failed to update experience");
    }
  });

  const handleModalOpen = () => {
    reset({ years_of_experience: skill.years_of_experience });
    setExperienceModalVisible(true);
  };

  return (
    <VStack className="bg-white rounded-xl p-6 border border-outline-200 shadow-sm">
      <HStack className="justify-between items-center mb-4">
        <HStack className="items-center" space="sm">
          <IconSymbol
            name="clock.fill"
            size={20}
            color={BrandColors.SECONDARY}
          />
          <Text size="lg" bold className="text-typography-900">
            Experience
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
        <Text size="lg" className="text-typography-700">
          {skill.years_of_experience}{" "}
          {skill.years_of_experience === 1 ? "year" : "years"} of experience
        </Text>
      </VStack>

      {/* Experience Edit Modal */}
      <Modal
        isOpen={experienceModalVisible}
        onClose={() => setExperienceModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Experience
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Controller
              control={control}
              name="years_of_experience"
              render={({ field: { value, onChange } }) => (
                <FormControl isInvalid={Boolean(errors.years_of_experience)}>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="Years of experience"
                      value={value?.toString() ?? ""}
                      maxLength={2}
                      onChangeText={(text) =>
                        onChange(text === "" ? 0 : parseFloat(text))
                      }
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  {errors.years_of_experience?.message && (
                    <Text size="xs" className="text-error-600">
                      {errors.years_of_experience.message}
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
              onPress={() => setExperienceModalVisible(false)}
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
