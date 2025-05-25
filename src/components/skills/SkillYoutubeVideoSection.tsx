import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
import { EditIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
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
    <VStack space="xs" style={styles.section}>
      <HStack className="justify-between items-center">
        <Text bold className="text-typography-700">
          YouTube Video
        </Text>
        <Button variant="link" onPress={handleModalOpen} className="p-0">
          <HStack space="xs" className="items-center">
            <ButtonIcon as={EditIcon} />
            <ButtonText>Edit</ButtonText>
          </HStack>
        </Button>
      </HStack>
      {skill.youtube_url ? (
        <View style={{ height: 200 }}>
          <YoutubePlayer
            height={200}
            play={playing}
            videoId={getYoutubeVideoId(skill.youtube_url) || ""}
            onChangeState={onStateChange}
          />
        </View>
      ) : (
        <Text className="text-typography-500 italic">No video added</Text>
      )}

      {/* YouTube URL Edit Modal */}
      <Modal
        isOpen={youtubeModalVisible}
        onClose={() => setYoutubeModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit YouTube URL
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Controller
              control={control}
              name="youtube_url"
              render={({ field: { value, onChange } }) => (
                <FormControl isInvalid={Boolean(errors.youtube_url)}>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="Enter YouTube video URL"
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                  {errors.youtube_url?.message && (
                    <Text size="xs" className="text-error-600">
                      {errors.youtube_url.message}
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
              onPress={() => setYoutubeModalVisible(false)}
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
    </VStack>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
});
