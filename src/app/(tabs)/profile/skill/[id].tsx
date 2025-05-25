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
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
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

  if (!skill) {
    return (
      <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
        <Text>Loading...</Text>
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

        <VStack className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
});
