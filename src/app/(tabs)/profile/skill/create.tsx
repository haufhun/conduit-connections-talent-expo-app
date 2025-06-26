import {
  useCreateTalentSkill,
  useGetSkills,
  useGetUserTalentSkills,
} from "@/api/api";
import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { MAX_SKILL_IMAGES, SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import { useAuth } from "@/providers/auth-provider";
import { uploadFileToSupabase } from "@/utils/storage";
import {
  CreateSkillSchemaType,
  createSkillSchema,
} from "@/validators/skills.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { z } from "zod";

export default function CreateSkillScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [playing, setPlaying] = useState(false);

  const getYoutubeVideoId = (url: string) => {
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
  const { mutateAsync: createSkill } = useCreateTalentSkill();
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: skills, error, isLoading } = useGetSkills();
  const { data: userSkills } = useGetUserTalentSkills();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSkillSchemaType>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: {
      skill_id: undefined,
      summary: "",
      years_of_experience: undefined,
      hourly_rate: undefined,
      youtube_url: "",
      image_urls: [],
    },
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error || !skills) {
    return <Text>Error {error?.message || "Failed to fetch skills"}</Text>;
  }

  const imageUrls = watch("image_urls");

  const onSubmit = async (data: z.infer<typeof createSkillSchema>) => {
    try {
      await createSkill({
        skill_id: data.skill_id,
        summary: data.summary,
        years_of_experience: data.years_of_experience,
        hourly_rate: data.hourly_rate,
        youtube_url: data.youtube_url || null,
        image_urls: data.image_urls,
      });

      router.back();
    } catch (error) {
      console.error("Error creating skill:", error);
      Alert.alert("Error", "Failed to create skill");
    }
  };

  const handleImageFileUpload = async (uri: string, contentType: string) => {
    if (!session?.user?.id) {
      Alert.alert("Error", "You must be signed in to upload files");
      return;
    }

    try {
      let fileOptions = {
        contentType,
        fileExtension: "jpg",
      };

      // Compress image
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
        `users/${session.user.id}/skills`,
        fileOptions
      );

      // Update the image URLs
      const currentUrls = watch("image_urls");
      setValue("image_urls", [...currentUrls, fileUrl]);
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleAddImage = () => {
    if (imageUrls.length >= MAX_SKILL_IMAGES) {
      Alert.alert(
        "Maximum Files",
        `You can only add up to ${MAX_SKILL_IMAGES} skill images.`
      );
      return;
    }
    setShowActionsheet(true);
  };

  const filteredSkills = skills.filter(
    (skill) =>
      !userSkills?.some((userSkill) => userSkill.skill_id === skill.id) &&
      skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
      <ScrollView className="flex-1">
        <VStack space="lg" className="p-[20px]">
          <VStack space="sm">
            <Text className="text-typography-600">
              Tell us about your expertise and experience
            </Text>
          </VStack>

          <Controller
            control={control}
            name="skill_id"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormControlLabel>
                  <FormControlLabelText>Select Skill</FormControlLabelText>
                </FormControlLabel>

                <VStack space="md" className="mb-2">
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="Search skills..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </Input>
                  <View style={styles.skillsList}>
                    {filteredSkills.map((skill) => (
                      <Button
                        key={skill.id}
                        size="sm"
                        variant={value === skill.id ? "solid" : "outline"}
                        action={value === skill.id ? "primary" : undefined}
                        onPress={() => onChange(skill.id)}
                        className="min-w-[100px]"
                      >
                        <ButtonText>{skill.name}</ButtonText>
                      </Button>
                    ))}
                  </View>
                </VStack>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="summary"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormControlLabel>
                  <FormControlLabelText>Summary</FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  variant="outline"
                  className="min-h-[160px] h-[160px]"
                >
                  <InputField
                    placeholder="Write a summary of your experience with this skill..."
                    value={value ?? ""}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={styles.summaryInput}
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <HStack space="md">
            <VStack space="md" className="flex-1">
              <Controller
                control={control}
                name="years_of_experience"
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <FormControl isInvalid={Boolean(error)}>
                    <FormControlLabel>
                      <FormControlLabelText>
                        Years of Experience
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input size="lg" variant="outline">
                      <InputField
                        placeholder="Years"
                        value={value?.toString() ?? ""}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          onChange(isNaN(num) ? "" : num);
                        }}
                        keyboardType="decimal-pad"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText size="sm">
                        {error?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />
            </VStack>

            <VStack space="md" className="flex-1">
              <Controller
                control={control}
                name="hourly_rate"
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <FormControl isInvalid={Boolean(errors.hourly_rate)}>
                    <FormControlLabel>
                      <FormControlLabelText>Hourly Rate</FormControlLabelText>
                    </FormControlLabel>

                    <Input size="lg" variant="outline">
                      <InputField
                        placeholder="$/hr"
                        value={value?.toString() ?? ""}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          onChange(isNaN(num) ? "" : num);
                        }}
                        keyboardType="decimal-pad"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText size="sm">
                        {error?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />
            </VStack>
          </HStack>

          <Controller
            control={control}
            name="youtube_url"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormControlLabel>
                  <FormControlLabelText>YouTube Video URL</FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder="Enter YouTube video URL..."
                    value={value ?? ""}
                    onChangeText={onChange}
                  />
                </Input>
                {value && (
                  <View style={{ height: 200, marginTop: 8 }}>
                    <YoutubePlayer
                      height={200}
                      videoId={getYoutubeVideoId(value)}
                      play={playing}
                      onChangeState={onStateChange}
                    />
                  </View>
                )}
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText size="sm">
                    {error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <VStack space="md">
            <Text bold className="text-typography-700">
              Images
            </Text>
            <Text className="text-typography-600">
              Add up to 5 images showcasing your work
            </Text>

            <Controller
              control={control}
              name="image_urls"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={Boolean(error)}>
                  <HStack space="sm" style={styles.imagesGrid}>
                    {imageUrls.map((url, index) => (
                      <View
                        key={index}
                        className="w-[100] h-[100] rounded-lg overflow-hidden bg-secondary-100"
                      >
                        <Image
                          source={{ uri: url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      </View>
                    ))}
                    {imageUrls.length < 5 && (
                      <Button
                        variant="outline"
                        onPress={handleAddImage}
                        style={styles.addImageButton}
                        className="items-center justify-center border-2 border-dashed border-opacity-75 border-typography-500 bg-white"
                      >
                        <VStack space="xs" className="items-center">
                          <Text className="text-typography-300">Add Item</Text>
                        </VStack>
                      </Button>
                    )}
                  </HStack>

                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText size="sm">
                      {error?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </VStack>

          <Button
            size="lg"
            variant="solid"
            action="primary"
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
          >
            <ButtonText>
              {isSubmitting ? "Creating..." : "Create Skill"}
            </ButtonText>
          </Button>
        </VStack>

        {errors && <VStack className="h-24" />}
      </ScrollView>

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
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
});
