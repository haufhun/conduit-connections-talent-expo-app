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
  ProfileBioSchemaType,
  profileBioSchema,
} from "../../validators/profiles.validators";

interface ProfileBioSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileBioSchemaType) => void;
  defaultValues?: {
    bio?: string;
  };
}

const ProfileBioSection: React.FC<ProfileBioSectionProps> = ({
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
  } = useForm<ProfileBioSchemaType>({
    resolver: zodResolver(profileBioSchema),
    defaultValues: {
      bio: defaultValues?.bio || "",
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
            Edit Bio
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <FormControl isInvalid={!!errors.bio}>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.bio?.message}
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

export default ProfileBioSection;
