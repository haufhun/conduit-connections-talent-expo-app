import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateTalentSkill,
} from "@/api/api";
import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import PortfolioImage from "@/components/PortfolioImage";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, EditIcon } from "@/components/ui/icon";
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
import { SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import { useAuth } from "@/providers/auth-provider";
import type { TalentSkill } from "@/types/skills";
import { uploadFileToSupabase } from "@/utils/storage";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { Redirect, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [hourlyRateModalVisible, setHourlyRateModalVisible] = useState(false);
  const [tempSummary, setTempSummary] = useState("");
  const [tempExperience, setTempExperience] = useState("");
  const [tempHourlyRate, setTempHourlyRate] = useState("");
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const skill = talentSkills?.find((s) => s.id === parseInt(id));

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

  const handleImageFileUpload = async (uri: string, contentType: string) => {
    if (!session?.user?.id || !skill) {
      Alert.alert("Error", "You must be signed in to upload files");
      return;
    }

    try {
      let fileOptions = {
        contentType,
        fileExtension: "jpg",
      };

      // If it's an image, compress it
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Upload file to Supabase
      const fileUrl = await uploadFileToSupabase(
        compressedImage.uri,
        SKILL_IMAGES_BUCKET,
        `users/${session.user.id}/skills/${skill.id}`,
        fileOptions
      );

      // Update the skill with the new URL
      const updatedUrls = [...skill.image_urls, fileUrl];
      await updateSkill({ image_urls: updatedUrls });
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleAdd = () => {
    if (!skill || skill.image_urls.length >= 5) {
      Alert.alert("Maximum Files", "You can only add up to 5 portfolio items.");
      return;
    }
    setShowActionsheet(true);
  };

  const handleDeleteImage = async (index: number) => {
    if (!skill) return;
    try {
      const newUrls = [...skill.image_urls];
      newUrls.splice(index, 1);
      await updateSkill({ image_urls: newUrls });
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image");
    }
  };

  const handleReorderImages = async (fromIndex: number, toIndex: number) => {
    if (!skill) return;
    try {
      const newUrls = [...skill.image_urls];
      const [movedItem] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, movedItem);
      await updateSkill({ image_urls: newUrls });
    } catch (error) {
      console.error("Error reordering images:", error);
      Alert.alert("Error", "Failed to reorder images");
    }
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
      <ScrollView className="flex-1">
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
                  onPress={() => setExperienceModalVisible(true)}
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
                  onPress={() => setHourlyRateModalVisible(true)}
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
                  onPress={() => setSummaryModalVisible(true)}
                  className="p-0"
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>Edit</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              {skill.summary ? (
                <Text className="text-typography-600">{skill.summary}</Text>
              ) : (
                <Text className="text-typography-500 italic">
                  No summary added
                </Text>
              )}
            </VStack>

            <VStack space="xs" style={styles.section}>
              <HStack className="justify-between items-center">
                <Text bold className="text-typography-700">
                  Images
                </Text>
                <Button
                  variant="link"
                  onPress={() => setIsEditing(!isEditing)}
                  className="p-0"
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>{isEditing ? "Done" : "Edit"}</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              <HStack space="sm" style={styles.imagesGrid}>
                {skill.image_urls.map((url, index) => (
                  <PortfolioImage
                    key={url}
                    url={url}
                    index={index}
                    onDelete={handleDeleteImage}
                    onReorder={handleReorderImages}
                    isEditing={isEditing}
                  />
                ))}
                {!isEditing && skill.image_urls.length < 5 && (
                  <Button
                    variant="outline"
                    onPress={handleAdd}
                    style={styles.addImageButton}
                    className="items-center justify-center border-2 border-dashed border-opacity-75 border-typography-500 bg-white"
                  >
                    <VStack space="xs" className="items-center">
                      <ButtonIcon
                        as={AddIcon}
                        size="xl"
                        className="text-typography-300"
                      />
                      <ButtonText className="text-typography-300">
                        Add Item
                      </ButtonText>
                    </VStack>
                  </Button>
                )}
              </HStack>
              {skill.image_urls.length === 0 && (
                <Text className="text-typography-500 italic">
                  No images added
                </Text>
              )}
            </VStack>
          </VStack>
        </VStack>
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

      <FilePickerActionSheet
        supportedImageTypes={["image/jpeg", "image/png", "image/heic"]}
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        handleFileUpload={handleImageFileUpload}
      />
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
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  talentSkillImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});
