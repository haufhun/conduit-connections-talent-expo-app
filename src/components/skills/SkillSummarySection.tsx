import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
import { TalentSkill } from "@/types/skills";
import {
  skillSumarySchema,
  type SkillSummarySchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

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
    <VStack space="xs" style={styles.section}>
      <HStack className="justify-between items-center">
        <Text bold className="text-typography-700">
          Summary
        </Text>
        <Button variant="link" onPress={handleModalOpen} className="p-0">
          <HStack space="xs" className="items-center">
            <ButtonIcon as={EditIcon} />
            <ButtonText>Edit</ButtonText>
          </HStack>
        </Button>
      </HStack>
      {skill.summary ? (
        <VStack space="sm">
          <TouchableOpacity
            onPress={() => setSummaryExpanded(!summaryExpanded)}
            activeOpacity={0.7}
          >
            <Text className="text-typography-600">
              {summaryExpanded
                ? skill.summary
                : getSummaryPreview(skill.summary)}
            </Text>
          </TouchableOpacity>
          {skill.summary.split("\n").length > 4 && (
            <Button
              variant="link"
              size="sm"
              onPress={() => setSummaryExpanded(!summaryExpanded)}
            >
              <ButtonText>
                {summaryExpanded ? "Show Less" : "Show More"}
              </ButtonText>
            </Button>
          )}
        </VStack>
      ) : (
        <Text className="text-typography-500 italic">No summary added</Text>
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
                  <Textarea
                    size="lg"
                    variant="default"
                    style={styles.summaryInputContainer}
                  >
                    <TextareaInput
                      placeholder="Write a summary of your experience with this skill..."
                      value={value}
                      onChangeText={onChange}
                      numberOfLines={6}
                      style={styles.summaryInput}
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

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  summaryInputContainer: {
    minHeight: 160,
    height: 160,
  },
  summaryInput: {
    height: 160,
  },
});
