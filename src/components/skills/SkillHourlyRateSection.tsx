import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
import { TalentSkill } from "@/types/skills";
import {
  skillHourlyRateSchema,
  type SkillHourlyRateSchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet } from "react-native";

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
    <VStack space="xs" style={styles.section}>
      <HStack className="justify-between items-center">
        <Text bold className="text-typography-700">
          Hourly Rate
        </Text>
        <Button variant="link" onPress={handleModalOpen} className="p-0">
          <HStack space="xs" className="items-center">
            <ButtonIcon as={EditIcon} />
            <ButtonText>Edit</ButtonText>
          </HStack>
        </Button>
      </HStack>
      {skill.hourly_rate ? (
        <Text className="text-typography-600">${skill.hourly_rate}/hr</Text>
      ) : (
        <Text className="text-typography-500 italic">No rate specified</Text>
      )}

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

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
});
