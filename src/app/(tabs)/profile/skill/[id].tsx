import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateTalentSkill,
} from "@/api/api";
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
import { uploadImageToSupabase } from "@/utils/storage";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
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
  const [tempSummary, setTempSummary] = useState("");
  const [tempExperience, setTempExperience] = useState("");

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

  const handleImagePick = async () => {
    if (!skill || skill.image_urls.length >= 5) {
      Alert.alert(
        "Maximum Images",
        "You can only add up to 5 portfolio images."
      );
      return;
    }

    try {
      // Request permission first
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to add portfolio images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        if (!session?.user?.id) {
          Alert.alert("Error", "You must be signed in to upload images");
          return;
        }

        const originalUri = result.assets[0].uri;

        // Compress and resize the image
        const compressedImage = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1080 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        // Upload the compressed image to Supabase Storage
        const imageUrl = await uploadImageToSupabase(
          compressedImage.uri,
          SKILL_IMAGES_BUCKET,
          `users/${session.user.id}/skills/${skill.id}`
        );

        // Update the skill with the new public URL
        const updatedImageUrls = [...skill.image_urls, imageUrl];
        await updateSkill({ image_urls: updatedImageUrls });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to add image to portfolio");
    }
  };

  if (!skill) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!id || !skill) {
    return <Redirect href="/+not-found" />;
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
      className="bg-primary"
    >
      <ScrollView style={styles.container} bounces={false}>
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
                  Portfolio
                </Text>
                <Button
                  variant="link"
                  onPress={handleImagePick}
                  className="p-0"
                  isDisabled={skill.image_urls.length >= 5}
                >
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={AddIcon} />
                    <ButtonText>Add Photo</ButtonText>
                  </HStack>
                </Button>
              </HStack>
              <HStack space="sm" style={styles.portfolioGrid}>
                {skill.image_urls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.portfolioImage}
                    contentFit="cover"
                  />
                ))}
              </HStack>
              {skill.image_urls.length === 0 && (
                <Text className="text-typography-500 italic">
                  No portfolio images added
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  portfolioGrid: {
    flexWrap: "wrap",
    marginTop: 8,
  },
  portfolioImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});
