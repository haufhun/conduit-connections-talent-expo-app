import {
  useDeleteTalentSkill,
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateTalentSkill,
} from "@/api/api";
import SkillExperienceRateSection from "@/components/skills/SkillExperienceRateSection";
import SkillImagesSection from "@/components/skills/SkillImagesSection";
import SkillSummarySection from "@/components/skills/SkillSummarySection";
import SkillYoutubeVideoSection from "@/components/skills/SkillYoutubeVideoSection";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Icon, TrashIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import { useAuth } from "@/providers/auth-provider";
import type { TalentSkill } from "@/types/skills";
import {
  deleteFileFromSupabase,
  extractFilePathFromUrl,
} from "@/utils/storage";
import { Image } from "expo-image";
import {
  Redirect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SkillDetailScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const { mutateAsync: updateTalentSkill } = useUpdateTalentSkill();
  const { mutateAsync: deleteTalentSkill, isPending: isDeleting } =
    useDeleteTalentSkill();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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
  const isLoading = isLoadingUser || isLoadingTalentSkills;

  const deleteSkill = async () => {
    try {
      if (!session?.user.id || !id)
        throw new Error("User ID or Skill ID is not available");

      setIsDeletingImages(true);
      for (let imageUrl of skill?.image_urls || []) {
        // Attempt to delete each image, but don't block deletion if one fails
        try {
          const filePath = extractFilePathFromUrl(
            imageUrl,
            SKILL_IMAGES_BUCKET
          );
          if (filePath) {
            await deleteFileFromSupabase("talent-skill-images", filePath);
          }
        } catch (error) {
          console.warn("Failed to delete image:", imageUrl, error);
        }
      }
      setIsDeletingImages(false);

      await deleteTalentSkill(parseInt(id as string));
      setDeleteModalVisible(false);
      router.back();
    } catch (error) {
      console.error("Error deleting skill:", error);
      Alert.alert("Error", "An error occurred while deleting the skill");
    }
  };

  // Set the header title to user's name and add delete button
  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        userProfile?.first_name + " " + userProfile?.last_name || "Profile",
      headerRight: () => (
        <Button
          variant="outline"
          size="sm"
          onPress={() => setDeleteModalVisible(true)}
          className="border-error-300 bg-error-50"
        >
          <ButtonIcon as={TrashIcon} size="sm" className="text-error-600" />
        </Button>
      ),
    });
  }, [navigation, userProfile?.first_name, userProfile?.last_name]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 justify-center items-center">
        <VStack className="items-center" space="lg">
          <ActivityIndicator size="large" color={BrandColors.PRIMARY} />
          <Text className="text-typography-600 text-center">
            Loading skill details...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (userProfileError || !userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 justify-center items-center">
        <VStack className="items-center p-5" space="lg">
          <Center className="w-20 h-20 rounded-full bg-error-50 border-2 border-error-200">
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={36}
              color={BrandColors.ERROR}
            />
          </Center>
          <VStack className="items-center" space="xs">
            <Text size="xl" bold className="text-typography-900 text-center">
              Profile Error
            </Text>
            <Text className="text-typography-600 text-center">
              {userProfileError?.message ||
                "An error occurred loading your profile"}
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  if (talentSkillsError || !talentSkills) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 justify-center items-center">
        <VStack className="items-center p-5" space="lg">
          <Center className="w-20 h-20 rounded-full bg-error-50 border-2 border-error-200">
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={36}
              color={BrandColors.ERROR}
            />
          </Center>
          <VStack className="items-center" space="xs">
            <Text size="xl" bold className="text-typography-900 text-center">
              Skills Error
            </Text>
            <Text className="text-typography-600 text-center">
              {talentSkillsError?.message ||
                "An error occurred loading your skills"}
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  if (typeof id !== "string") {
    return <Redirect href="/+not-found" />;
  }

  if (!session?.user?.id) {
    return <Redirect href="/auth" />;
  }

  if (!skill) {
    return (
      <SafeAreaView
        className="flex-1 bg-background-0 justify-center items-center"
        edges={["bottom"]}
      >
        <VStack className="items-center p-5" space="lg">
          <Center className="w-20 h-20 rounded-full bg-warning-50 border-2 border-warning-200">
            <IconSymbol
              name="questionmark.circle.fill"
              size={36}
              color={BrandColors.WARNING}
            />
          </Center>
          <VStack className="items-center" space="xs">
            <Text size="xl" bold className="text-typography-900 text-center">
              Skill Not Found
            </Text>
            <Text className="text-typography-600 text-center">
              The skill you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
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

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-6">
          {/* Skill Header */}
          <VStack className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm">
            <HStack space="lg" className="items-center">
              <Center className="w-24 h-24 rounded-full bg-primary-50 border-3 border-primary-200 shadow-md">
                <Image
                  source={
                    skill.skill?.image_url
                      ? { uri: skill.skill.image_url }
                      : require("@/assets/images/icon.png")
                  }
                  style={styles.skillImage}
                  contentFit="cover"
                />
              </Center>
              <VStack className="flex-1" space="xs">
                <Text size="2xl" bold className="text-typography-900">
                  {skill.skill?.name}
                </Text>
                <Text size="md" className="text-typography-600">
                  Professional Skills Profile
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Skill Sections */}
          <VStack space="lg">
            <SkillExperienceRateSection
              yearsOfExperience={skill?.years_of_experience ?? null}
              hourlyRate={skill?.hourly_rate ?? null}
              onUpdateExperienceRate={async (data) => {
                await updateSkill({
                  years_of_experience: data.years_of_experience || undefined,
                  hourly_rate: data.hourly_rate || undefined,
                });
              }}
              showEditControls={true}
              mode="edit"
            />
            <SkillSummarySection
              summary={skill?.summary ?? null}
              onUpdateSummary={async (summary) => {
                await updateSkill({ summary: summary || undefined });
              }}
              showEditControls={true}
              mode="edit"
            />
            <SkillYoutubeVideoSection
              youtubeUrl={skill?.youtube_url ?? null}
              onUpdateYoutubeUrl={async (url) => {
                await updateSkill({ youtube_url: url ?? undefined });
              }}
              showEditControls={true}
              mode="edit"
            />
            <SkillImagesSection
              skill={skill}
              userId={session.user.id}
              imageUrls={skill.image_urls}
              onUpdateImageUrls={async (urls) => {
                await updateSkill({ image_urls: urls });
              }}
              showEditControls={true}
            />
          </VStack>

          {/* Delete Skill Button */}
          <VStack className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm">
            <Button
              size="lg"
              variant="solid"
              action="negative"
              onPress={() => setDeleteModalVisible(true)}
              className="rounded-xl"
            >
              <ButtonText className="font-semibold">Delete Skill</ButtonText>
            </Button>
          </VStack>
        </VStack>

        {/* Bottom padding */}
        <VStack className="h-8" />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <ModalBackdrop />
        <ModalContent className="w-11/12 max-w-md">
          <ModalHeader className="border-b border-outline-200 pb-4">
            <VStack className="items-center" space="md">
              <Center className="w-16 h-16 rounded-full bg-error-50 border-2 border-error-200">
                <Icon as={TrashIcon} size="xl" className="text-error-600" />
              </Center>
              <Text size="xl" bold className="text-typography-900 text-center">
                Delete Skill
              </Text>
            </VStack>
          </ModalHeader>

          <ModalBody className="py-6">
            <VStack space="sm">
              <Text className="text-typography-700 text-center">
                Are you sure you want to delete your{" "}
                <Text bold className="text-typography-900">
                  {skill?.skill?.name}
                </Text>{" "}
                skill?
              </Text>
              <Text size="sm" className="text-typography-600 text-center">
                This action cannot be undone. All your experience, portfolio
                images, and other data for this skill will be permanently
                removed.
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter className="border-t border-outline-200 pt-4">
            <HStack space="md" className="w-full">
              <Button
                variant="outline"
                className="flex-1 border-outline-300"
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeletingImages || isDeleting}
              >
                <ButtonText className="text-typography-700">Cancel</ButtonText>
              </Button>
              <Button
                action="negative"
                className="flex-1"
                disabled={isDeletingImages || isDeleting}
                onPress={deleteSkill}
              >
                {isDeletingImages || isDeleting ? <ButtonSpinner /> : null}
                <ButtonText>
                  {isDeletingImages || isDeleting
                    ? "Deleting..."
                    : "Delete Skill"}
                </ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
