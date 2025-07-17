import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { TalentSkill } from "@/types/skills";
import {
  skillSumarySchema,
  type SkillSummarySchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, TouchableOpacity } from "react-native";

interface SkillSummarySectionProps {
  skill: TalentSkill;
  isLoading: boolean;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

export default function SkillSummarySection({
  skill,
  isLoading,
  onUpdateSkill,
}: SkillSummarySectionProps) {
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillSummarySchemaType>({
    resolver: zodResolver(skillSumarySchema),
    defaultValues: {
      summary: skill.summary,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateSkill(data);
      setSummaryModalVisible(false);
    } catch (error) {
      console.error("Error updating summary:", error);
      Alert.alert("Error", "Failed to update summary");
    }
  });

  const handleModalOpen = () => {
    reset({ summary: skill.summary });
    setSummaryModalVisible(true);
  };

  const getSummaryPreview = (summary: string) => {
    // Split by common sentence endings
    const sentences = summary.match(/[^.!?]+[.!?]+/g) || [summary];
    const previewSentences = sentences.slice(0, 4);
    const preview = previewSentences.join(" ").trim();

    // If there's more content and we're not ending with ..., add ...
    return (
      preview +
      (preview.length < summary.length && !preview.endsWith("...") ? "..." : "")
    );
  };

  return (
    <VStack className="bg-white rounded-xl p-6 border border-outline-200 shadow-sm">
      <HStack className="justify-between items-center mb-4">
        <HStack className="items-center" space="sm">
          <IconSymbol
            name="doc.text.fill"
            size={20}
            color={BrandColors.SECONDARY}
          />
          <Text size="lg" bold className="text-typography-900">
            Summary
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
      {skill.summary ? (
        <VStack space="md">
          <TouchableOpacity
            onPress={() => setSummaryExpanded(!summaryExpanded)}
            activeOpacity={0.7}
            className="bg-background-50 p-4 rounded-lg"
          >
            <Text className="text-typography-700 text-base leading-6">
              {summaryExpanded
                ? skill.summary
                : getSummaryPreview(skill.summary)}
            </Text>
          </TouchableOpacity>
          {skill.summary.split("\n").length > 4 && (
            <Button
              variant="link"
              size="sm"
              action="primary"
              onPress={() => setSummaryExpanded(!summaryExpanded)}
              className="justify-start px-0"
            >
              <ButtonText className="text-primary-600">
                {summaryExpanded ? "Show Less" : "Show More"}
              </ButtonText>
            </Button>
          )}
        </VStack>
      ) : (
        <VStack className="bg-background-50 p-6 rounded-lg border border-outline-200">
          <Text className="text-typography-500 text-center">
            No summary added yet
          </Text>
        </VStack>
      )}

      {/* Summary Edit Modal */}
      <Modal
        isOpen={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Summary
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Controller
              control={control}
              name="summary"
              render={({ field: { value, onChange } }) => (
                <FormControl isInvalid={Boolean(errors.summary)}>
                  <Textarea size="lg" variant="default" className="min-h-40">
                    <TextareaInput
                      placeholder="Write a summary of your experience with this skill..."
                      value={value}
                      onChangeText={onChange}
                      numberOfLines={6}
                      className="min-h-40"
                    />
                  </Textarea>
                  {errors.summary?.message && (
                    <Text size="xs" className="text-error-600">
                      {errors.summary.message}
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
              onPress={() => setSummaryModalVisible(false)}
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
