import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
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
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { LockIcon, XIcon } from "lucide-react-native";

interface ScheduleDescriptionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleDescriptionInfoModal({
  isOpen,
  onClose,
}: ScheduleDescriptionInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="border-b border-outline-200">
          <HStack space="sm" className="items-center flex-1">
            <IconSymbol
              name="text.alignleft"
              size={24}
              color={BrandColors.TERTIARY}
            />
            <Heading size="lg" className="text-typography-900 flex-1">
              About Descriptions
            </Heading>
          </HStack>
          <ModalCloseButton>
            <Icon as={XIcon} size="md" className="text-typography-400" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody className="py-6">
          <VStack space="lg">
            <VStack space="md">
              <HStack space="sm" className="items-start">
                <Icon
                  as={LockIcon}
                  size="lg"
                  className="text-success-600 mt-0.5"
                />
                <VStack space="xs" className="flex-1">
                  <Text className="font-semibold text-typography-900">
                    Private Information
                  </Text>
                  <Text className="text-typography-600">
                    This description is for your personal organization only and
                    will not be shared with event organizers or other users.
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <VStack space="md" className="bg-background-50 p-4 rounded-xl">
              <Text className="text-sm text-typography-700 font-medium">
                Examples:
              </Text>
              <VStack space="xs">
                <Text className="text-sm text-typography-600">
                  • &quot;Out of town for my sister&apos;s wedding&quot;
                </Text>
                <Text className="text-sm text-typography-600">
                  • &quot;Annual checkup at 2pm&quot;
                </Text>
                <Text className="text-sm text-typography-600">
                  • &quot;Need to pick up kids from school&quot;
                </Text>
                <Text className="text-sm text-typography-600">
                  • &quot;Personal time - not available&quot;
                </Text>
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter className="border-t border-outline-200">
          <Button
            variant="solid"
            action="primary"
            onPress={onClose}
            className="flex-1 bg-primary-600"
          >
            <ButtonText className="text-white">Got it</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
