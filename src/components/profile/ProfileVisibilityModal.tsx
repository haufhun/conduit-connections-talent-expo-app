import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../ui/modal";
type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ProfileVisibilityModal = ({ isOpen, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text size="lg" bold>
            About Your Profile
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Profile Visibility
              </Text>
              <Text className="text-typography-600">
                Your profile information is visible to event organizers and
                production companies looking for talent like you.
              </Text>
            </VStack>

            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Contact Information
              </Text>
              <Text className="text-typography-600">
                Your email and phone number will only be shared with organizers
                who are active in the system. This helps them communicate with
                you about job details and logistics.
              </Text>
            </VStack>

            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Privacy & Control
              </Text>
              <Text className="text-typography-600">
                You have full control over your profile information and can
                update or remove it at any time. We recommend keeping your
                profile up to date to receive the most relevant opportunities.
              </Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="solid" action="primary" onPress={onClose}>
            <ButtonText>Got it</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileVisibilityModal;
