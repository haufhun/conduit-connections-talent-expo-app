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
  ProfileLocationSchemaType,
  profileLocationSchema,
} from "../../validators/profiles.validators";

interface ProfileLocationSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileLocationSchemaType) => void;
  defaultValues?: {
    city?: string;
    state?: string;
  };
}

const ProfileLocationSection: React.FC<ProfileLocationSectionProps> = ({
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
  } = useForm<ProfileLocationSchemaType>({
    resolver: zodResolver(profileLocationSchema),
    defaultValues: {
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
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
            Edit Location
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <FormControl isInvalid={!!errors.city}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="City"
                      maxLength={50}
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.city?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.state}>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="State"
                      maxLength={2}
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.state?.message}
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

export default ProfileLocationSection;
