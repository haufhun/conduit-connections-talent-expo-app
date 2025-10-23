import { useCreateTalentSkill, useGetSkills } from "@/api/api";
import SelectSkillSection from "@/components/skills/SelectSkillSection";
import SkillExperienceRateSection from "@/components/skills/SkillExperienceRateSection";
import SkillImagesSection from "@/components/skills/SkillImagesSection";
import SkillSummarySection from "@/components/skills/SkillSummarySection";
import SkillYoutubeVideoSection from "@/components/skills/SkillYoutubeVideoSection";
import { Button, ButtonText } from "@/components/ui/button";

import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/providers/auth-provider";
import { createSkillSchema } from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { z } from "zod";

// Modified schema for create screen that allows empty image arrays initially
const createSkillFormSchema = createSkillSchema
  .omit({ image_urls: true })
  .extend({
    image_urls: z.array(z.string()).default([]),
  });

type CreateSkillFormType = z.infer<typeof createSkillFormSchema>;

export default function CreateSkillScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useAuth();

  const { mutateAsync: createSkill } = useCreateTalentSkill();
  const { data: skills } = useGetSkills();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateSkillFormType>({
    resolver: zodResolver(createSkillFormSchema) as any,
    defaultValues: {
      skill_id: undefined,
      summary: "",
      years_of_experience: undefined,
      hourly_rate: undefined,
      youtube_url: "",
      image_urls: [],
    },
  });

  const imageUrls = watch("image_urls");
  const selectedSkillId = watch("skill_id");

  // Find the selected skill name for display
  const selectedSkillName = skills?.find(
    (skill) => skill.id === selectedSkillId
  )?.name;

  // Handle skill selection from the select screen
  useFocusEffect(
    useCallback(() => {
      const maybeSkillId = parseInt(params.selectedSkillId as string);
      if (!maybeSkillId || isNaN(maybeSkillId)) {
        return;
      } else {
        const skillId = maybeSkillId;

        setValue("skill_id", skillId);
        // Clear the params
        router.setParams({
          selectedSkillId: undefined,
          selectedSkillName: undefined,
        });
      }
    }, [params.selectedSkillId, setValue, router])
  );

  const onSubmit = async (data: CreateSkillFormType) => {
    try {
      await createSkill({
        skill_id: data.skill_id,
        summary: data.summary,
        years_of_experience: data.years_of_experience,
        hourly_rate: data.hourly_rate,
        youtube_url: data.youtube_url || null,
        image_urls: data.image_urls,
      });

      router.replace("/profile");
    } catch (error) {
      console.error("Error creating skill:", error);
      Alert.alert("Error", "Failed to create skill");
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="p-6">
          <VStack
            space="sm"
            className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm"
          >
            <Text size="xl" bold className="text-typography-900 mb-2">
              Create New Skill
            </Text>
            <Text className="text-typography-600">
              Tell us about your expertise and experience
            </Text>
          </VStack>

          <Controller
            control={control}
            name="skill_id"
            render={({ fieldState: { error } }) => (
              <SelectSkillSection
                selectedSkillName={selectedSkillName ?? null}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="summary"
            render={({ fieldState: { error } }) => (
              <SkillSummarySection
                summary={watch("summary") ?? null}
                onUpdateSummary={(summary) =>
                  setValue("summary", summary || "")
                }
                showEditControls={true}
                mode="create"
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="years_of_experience"
            render={({ fieldState: { error: yearsError } }) => (
              <Controller
                control={control}
                name="hourly_rate"
                render={({ fieldState: { error: rateError } }) => (
                  <SkillExperienceRateSection
                    yearsOfExperience={watch("years_of_experience") ?? null}
                    hourlyRate={watch("hourly_rate") ?? null}
                    onUpdateExperienceRate={(data) => {
                      if (data.years_of_experience !== null) {
                        setValue(
                          "years_of_experience",
                          data.years_of_experience
                        );
                      }
                      if (data.hourly_rate !== null) {
                        setValue("hourly_rate", data.hourly_rate);
                      }
                    }}
                    showEditControls={true}
                    mode="create"
                    yearsOfExperienceError={yearsError?.message}
                    hourlyRateError={rateError?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            control={control}
            name="youtube_url"
            render={({ fieldState: { error } }) => (
              <SkillYoutubeVideoSection
                youtubeUrl={watch("youtube_url") ?? null}
                onUpdateYoutubeUrl={(url) =>
                  setValue("youtube_url", url ?? undefined)
                }
                showEditControls={true}
                mode="create"
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="image_urls"
            render={({ fieldState: { error } }) => (
              <SkillImagesSection
                userId={session?.user?.id || ""}
                imageUrls={imageUrls}
                onUpdateImageUrls={(urls) => setValue("image_urls", urls)}
                showEditControls={imageUrls.length > 0}
                mode="create"
                error={error?.message}
              />
            )}
          />

          <VStack className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm">
            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={handleSubmit(onSubmit as any)}
              isDisabled={isSubmitting}
              className="rounded-xl"
            >
              <ButtonText className="font-semibold">
                {isSubmitting ? "Creating..." : "Create Skill"}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>

        {/* Bottom padding */}
        <VStack className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
