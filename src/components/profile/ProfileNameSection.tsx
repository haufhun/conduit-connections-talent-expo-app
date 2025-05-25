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
  ProfileNameSchemaType,
  profileNameSchema,
} from "../../validators/profiles.validators";

interface ProfileNameSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileNameSchemaType) => void;
  defaultValues?: {
    first_name?: string;
    last_name?: string;
  };
}

const ProfileNameSection: React.FC<ProfileNameSectionProps> = ({
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
  } = useForm<ProfileNameSchemaType>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
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
            Edit Name
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <FormControl isInvalid={!!errors.first_name}>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="First Name"
                      maxLength={50}
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.first_name?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.last_name}>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Last Name"
                      maxLength={50}
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.last_name?.message}
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

export default ProfileNameSection;
