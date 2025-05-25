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
import { SkillCard } from "@/components/SkillCard";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { AddIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { MAX_TALENT_SKILLS } from "@/constants/Supabase";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";
import { uploadFileToSupabase } from "@/utils/storage";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.safeArea} className="bg-primary">
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          <VStack style={styles.header}>
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
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
                  style={styles.avatarGradient}
                />
                <Center style={styles.editAvatarButton}>
                  <IconSymbol name="camera.fill" size={20} color="#fff" />
                </Center>
              </Center>
            </Pressable>

            <VStack space="sm">
              <VStack>
                {fullName ? (
                  <HStack className="items-center">
                    <Text size="xl" bold className="text-typography-900">
                      {fullName}
                    </Text>
                    <TouchableOpacity onPress={() => setNameModalVisible(true)}>
                      <IconSymbol
                        name="square.and.pencil"
                        size={16}
                        color="#666"
                        style={{ marginLeft: 8, marginBottom: 2 }}
                      />
                    </TouchableOpacity>
                  </HStack>
                ) : (
                  <Button
                    size="xl"
                    variant="link"
                    onPress={() => setNameModalVisible(true)}
                    className="mt-2"
                  >
                    <HStack space="xs" className="items-center">
                      <ButtonIcon as={AddIcon} color="#666" />
                      <ButtonText>Add name</ButtonText>
                    </HStack>
                  </Button>
                )}
              </VStack>

              <VStack>
                {location ? (
                  <HStack className="items-center">
                    <Text size="sm" bold className="text-typography-900">
                      {location}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setLocationModalVisible(true)}
                    >
                      <IconSymbol
                        name="square.and.pencil"
                        size={16}
                        color="#666"
                        style={{ marginLeft: 8, marginBottom: 2 }}
                      />
                    </TouchableOpacity>
                  </HStack>
                ) : (
                  <Button
                    size="sm"
                    variant="link"
                    onPress={() => setLocationModalVisible(true)}
                    className="mt-2"
                  >
                    <HStack space="xs" className="items-center">
                      <ButtonIcon as={AddIcon} color="#666" />
                      <ButtonText>Add location</ButtonText>
                    </HStack>
                  </Button>
                )}
              </VStack>
            </VStack>
          </VStack>

          <VStack style={styles.section}>
            <HStack className="justify-between items-center mb-3">
              <Text size="lg" bold className="text-typography-900">
                About Me
              </Text>
              <TouchableOpacity onPress={() => setBioModalVisible(true)}>
                <IconSymbol name="square.and.pencil" size={16} color="#666" />
              </TouchableOpacity>
            </HStack>
            {userProfile.metadata?.bio ? (
              <VStack space="sm">
                <TouchableOpacity
                  onPress={() => setBioExpanded(!bioExpanded)}
                  activeOpacity={0.7}
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
                    onPress={() => setBioExpanded(!bioExpanded)}
                  >
                    <ButtonText className="text-primary-600">
                      {bioExpanded ? "Show less" : "Show more"}
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            ) : (
              <Button variant="link" onPress={() => setBioModalVisible(true)}>
                <HStack space="xs" className="items-center">
                  <ButtonIcon as={AddIcon} color="#666" />
                  <ButtonText>Add bio</ButtonText>
                </HStack>
              </Button>
            )}
          </VStack>

          <VStack style={styles.section}>
            <HStack className="justify-between items-center">
              <Text size="lg" bold className="text-typography-900 mb-3">
                Contact Info
              </Text>
              <TouchableOpacity
                onPress={() => setInfoModalVisible(true)}
                className="w-6 h-6 rounded-full bg-typography-100 items-center justify-center"
              >
                <IconSymbol
                  name="questionmark.circle.fill"
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>
            </HStack>
            <VStack space="sm">
              <HStack space="sm" className="items-start">
                <VStack style={{ flex: 1 }}>
                  <Text bold className="text-typography-700">
                    Email
                  </Text>
                  <Text className="text-typography-600">
                    {userProfile.email}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={() => setContactModalVisible(true)}>
                  <IconSymbol name="square.and.pencil" size={16} color="#666" />
                </TouchableOpacity>
              </HStack>
              <HStack space="sm" className="items-start">
                <VStack style={{ flex: 1 }}>
                  <Text bold className="text-typography-700">
                    Phone
                  </Text>
                  <Text className="text-typography-600">
                    {userProfile.phone || "Not provided"}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={() => setContactModalVisible(true)}>
                  <IconSymbol name="square.and.pencil" size={16} color="#666" />
                </TouchableOpacity>
              </HStack>
            </VStack>
          </VStack>

          <VStack style={styles.section} space="md">
            <HStack className="justify-between items-center mb-3">
              <HStack space="sm" className="items-center">
                <Text size="lg" bold className="text-typography-900">
                  Skills
                </Text>
                <Text size="sm" className="text-typography-500">
                  ({`${talentSkills.length}/${MAX_TALENT_SKILLS}`})
                </Text>
              </HStack>
              <Button
                size="sm"
                variant="link"
                action="primary"
                onPress={() => router.push("/profile/skill/create")}
                disabled={talentSkills.length >= MAX_TALENT_SKILLS}
                style={{
                  opacity: talentSkills.length >= MAX_TALENT_SKILLS ? 0.5 : 1,
                }}
              >
                <ButtonIcon
                  as={AddIcon}
                  color={
                    talentSkills.length >= MAX_TALENT_SKILLS ? "#999" : "#666"
                  }
                />
                <ButtonText
                  style={{
                    color:
                      talentSkills.length >= MAX_TALENT_SKILLS
                        ? "#999"
                        : "#666",
                  }}
                >
                  Add Skill
                </ButtonText>
              </Button>
            </HStack>
            {talentSkills.length > 0 ? (
              talentSkills.map((talentSkill) => (
                <SkillCard
                  key={talentSkill.id}
                  talentSkill={talentSkill}
                  onPress={() => {
                    router.push(`/profile/skill/${talentSkill.id}`);
                  }}
                />
              ))
            ) : (
              <Text className="text-typography-500">No skills added yet</Text>
            )}
          </VStack>

          <VStack space="md" style={styles.actions}>
            <Button
              size="lg"
              variant="outline"
              onPress={() => {
                supabase.auth.signOut();
              }}
              style={styles.logoutButton}
            >
              <ButtonText>Logout</ButtonText>
            </Button>
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
    paddingBottom: 32, // Add padding at the bottom of the content
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 32, // Add padding at the bottom of the content
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: [{ translateX: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    color: "#1a1a1a",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    marginBottom: 12,
  },
  editContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
    color: "#4a4a4a",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  mainButton: {
    borderRadius: 12,
  },
  logoutButton: {
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
