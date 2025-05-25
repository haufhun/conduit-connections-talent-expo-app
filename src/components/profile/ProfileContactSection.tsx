import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
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
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ProfileContactSchemaType,
  profileContactSchema,
} from "../../validators/profiles.validators";

interface ProfileContactSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileContactSchemaType) => void;
  defaultValues?: {
    email?: string;
    phone?: string;
  };
}

const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileContactSchemaType>({
    resolver: zodResolver(profileContactSchema),
    defaultValues: {
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text size="lg" bold>
            Edit Contact Information
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <FormControl isInvalid={!!errors.email}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Email"
                      maxLength={100}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.email?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Phone Number"
                      maxLength={20}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.phone?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            className="mr-3"
            onPress={handleClose}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            action="primary"
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
          >
            <ButtonText>Save</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileContactSection;
