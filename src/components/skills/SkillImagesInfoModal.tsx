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

const SkillImagesInfoModal = ({ isOpen, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text size="lg" bold>
            About Image Order
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Display Order Matters
              </Text>
              <Text className="text-typography-600">
                Organizers will see your images in the exact same order as you
                display them here. The first image will be the most prominent
                and visible to potential clients.
              </Text>
            </VStack>

            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Best Practices
              </Text>
              <Text className="text-typography-600">
                Put your most important, eye-catching, and professional images
                at the front. These should showcase your best work and make a
                strong first impression on organizers browsing your profile.
              </Text>
            </VStack>

            <VStack space="sm">
              <Text size="md" bold className="text-typography-900">
                Reordering Images
              </Text>
              <Text className="text-typography-600">
                Tap &quot;Edit&quot; to rearrange your images. Press and hold
                any image to drag it to a new position. Don&apos;t forget to tap
                &quot;Done&quot; when you&apos;re finished.
              </Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} className="flex-1">
            <ButtonText>Got it</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SkillImagesInfoModal;
