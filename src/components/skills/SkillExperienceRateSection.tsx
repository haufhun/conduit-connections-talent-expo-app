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
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import {
  skillExperienceRateSchema,
  type SkillExperienceRateSchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EditIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

interface SkillExperienceRateSectionProps {
  yearsOfExperience: number | null;
  hourlyRate: number | null;
  onUpdateExperienceRate: (data: {
    years_of_experience: number | null;
    hourly_rate: number | null;
  }) => void | Promise<void>;
  showEditControls?: boolean;
  isLoading?: boolean;
  mode?: "create" | "edit";
  yearsOfExperienceError?: string;
  hourlyRateError?: string;
}

// Default values for numeric inputs
const DEFAULT_YEARS_OF_EXPERIENCE = 0;
const DEFAULT_HOURLY_RATE = 0;

function isValidNumericInput(text: string): boolean {
  const num = parseFloat(text);
  return !isNaN(num) && num >= 0;
}
// Utility function to handle numeric input blur
function handleNumericInputBlur(
  inputValue: string,
  defaultValue: number,
  setInputValue: (val: string) => void,
  onChange?: (val: number) => void,
  onUpdate?: (val: number) => void
) {
  if (inputValue === "" || !isValidNumericInput(inputValue)) {
    setInputValue(defaultValue.toString());
    if (onChange) onChange(defaultValue);
    if (onUpdate) onUpdate(defaultValue);
  }
}

export default function SkillExperienceRateSection({
  yearsOfExperience,
  hourlyRate,
  onUpdateExperienceRate,
  showEditControls = true,
  isLoading = false,
  mode = "edit",
  yearsOfExperienceError,
  hourlyRateError,
}: SkillExperienceRateSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const isYearsOfExperienceSpecified =
    yearsOfExperience !== null && yearsOfExperience !== undefined;
  const isHourlyRateSpecified = hourlyRate !== null && hourlyRate !== undefined;

  // Local state for create mode inputs to allow empty strings
  const [yearsInputValue, setYearsInputValue] = useState<string>("");
  const [rateInputValue, setRateInputValue] = useState<string>("");

  // Local state for edit modal inputs to allow empty strings
  const [modalYearsValue, setModalYearsValue] = useState<string>("");
  const [modalRateValue, setModalRateValue] = useState<string>("");

  const { control, handleSubmit, reset } =
    useForm<SkillExperienceRateSchemaType>({
      resolver: zodResolver(skillExperienceRateSchema),
      defaultValues: {
        years_of_experience: yearsOfExperience || undefined,
        hourly_rate: hourlyRate || undefined,
      },
    });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateExperienceRate({
        years_of_experience: data.years_of_experience || null,
        hourly_rate: data.hourly_rate || null,
      });
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating experience and rate:", error);
      Alert.alert("Error", "Failed to update experience and rate");
    }
  });

  const handleModalOpen = () => {
    const yearsValue = yearsOfExperience ?? undefined;
    const rateValue = hourlyRate ?? undefined;

    reset({
      years_of_experience: yearsValue,
      hourly_rate: rateValue,
    });

    // Initialize modal input values
    setModalYearsValue(yearsValue?.toString() ?? "");
    setModalRateValue(rateValue?.toString() ?? "");

    setModalVisible(true);
  };

  // Sync local input values with props in create mode
  React.useEffect(() => {
    if (mode === "create") {
      setYearsInputValue(yearsOfExperience?.toString() ?? "");
      setRateInputValue(hourlyRate?.toString() ?? "");
    }
  }, [yearsOfExperience, hourlyRate, mode]);

  return (
    <>
      <VStack
        space="md"
        className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
      >
        <HStack className="justify-between items-center">
          <HStack space="sm" className="items-center">
            <IconSymbol
              name="dollarsign.circle.fill"
              size={20}
              color={BrandColors.TERTIARY}
            />
            <Text size="lg" className="font-semibold text-typography-900">
              Experience & Rate
            </Text>
          </HStack>
          {showEditControls && mode === "edit" && (
            <Button
              variant="outline"
              size="sm"
              onPress={handleModalOpen}
              className="border-primary-300 bg-primary-50"
            >
              <ButtonIcon
                as={EditIcon}
                size="sm"
                className="text-primary-600"
              />
              <ButtonText className="text-primary-600 ml-1">
                {isYearsOfExperienceSpecified || isHourlyRateSpecified
                  ? "Edit"
                  : "Add Details"}
              </ButtonText>
            </Button>
          )}
        </HStack>

        {mode === "create" ? (
          // Create mode: Show inline form
          <HStack space="md">
            <VStack space="md" className="flex-1">
              <FormControl isInvalid={Boolean(yearsOfExperienceError)}>
                <FormControlLabel>
                  <FormControlLabelText className="font-medium text-typography-700">
                    Years of Experience
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" variant="outline" className="bg-background-50">
                  <InputField
                    value={yearsInputValue}
                    accessibilityLabel="Years of Experience"
                    onChangeText={(text) => {
                      setYearsInputValue(text);
                      if (text === "") {
                        return;
                      }
                      if (isValidNumericInput(text)) {
                        onUpdateExperienceRate({
                          years_of_experience: parseFloat(text),
                          hourly_rate: hourlyRate,
                        });
                      }
                    }}
                    onBlur={() =>
                      handleNumericInputBlur(
                        yearsInputValue,
                        DEFAULT_YEARS_OF_EXPERIENCE,
                        setYearsInputValue,
                        undefined,
                        (val) =>
                          onUpdateExperienceRate({
                            years_of_experience: val,
                            hourly_rate: hourlyRate,
                          })
                      )
                    }
                    keyboardType="decimal-pad"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {yearsOfExperienceError}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            </VStack>

            <VStack space="md" className="flex-1">
              <FormControl isInvalid={Boolean(hourlyRateError)}>
                <FormControlLabel>
                  <FormControlLabelText className="font-medium text-typography-700">
                    Hourly Rate
                  </FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" variant="outline" className="bg-background-50">
                  <InputField
                    value={rateInputValue}
                    accessibilityLabel="Hourly Rate"
                    onChangeText={(text) => {
                      setRateInputValue(text);
                      if (text === "") {
                        return;
                      }
                      if (isValidNumericInput(text)) {
                        onUpdateExperienceRate({
                          years_of_experience: yearsOfExperience,
                          hourly_rate: parseFloat(text),
                        });
                      }
                    }}
                    onBlur={() =>
                      handleNumericInputBlur(
                        rateInputValue,
                        DEFAULT_HOURLY_RATE,
                        setRateInputValue,
                        undefined,
                        (val) =>
                          onUpdateExperienceRate({
                            years_of_experience: yearsOfExperience,
                            hourly_rate: val,
                          })
                      )
                    }
                    keyboardType="decimal-pad"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {hourlyRateError}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            </VStack>
          </HStack>
        ) : (
          // Edit mode: Show current values
          <HStack space="md">
            <VStack
              space="sm"
              className="flex-1 bg-background-50 p-4 rounded-lg"
            >
              <Text size="sm" className="text-typography-600 font-medium">
                Experience
              </Text>
              <Text size="lg" className="text-typography-700">
                {isYearsOfExperienceSpecified ? (
                  yearsOfExperience === 0 ? (
                    "< 1 year"
                  ) : (
                    `${yearsOfExperience} ${
                      yearsOfExperience === 1 ? "year" : "years"
                    }`
                  )
                ) : (
                  <Text className="text-typography-500 italic">
                    Not specified
                  </Text>
                )}
              </Text>
            </VStack>

            <VStack
              space="sm"
              className="flex-1 bg-background-50 p-4 rounded-lg"
            >
              <Text size="sm" className="text-typography-600 font-medium">
                Hourly Rate
              </Text>
              {isHourlyRateSpecified ? (
                hourlyRate === 0 ? (
                  <Text size="lg" className="text-success-600 font-semibold">
                    Free
                  </Text>
                ) : (
                  <Text size="lg" className="text-success-600 font-semibold">
                    ${hourlyRate}/hr
                  </Text>
                )
              ) : (
                <Text size="lg" className="text-typography-500 italic">
                  Not specified
                </Text>
              )}
            </VStack>
          </HStack>
        )}
      </VStack>

      {/* Experience & Rate Edit Modal */}
      {showEditControls && mode === "edit" && (
        <Modal
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
          size="lg"
        >
          <ModalBackdrop />
          <ModalContent className="bg-background-0">
            <ModalHeader className="border-b border-outline-100">
              <VStack space="xs">
                <Text size="lg" className="font-semibold text-typography-900">
                  Edit Experience & Rate
                </Text>
                <Text size="sm" className="text-typography-500">
                  Update your years of experience and hourly rate
                </Text>
              </VStack>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody className="py-6">
              <VStack space="lg">
                <Controller
                  control={control}
                  name="years_of_experience"
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <FormControl isInvalid={Boolean(error)}>
                      <FormControlLabel>
                        <FormControlLabelText className="font-medium text-typography-700">
                          Years of Experience
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        size="lg"
                        variant="outline"
                        className="border-outline-200 focus:border-primary-500"
                      >
                        <InputField
                          value={modalYearsValue}
                          onChangeText={(text) => {
                            setModalYearsValue(text);
                            if (text === "") {
                              onChange(undefined);
                              return;
                            }
                            if (isValidNumericInput(text)) {
                              onChange(parseFloat(text));
                            }
                          }}
                          onBlur={() =>
                            handleNumericInputBlur(
                              modalYearsValue,
                              DEFAULT_YEARS_OF_EXPERIENCE,
                              setModalYearsValue,
                              onChange
                            )
                          }
                          keyboardType="decimal-pad"
                          className="text-typography-900"
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

                <Controller
                  control={control}
                  name="hourly_rate"
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <FormControl isInvalid={Boolean(error)}>
                      <FormControlLabel>
                        <FormControlLabelText className="font-medium text-typography-700">
                          Hourly Rate ($)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        size="lg"
                        variant="outline"
                        className="border-outline-200 focus:border-primary-500"
                      >
                        <InputField
                          value={modalRateValue}
                          onChangeText={(text) => {
                            setModalRateValue(text);
                            if (text === "") {
                              onChange(undefined);
                              return;
                            }
                            if (isValidNumericInput(text)) {
                              onChange(parseFloat(text));
                            }
                          }}
                          onBlur={() =>
                            handleNumericInputBlur(
                              modalRateValue,
                              DEFAULT_HOURLY_RATE,
                              setModalRateValue,
                              onChange
                            )
                          }
                          keyboardType="decimal-pad"
                          className="text-typography-900"
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
            </ModalBody>
            <ModalFooter className="border-t border-outline-100">
              <HStack space="sm" className="justify-end">
                <Button
                  size="md"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  className="border-outline-300"
                >
                  <ButtonText className="text-typography-600">
                    Cancel
                  </ButtonText>
                </Button>
                <Button
                  size="md"
                  variant="solid"
                  action="primary"
                  onPress={onSubmit}
                  isDisabled={isLoading}
                  className="bg-primary-600"
                >
                  <ButtonText className="text-white">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
