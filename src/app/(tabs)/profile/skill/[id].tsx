import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateTalentSkill,
} from "@/api/api";
import SkillExperienceSection from "@/components/skills/SkillExperienceSection";
import SkillHourlyRateSection from "@/components/skills/SkillHourlyRateSection";
import SkillImagesSection from "@/components/skills/SkillImagesSection";
import SkillSummarySection from "@/components/skills/SkillSummarySection";
import SkillYoutubeVideoSection from "@/components/skills/SkillYoutubeVideoSection";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { useAuth } from "@/providers/auth-provider";
import type { TalentSkill } from "@/types/skills";
import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
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

  const skill = talentSkills?.find((s) => s?.id === parseInt(id as string));
  const isLoading = isLoadingUser || isLoadingTalentSkills;

  // Set the header title to user's name
  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        userProfile?.first_name + " " + userProfile?.last_name || "Profile",
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
            <SkillExperienceSection
              skill={skill}
              isLoading={isLoading}
              onUpdateSkill={updateSkill}
            />
            <SkillHourlyRateSection
              skill={skill}
              isLoading={isLoading}
              onUpdateSkill={updateSkill}
            />
            <SkillSummarySection
              skill={skill}
              isLoading={isLoading}
              onUpdateSkill={updateSkill}
            />
            <SkillYoutubeVideoSection
              skill={skill}
              isLoading={isLoading}
              onUpdateSkill={updateSkill}
            />
            <SkillImagesSection
              skill={skill}
              userId={session.user.id}
              onUpdateSkill={updateSkill}
            />
          </VStack>
        </VStack>

        {/* Bottom padding */}
        <VStack className="h-8" />
      </ScrollView>
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
