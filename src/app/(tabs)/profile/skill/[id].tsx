import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateTalentSkill,
} from "@/api/api";
import SkillImagesSection from "@/components/skills/SkillImagesSection";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { EditIcon } from "@/components/ui/icon";
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
import { useAuth } from "@/providers/auth-provider";
import type { TalentSkill } from "@/types/skills";
import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

export default function SkillDetailScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const navigation = useNavigation();
  const { mutateAsync: updateTalentSkill } = useUpdateTalentSkill();
  const {
    data: userProfile,
    error: userProfileError,
    isLoading: isLoadingUser,
  } = useGetUserProfile();
  const {
    data: talentSkills,
    error: talentSkillsError,
    isLoading: isLoadingTalentSkills,
  } = useGetUserTalentSkills();

  const skill = talentSkills?.find((s) => s?.id === parseInt(id as string));
  const [playing, setPlaying] = useState(false);

  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
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

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [hourlyRateModalVisible, setHourlyRateModalVisible] = useState(false);
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [tempSummary, setTempSummary] = useState("");
  const [tempExperience, setTempExperience] = useState("");
  const [tempHourlyRate, setTempHourlyRate] = useState("");
  const [tempYoutubeUrl, setTempYoutubeUrl] = useState("");

  const isLoading = isLoadingUser || isLoadingTalentSkills;

  // Set the header title to user's name
  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        userProfile?.first_name + " " + userProfile?.last_name || "Profile",
    });
  }, [navigation, userProfile?.first_name, userProfile?.last_name]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (userProfileError || !userProfile) {
    return (
      <Text>Error {userProfileError?.message || "An error occurred"}</Text>
    );
  }

  if (talentSkillsError || !talentSkills) {
    return (
      <Text>Error {talentSkillsError?.message || "An error occurred"}</Text>
    );
  }
  if (typeof id !== "string") {
    return <Redirect href="/+not-found" />;
  }

  if (!session?.user?.id) {
    return <Redirect href="/auth" />;
  }

  const updateSkill = async (updates: Partial<TalentSkill>) => {
    try {
      if (!session?.user.id || !id)
        throw new Error("User ID or Skill ID is not available");

      await updateTalentSkill({
        talentSkillId: parseInt(id),
        updateData: updates,
      });
    } catch (error) {
      console.error("Error updating skill:", error);
      Alert.alert("Error", "An error occurred while updating the skill");
    }
  };

  const handleSummaryUpdate = () => {
    updateSkill({ summary: tempSummary });
    setSummaryModalVisible(false);
  };

  const handleExperienceUpdate = () => {
    const experience = parseFloat(tempExperience);
    if (isNaN(experience)) {
      Alert.alert("Please enter a valid number");
      return;
    }

    updateSkill({ years_of_experience: experience });
    setExperienceModalVisible(false);
  };

  const handleHourlyRateUpdate = () => {
    const rate = parseFloat(tempHourlyRate);
    if (isNaN(rate)) {
      Alert.alert("Please enter a valid number");
      return;
    }

    updateSkill({ hourly_rate: rate });
    setHourlyRateModalVisible(false);
  };

  const handleYoutubeUrlUpdate = () => {
    updateSkill({ youtube_url: tempYoutubeUrl });
    setYoutubeModalVisible(false);
  };

  const getSummaryPreview = (summary: string) => {
    // Split by common sentence endings
    const sentences = summary.match(/[^.!?]+[.!?]+/g) || [summary];
    const previewSentences = sentences.slice(0, 4);
    const preview = previewSentences.join(" ").trim();

    // If there's more content and we're not ending with ..., add ...
    return (
      preview +
      (preview.length < summary.length && !preview.endsWith("...") ? "..." : "")
    );
  };

  if (!skill) {
    return (
      <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!id || !skill) {
    return <Redirect href="/+not-found" />;
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
      <ScrollView className="flex-1 pb-[100px]">
        <VStack space="lg" className="p-[20px]">
          <HStack space="md" className="items-center py-4">
            <Image
              source={
                skill.skill?.image_url
                  ? { uri: skill.skill.image_url }
                  : require("@/assets/images/icon.png")
              }
              style={styles.skillImage}
              contentFit="cover"
            />
            <Text size="3xl" bold className="text-typography-900 text-center">
              {skill.skill?.name}
            </Text>
          </HStack>

          <VStack space="lg">
            <VStack space="xs" style={styles.section}>
              <HStack className="justify-between items-center">
                <Text bold className="text-typography-700">
                  Experience
                </Text>
                <Button
                  variant="link"
                  onPress={() => {
                    setTempExperience(skill.years_of_experience.toString());
                    setExperienceModalVisible(true);
                  }}
                  className="p-0"
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>Edit</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              <Text className="text-typography-600">
                {skill.years_of_experience}{" "}
                {skill.years_of_experience === 1 ? "year" : "years"}
              </Text>
            </VStack>

            <VStack space="xs" style={styles.section}>
              <HStack className="justify-between items-center">
                <Text bold className="text-typography-700">
                  Hourly Rate
                </Text>
                <Button
                  variant="link"
                  onPress={() => {
                    setTempHourlyRate(skill.hourly_rate.toString());
                    setHourlyRateModalVisible(true);
                  }}
                  className="p-0"
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>Edit</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              {skill.hourly_rate ? (
                <Text className="text-typography-600">
                  ${skill.hourly_rate}/hr
                </Text>
              ) : (
                <Text className="text-typography-500 italic">
                  No rate specified
                </Text>
              )}
            </VStack>

            <VStack space="xs" style={styles.section}>
              <HStack className="justify-between items-center">
                <Text bold className="text-typography-700">
                  Summary
                </Text>
                <Button
                  variant="link"
                  onPress={() => {
                    setTempSummary(skill.summary);
                    setSummaryModalVisible(true);
                  }}
                  className="p-0"
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>Edit</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              {skill.summary ? (
                <VStack space="sm">
                  <TouchableOpacity
                    onPress={() => setSummaryExpanded(!summaryExpanded)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-typography-600">
                      {summaryExpanded
                        ? skill.summary
                        : getSummaryPreview(skill.summary)}
                    </Text>
                  </TouchableOpacity>
                  {skill.summary.split("\n").length > 4 && (
                    <Button
                      variant="link"
                      size="sm"
                      onPress={() => setSummaryExpanded(!summaryExpanded)}
                    >
                      <ButtonText className="text-primary-600">
                        {summaryExpanded ? "Show less" : "Show more"}
                      </ButtonText>
                    </Button>
                  )}
                </VStack>
              ) : (
                <Text className="text-typography-500 italic">
                  No summary added
                </Text>
              )}
            </VStack>

            <VStack space="xs" style={styles.section}>
              <HStack className="justify-between items-center">
                <Text bold className="text-typography-700">
                  YouTube Video
                </Text>
                <Button
                  variant="link"
                  onPress={() => {
                    setTempYoutubeUrl(skill.youtube_url || "");
                    setYoutubeModalVisible(true);
                  }}
                  className="p-0"
                >
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
                <Text className="text-typography-500 italic">
                  No video added
                </Text>
              )}
            </VStack>

            <SkillImagesSection
              skill={skill}
              userId={session.user.id}
              onUpdateSkill={updateSkill}
            />
          </VStack>
        </VStack>

        <VStack className="h-24" />
      </ScrollView>

      {/* Summary Edit Modal */}
      <Modal
        isOpen={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Summary
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Input
              size="lg"
              variant="outline"
              style={styles.summaryInputContainer}
            >
              <InputField
                placeholder="Write a summary of your experience with this skill..."
                value={tempSummary}
                onChangeText={setTempSummary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={styles.summaryInput}
              />
            </Input>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setSummaryModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleSummaryUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Experience Edit Modal */}
      <Modal
        isOpen={experienceModalVisible}
        onClose={() => setExperienceModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Experience
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Input size="lg" variant="outline">
              <InputField
                placeholder="Years of experience"
                value={tempExperience}
                onChangeText={setTempExperience}
                keyboardType="decimal-pad"
              />
            </Input>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setExperienceModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleExperienceUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hourly Rate Edit Modal */}
      <Modal
        isOpen={hourlyRateModalVisible}
        onClose={() => setHourlyRateModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Hourly Rate
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Input size="lg" variant="outline">
              <InputField
                placeholder="Hourly rate (e.g., 50)"
                value={tempHourlyRate}
                onChangeText={setTempHourlyRate}
                keyboardType="decimal-pad"
              />
            </Input>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setHourlyRateModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleHourlyRateUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <Input size="lg" variant="outline">
              <InputField
                placeholder="Enter YouTube video URL"
                value={tempYoutubeUrl}
                onChangeText={setTempYoutubeUrl}
              />
            </Input>
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
              onPress={handleYoutubeUrlUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  summaryInputContainer: {
    minHeight: 160,
    height: 160,
  },
  summaryInput: {
    height: 160,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
});
