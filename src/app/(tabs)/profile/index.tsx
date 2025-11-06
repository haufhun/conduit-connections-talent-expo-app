import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateUserProfile,
} from "@/api/api";
import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import ProfileBioSection from "@/components/profile/ProfileBioSection";
import ProfileContactSection from "@/components/profile/ProfileContactSection";
import ProfileLocationSection from "@/components/profile/ProfileLocationSection";
import ProfileNameSection from "@/components/profile/ProfileNameSection";
import ProfileVisibilityModal from "@/components/profile/ProfileVisibilityModal";
import { SkillCard } from "@/components/SkillCard";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { AddIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { MAX_TALENT_SKILLS } from "@/constants/Supabase";
import { UserProfile } from "@/types/user";
import { formatPhoneNumber } from "@/utils/common";
import { uploadFileToSupabase } from "@/utils/storage";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { EditIcon } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { mutateAsync: updateUserProfile } = useUpdateUserProfile();
  const {
    data: userProfile,
    error: userProfileError,
    isLoading: isLoadingUserProfile,
  } = useGetUserProfile();
  const {
    data: talentSkills,
    error: talentSkillsError,
    isLoading: isLoadingTalentSkills,
  } = useGetUserTalentSkills();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const isLoading = isLoadingUserProfile || isLoadingTalentSkills;

  const ErrorScreen = ({ errorMessage }: { errorMessage?: string }) => (
    <SafeAreaView style={styles.safeArea} className="bg-background-0 flex-1">
      <VStack
        className="flex-1 justify-center items-center p-5 pb-20"
        space="lg"
      >
        <VStack className="items-center" space="md">
          <Center className="w-20 h-20 rounded-full bg-error-50 border-2 border-error-200">
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={36}
              color="#dc2626"
            />
          </Center>
          <VStack className="items-center" space="xs">
            <Text size="xl" bold className="text-typography-900 text-center">
              Oops! Something went wrong
            </Text>
            <Text
              size="md"
              className="text-typography-600 text-center max-w-sm px-4"
            >
              {errorMessage ||
                "We couldn't load your profile. Please try again in a moment."}
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        className="bg-background-0 flex-1 justify-center items-center"
      >
        <VStack className="items-center" space="lg">
          <ActivityIndicator size="large" color={BrandColors.PRIMARY} />
          <Text className="text-typography-600 text-center">
            Loading your profile...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (userProfileError || !userProfile) {
    return <ErrorScreen errorMessage={userProfileError?.message} />;
  }

  if (talentSkillsError || !talentSkills) {
    return <ErrorScreen errorMessage={talentSkillsError?.message} />;
  }

  async function handleProfileUpdate(
    updates: Partial<Omit<UserProfile, "id">>
  ) {
    try {
      if (!userProfile) throw new Error("User profile is not available");
      await updateUserProfile(updates);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating the profile");
    }
  }

  const fullName = `${userProfile.first_name || ""} ${
    userProfile.last_name || ""
  }`.trim();
  const location = [userProfile.city, userProfile.state]
    .filter(Boolean)
    .join(", ");

  const handleAvatarUpload = async (uri: string, contentType: string) => {
    try {
      let fileOptions = {
        contentType,
        fileExtension: "jpg",
      };

      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileUrl = await uploadFileToSupabase(
        compressedImage.uri,
        "avatars",
        `users/${userProfile.id}`,
        fileOptions
      );

      await handleProfileUpdate({ avatar_url: fileUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      Alert.alert("Error", "Failed to upload profile picture");
    }
  };

  const getBioPreview = (bio: string) => {
    // Split by common sentence endings
    const sentences = bio.match(/[^.!?]+[.!?]+/g) || [bio];
    const previewSentences = sentences.slice(0, 4);
    const preview = previewSentences.join(" ").trim();

    // If there's more content and we're not ending with ..., add ...
    return (
      preview +
      (preview.length < bio.length && !preview.endsWith("...") ? "..." : "")
    );
  };

  return (
    <>
      <SafeAreaView
        style={styles.safeArea}
        className="bg-background-0"
        edges={["bottom", "left", "right"]}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          <VStack style={styles.header}>
            <View style={{ height: top }} />
            <Pressable onPress={() => setShowAvatarPicker(true)}>
              <Center style={styles.avatarContainer}>
                <Image
                  source={
                    (userProfile as UserProfile)?.avatar_url
                      ? { uri: (userProfile as UserProfile)?.avatar_url }
                      : require("@/assets/images/icon.png")
                  }
                  style={styles.avatar}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["rgba(93, 224, 230, 0)", "rgba(0, 74, 173, 0.4)"]}
                  style={styles.avatarGradient}
                />
                <Center style={styles.editAvatarButton}>
                  <IconSymbol name="camera.fill" size={24} color="#fff" />
                </Center>
              </Center>
            </Pressable>

            <VStack space="md">
              <VStack>
                {fullName ? (
                  <HStack className="items-center justify-center" space="md">
                    <Text size="2xl" bold className="text-typography-900">
                      {fullName}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setNameModalVisible(true)}
                      className="border-primary-300 bg-primary-50"
                    >
                      <ButtonIcon
                        as={EditIcon}
                        size="sm"
                        className="text-primary-600"
                      />
                      <ButtonText className="text-primary-600 ml-1">
                        Edit
                      </ButtonText>
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    size="lg"
                    variant="link"
                    action="primary"
                    onPress={() => setNameModalVisible(true)}
                    className="justify-start px-0"
                  >
                    <HStack space="sm" className="items-center">
                      <ButtonIcon as={AddIcon} color={BrandColors.PRIMARY} />
                      <ButtonText className="text-primary-600">
                        Add name
                      </ButtonText>
                    </HStack>
                  </Button>
                )}
              </VStack>

              <VStack>
                {location ? (
                  <HStack className="items-center justify-center" space="md">
                    <HStack className="items-center">
                      <IconSymbol
                        name="location.fill"
                        size={16}
                        color={BrandColors.SECONDARY}
                        style={{ marginRight: 8 }}
                      />
                      <Text size="md" className="text-typography-700">
                        {location}
                      </Text>
                    </HStack>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setLocationModalVisible(true)}
                      className="border-primary-300 bg-primary-50"
                    >
                      <ButtonIcon
                        as={EditIcon}
                        size="sm"
                        className="text-primary-600"
                      />
                      <ButtonText className="text-primary-600 ml-1">
                        Edit
                      </ButtonText>
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    size="md"
                    variant="link"
                    action="primary"
                    onPress={() => setLocationModalVisible(true)}
                    className="justify-start px-0"
                  >
                    <HStack space="sm" className="items-center">
                      <ButtonIcon as={AddIcon} color={BrandColors.PRIMARY} />
                      <ButtonText className="text-primary-600">
                        Add location
                      </ButtonText>
                    </HStack>
                  </Button>
                )}
              </VStack>
            </VStack>
          </VStack>

          <VStack style={styles.section} className="bg-background-0">
            <HStack className="justify-between items-center mb-4">
              <Text size="xl" bold className="text-typography-900">
                About Me
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setBioModalVisible(true)}
                className="border-primary-300 bg-primary-50"
              >
                <ButtonIcon
                  as={EditIcon}
                  size="sm"
                  className="text-primary-600"
                />
                <ButtonText className="text-primary-600 ml-1">
                  {userProfile.metadata?.bio ? "Edit" : "Add Bio"}
                </ButtonText>
              </Button>
            </HStack>
            {userProfile.metadata?.bio ? (
              <VStack
                space="md"
                className="border border-outline-200 rounded-xl"
              >
                <TouchableOpacity
                  onPress={() => setBioExpanded(!bioExpanded)}
                  activeOpacity={0.7}
                  className="bg-background-50 p-4 rounded-xl"
                >
                  <Text className="text-typography-700 text-base leading-6">
                    {bioExpanded
                      ? userProfile.metadata.bio
                      : getBioPreview(userProfile.metadata.bio)}
                  </Text>
                </TouchableOpacity>
                {userProfile.metadata.bio.split("\n").length > 4 && (
                  <Button
                    variant="link"
                    size="sm"
                    action="primary"
                    onPress={() => setBioExpanded(!bioExpanded)}
                    className="justify-start px-0"
                  >
                    <ButtonText className="text-primary-600">
                      {bioExpanded ? "Show less" : "Show more"}
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            ) : (
              <VStack className="bg-background-50 p-6 rounded-xl border border-outline-200">
                <Text className="text-typography-500 text-center mb-4">
                  Tell others about yourself, your experience, and what makes
                  you unique.
                </Text>
                <Button
                  variant="link"
                  action="primary"
                  onPress={() => setBioModalVisible(true)}
                  className="justify-center"
                >
                  <HStack space="sm" className="items-center">
                    <ButtonIcon as={AddIcon} color={BrandColors.PRIMARY} />
                    <ButtonText className="text-primary-600">
                      Add bio
                    </ButtonText>
                  </HStack>
                </Button>
              </VStack>
            )}
          </VStack>

          <VStack style={styles.section} className="bg-background-0">
            <HStack className="justify-between items-center mb-4">
              <HStack className="items-center" space="sm">
                <Text size="xl" bold className="text-typography-900">
                  Contact Info
                </Text>
                <TouchableOpacity
                  onPress={() => setInfoModalVisible(true)}
                  className="w-7 h-7 rounded-full bg-info-50 items-center justify-center border border-info-200"
                >
                  <IconSymbol
                    name="questionmark.circle.fill"
                    size={16}
                    color={BrandColors.INFO}
                  />
                </TouchableOpacity>
              </HStack>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setContactModalVisible(true)}
                className="border-primary-300 bg-primary-50"
              >
                <ButtonIcon
                  as={EditIcon}
                  size="sm"
                  className="text-primary-600"
                />
                <ButtonText className="text-primary-600 ml-1">Edit</ButtonText>
              </Button>
            </HStack>
            <VStack space="md">
              <VStack className="bg-background-50 p-4 rounded-xl border border-outline-200">
                <HStack space="sm" className="items-start">
                  <IconSymbol
                    name="envelope.fill"
                    size={20}
                    color={BrandColors.SECONDARY}
                    style={{ marginTop: 2 }}
                  />
                  <VStack style={{ flex: 1 }}>
                    <Text size="sm" bold className="text-typography-700 mb-1">
                      Email
                    </Text>
                    <Text className="text-typography-600">
                      {userProfile.email}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
              <VStack className="bg-background-50 p-4 rounded-xl border border-outline-200">
                <HStack space="sm" className="items-start">
                  <IconSymbol
                    name="phone.fill"
                    size={20}
                    color={BrandColors.SECONDARY}
                    style={{ marginTop: 2 }}
                  />
                  <VStack style={{ flex: 1 }}>
                    <Text size="sm" bold className="text-typography-700 mb-1">
                      Phone
                    </Text>
                    <Text className="text-typography-600">
                      {userProfile.phone
                        ? formatPhoneNumber(userProfile.phone)
                        : "Not provided"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </VStack>

          <VStack style={styles.section} space="md" className="bg-background-0">
            <HStack className="justify-between items-center mb-2">
              <HStack space="sm" className="items-center">
                <Text size="xl" bold className="text-typography-900">
                  Skills
                </Text>
                <VStack className="px-2 py-1 bg-tertiary-100 rounded-full">
                  <Text size="xs" bold className="text-tertiary-700">
                    {`${talentSkills.length}/${MAX_TALENT_SKILLS}`}
                  </Text>
                </VStack>
              </HStack>
              <Button
                size="sm"
                variant="solid"
                action="primary"
                onPress={() => router.push("/profile/skill/create")}
                disabled={talentSkills.length >= MAX_TALENT_SKILLS}
                className={`rounded-full ${
                  talentSkills.length >= MAX_TALENT_SKILLS ? "opacity-50" : ""
                }`}
              >
                <ButtonIcon as={AddIcon} color="white" />
                <ButtonText className="text-white ml-1">Add Skill</ButtonText>
              </Button>
            </HStack>
            {talentSkills.length > 0 ? (
              <VStack space="md">
                {talentSkills.map((talentSkill) => (
                  <SkillCard
                    key={talentSkill.id}
                    talentSkill={talentSkill}
                    onPress={() => {
                      router.push(`/profile/skill/${talentSkill.id}`);
                    }}
                  />
                ))}
              </VStack>
            ) : (
              <VStack className="bg-background-50 p-8 rounded-xl border border-outline-200 items-center">
                <VStack className="items-center" space="md">
                  <Center className="w-16 h-16 rounded-full bg-primary-100">
                    <IconSymbol
                      name="star.fill"
                      size={32}
                      color={BrandColors.PRIMARY}
                    />
                  </Center>
                  <VStack className="items-center" space="xs">
                    <Text
                      size="lg"
                      bold
                      className="text-typography-900 text-center"
                    >
                      No skills added yet
                    </Text>
                    <Text className="text-typography-500 text-center text-sm">
                      Showcase your talents and expertise to stand out
                    </Text>
                  </VStack>
                  <Button
                    variant="solid"
                    action="primary"
                    onPress={() => router.push("/profile/skill/create")}
                    className="rounded-full mt-2"
                  >
                    <ButtonIcon as={AddIcon} color="white" />
                    <ButtonText className="text-white ml-1">
                      Add Your First Skill
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>
            )}
          </VStack>
        </ScrollView>
      </SafeAreaView>

      {/* Profile Sections */}
      <ProfileNameSection
        isOpen={nameModalVisible}
        onClose={() => setNameModalVisible(false)}
        onSubmit={(data) => {
          handleProfileUpdate({
            first_name: data.first_name,
            last_name: data.last_name,
          });
          setNameModalVisible(false);
        }}
        defaultValues={{
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
        }}
      />

      <ProfileLocationSection
        isOpen={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSubmit={(data) => {
          handleProfileUpdate({
            city: data.city,
            state: data.state,
          });
          setLocationModalVisible(false);
        }}
        defaultValues={{
          city: userProfile.city,
          state: userProfile.state,
        }}
      />

      <ProfileBioSection
        isOpen={bioModalVisible}
        onClose={() => setBioModalVisible(false)}
        onSubmit={(data) => {
          handleProfileUpdate({
            metadata: {
              ...userProfile.metadata,
              bio: data.bio,
            },
          });
          setBioModalVisible(false);
        }}
        defaultValues={{
          bio: userProfile.metadata?.bio,
        }}
      />

      <ProfileContactSection
        isOpen={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSubmit={(data) => {
          handleProfileUpdate({
            email: data.email,
            phone: data.phone,
          });
          setContactModalVisible(false);
        }}
        defaultValues={{
          email: userProfile.email,
          phone: userProfile.phone,
        }}
      />

      <ProfileVisibilityModal
        isOpen={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />

      {/* File Picker */}
      <FilePickerActionSheet
        showActionsheet={showAvatarPicker}
        setShowActionsheet={setShowAvatarPicker}
        handleFileUpload={handleAvatarUpload}
        supportedImageTypes={["image/jpeg", "image/png", "image/heic"]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    marginBottom: 35,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(93, 224, 230, 0.1)", // primary-300 with opacity
    backgroundColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: BrandColors.GRAY_100,
    position: "relative",
    borderWidth: 3,
    borderColor: BrandColors.PRIMARY,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.SECONDARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
  avatarGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.SECONDARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.SECONDARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  nameText: {
    color: BrandColors.SECONDARY,
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  sectionTitle: {
    marginBottom: 16,
  },
  editContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  bioInputContainer: {
    minHeight: 160,
    height: 160,
  },
  bioInput: {
    height: 160,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: BrandColors.GRAY_700,
  },
  placeholderText: {
    fontSize: 16,
    color: BrandColors.GRAY_400,
  },
  actions: {
    padding: 24,
    gap: 16,
  },
  mainButton: {
    borderRadius: 12,
  },
  bioModalContent: {
    maxHeight: "80%",
  },
  bioModalBody: {
    flex: 1,
  },
  bioModalInput: {
    flex: 1,
  },
});
