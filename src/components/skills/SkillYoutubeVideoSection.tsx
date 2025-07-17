import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
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
import { TalentSkill } from "@/types/skills";
import {
  skillYoutubeUrlSchema,
  type SkillYoutubeUrlSchemaType,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, PlayIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

interface SkillYoutubeVideoSectionProps {
  skill: TalentSkill;
  isLoading: boolean;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

export default function SkillYoutubeVideoSection({
  skill,
  isLoading,
  onUpdateSkill,
}: SkillYoutubeVideoSectionProps) {
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillYoutubeUrlSchemaType>({
    resolver: zodResolver(skillYoutubeUrlSchema),
    defaultValues: {
      youtube_url: skill.youtube_url || "",
    },
  });

  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
    // This regex matches various YouTube URL formats:
    // - youtu.be/VIDEO_ID
    // - youtube.com/v/VIDEO_ID
    // - youtube.com/watch?v=VIDEO_ID
    // - youtube.com/embed/VIDEO_ID
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onUpdateSkill(data);
      setYoutubeModalVisible(false);
    } catch (error) {
      console.error("Error updating YouTube URL:", error);
      Alert.alert("Error", "Failed to update YouTube URL");
    }
  });

  const handleModalOpen = () => {
    reset({ youtube_url: skill.youtube_url || "" });
    setYoutubeModalVisible(true);
  };

  return (
    <Card className="p-4 bg-background-0 border-outline-100 rounded-lg">
      <VStack space="md">
        <HStack className="justify-between items-center">
          <HStack space="sm" className="items-center">
            <Icon as={PlayIcon} size="md" className="text-tertiary-500" />
            <Text size="lg" className="font-semibold text-typography-900">
              YouTube Video
            </Text>
          </HStack>
          <Button
            variant="outline"
            size="sm"
            onPress={handleModalOpen}
            className="border-primary-300 bg-primary-50"
          >
            <ButtonIcon as={EditIcon} size="sm" className="text-primary-600" />
            <ButtonText className="text-primary-600 ml-1">Edit</ButtonText>
          </Button>
        </HStack>

        {skill.youtube_url ? (
          <View className="rounded-lg overflow-hidden">
            <YoutubePlayer
              height={200}
              play={playing}
              videoId={getYoutubeVideoId(skill.youtube_url) || ""}
              onChangeState={onStateChange}
            />
          </View>
        ) : (
          <View className="py-8 px-4 bg-background-50 rounded-lg border-2 border-dashed border-outline-200">
            <VStack space="sm" className="items-center">
              <Icon as={PlayIcon} size="xl" className="text-outline-400" />
              <Text className="text-typography-500 text-center">
                No YouTube video added yet
              </Text>
              <Text size="sm" className="text-typography-400 text-center">
                Add a video to showcase your work
              </Text>
            </VStack>
          </View>
        )}
      </VStack>

      {/* YouTube URL Edit Modal */}
      <Modal
        isOpen={youtubeModalVisible}
        onClose={() => setYoutubeModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent className="bg-background-0">
          <ModalHeader className="border-b border-outline-100">
            <VStack space="xs">
              <Text size="lg" className="font-semibold text-typography-900">
                Edit YouTube Video
              </Text>
              <Text size="sm" className="text-typography-500">
                Add a YouTube URL to showcase your work
              </Text>
            </VStack>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody className="py-6">
            <Controller
              control={control}
              name="youtube_url"
              render={({ field: { value, onChange } }) => (
                <FormControl isInvalid={Boolean(errors.youtube_url)}>
                  <Input
                    size="lg"
                    variant="outline"
                    className="border-outline-200 focus:border-primary-500"
                  >
                    <InputField
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={value}
                      onChangeText={onChange}
                      className="text-typography-900"
                    />
                  </Input>
                  {errors.youtube_url?.message && (
                    <Text size="sm" className="text-error-600 mt-1">
                      {errors.youtube_url.message}
                    </Text>
                  )}
                </FormControl>
              )}
            />
          </ModalBody>
          <ModalFooter className="border-t border-outline-100">
            <HStack space="sm" className="justify-end">
              <Button
                size="md"
                variant="outline"
                onPress={() => setYoutubeModalVisible(false)}
                className="border-outline-300"
              >
                <ButtonText className="text-typography-600">Cancel</ButtonText>
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
    </Card>
  );
}
