import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
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
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import {
  skillSumarySchema,
  type SkillSummarySchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EditIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, TouchableOpacity } from "react-native";

interface SkillSummarySectionProps {
  summary: string | null;
  onUpdateSummary: (summary: string | null) => void | Promise<void>;
  showEditControls?: boolean;
  isLoading?: boolean;
  mode?: "create" | "edit";
  error?: string;
}

export default function SkillSummarySection({
  summary,
  onUpdateSummary,
  showEditControls = true,
  isLoading = false,
  mode = "edit",
  error,
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
      summary: summary || "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateSummary(data.summary || null);
      setSummaryModalVisible(false);
    } catch (error) {
      console.error("Error updating summary:", error);
      Alert.alert("Error", "Failed to update summary");
    }
  });

  const handleModalOpen = () => {
    reset({ summary: summary || "" });
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
        {showEditControls && mode === "edit" && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleModalOpen}
            className="border-primary-300 bg-primary-50"
          >
            <ButtonIcon as={EditIcon} size="sm" className="text-primary-600" />
            <ButtonText className="text-primary-600 ml-1">
              {summary ? "Edit" : "Add Summary"}
            </ButtonText>
          </Button>
        )}
      </HStack>

      {mode === "create" ? (
        // Create mode: Show inline form
        <VStack space="md">
          <FormControl isInvalid={Boolean(error)}>
            <FormControlLabel>
              <FormControlLabelText className="font-medium text-typography-700">
                Summary
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              size="lg"
              variant="outline"
              className="min-h-[160px] h-[160px] bg-background-50"
            >
              <InputField
                placeholder="Write a summary of your experience with this skill..."
                value={summary || ""}
                onChangeText={(text) => {
                  onUpdateSummary(text || null);
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{
                  height: 160,
                  paddingTop: 12,
                  paddingBottom: 12,
                  textAlignVertical: "top",
                }}
              />
            </Input>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText size="sm">{error}</FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
      ) : (
        // Edit mode: Show current behavior
        <>
          {summary ? (
            <VStack space="md">
              <TouchableOpacity
                onPress={() => setSummaryExpanded(!summaryExpanded)}
                activeOpacity={0.7}
                className="bg-background-50 p-4 rounded-lg"
              >
                <Text className="text-typography-700 text-base leading-6">
                  {summaryExpanded ? summary : getSummaryPreview(summary)}
                </Text>
              </TouchableOpacity>
              {summary.split("\n").length > 4 && (
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
        </>
      )}

      {/* Summary Edit Modal */}
      {showEditControls && mode === "edit" && (
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
      )}
    </VStack>
  );
}
