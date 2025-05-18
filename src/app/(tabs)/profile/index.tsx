import {
  useGetUserProfile,
  useGetUserTalentSkills,
  useUpdateUserProfile,
} from "@/api/api";
import { Collapsible } from "@/components/Collapsible";
import { SkillCard } from "@/components/SkillCard";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { AddIcon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [tempFirstName, setTempFirstName] = useState(userProfile?.first_name);
  const [tempLastName, setTempLastName] = useState(userProfile?.last_name);
  const [tempCity, setTempCity] = useState(userProfile?.city);
  const [tempState, setTempState] = useState(userProfile?.state);
  const [tempBio, setTempBio] = useState(userProfile?.metadata?.bio);
  const [tempEmail, setTempEmail] = useState(userProfile?.email);
  const [tempPhone, setTempPhone] = useState(userProfile?.phone);
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

  async function updateProfile(updates: Partial<Omit<UserProfile, "id">>) {
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

  const handleNameUpdate = () => {
    updateProfile({
      first_name: tempFirstName,
      last_name: tempLastName,
    });
    setNameModalVisible(false);
  };

  const handleBioUpdate = () => {
    updateProfile({
      metadata: {
        ...((userProfile as UserProfile)?.metadata || {}),
        bio: tempBio,
      },
    });
    setBioModalVisible(false);
  };

  const handleLocationUpdate = () => {
    updateProfile({
      city: tempCity,
      state: tempState,
    });
    setLocationModalVisible(false);
  };

  const handlePhoneUpdate = () => {
    updateProfile({
      phone: tempPhone,
    });
    setPhoneModalVisible(false);
  };

  const handleEmailUpdate = () => {
    updateProfile({
      email: tempEmail,
    });
    setEmailModalVisible(false);
  };

  const openNameModal = () => {
    setTempFirstName(userProfile.first_name);
    setTempLastName(userProfile.last_name);
    setNameModalVisible(true);
  };

  const openLocationModal = () => {
    setTempCity(userProfile.city);
    setTempState(userProfile.state);
    setLocationModalVisible(true);
  };

  const openBioModal = () => {
    setTempBio(userProfile.metadata?.bio);
    setBioModalVisible(true);
  };

  const openPhoneModal = () => {
    setTempPhone(userProfile.phone);
    setPhoneModalVisible(true);
  };
  const openEmailModal = () => {
    setTempEmail(userProfile.email);
    setEmailModalVisible(true);
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

            <VStack space="sm">
              <VStack>
                {fullName ? (
                  <HStack className="items-center">
                    <Text size="xl" bold className="text-typography-900">
                      {fullName}
                    </Text>
                    <TouchableOpacity onPress={openNameModal}>
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
                    onPress={openNameModal}
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
                    <TouchableOpacity onPress={openLocationModal}>
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
                    onPress={openLocationModal}
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
            <Collapsible
              title="About Me"
              initialIsOpen={userProfile.metadata?.bio === ""}
            >
              {userProfile.metadata?.bio ? (
                <HStack space="sm" className="items-start">
                  <Text className="text-typography-700 text-base leading-6 flex-1">
                    {userProfile.metadata?.bio}
                  </Text>
                  <TouchableOpacity onPress={openBioModal}>
                    <IconSymbol
                      name="square.and.pencil"
                      size={16}
                      color="#666"
                    />
                  </TouchableOpacity>
                </HStack>
              ) : (
                <Button variant="link" onPress={openBioModal} className="mt-4">
                  <HStack space="xs" className="items-center">
                    <ButtonIcon as={AddIcon} color="#666" />
                    <ButtonText>Add bio</ButtonText>
                  </HStack>
                </Button>
              )}
            </Collapsible>
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
                <TouchableOpacity onPress={openEmailModal}>
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
                <TouchableOpacity onPress={openPhoneModal}>
                  <IconSymbol name="square.and.pencil" size={16} color="#666" />
                </TouchableOpacity>
              </HStack>
            </VStack>
          </VStack>

          <VStack style={styles.section} space="md">
            <Text size="lg" bold className="text-typography-900 mb-3">
              Skills
            </Text>
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

      {/* Name Edit Modal */}
      <Modal
        isOpen={nameModalVisible}
        onClose={() => setNameModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Name
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="First Name"
                  value={tempFirstName}
                  onChangeText={setTempFirstName}
                />
              </Input>
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Last Name"
                  value={tempLastName}
                  onChangeText={setTempLastName}
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setNameModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleNameUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bio Edit Modal */}
      <Modal
        isOpen={bioModalVisible}
        onClose={() => setBioModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Bio
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Input size="lg" variant="outline" style={styles.bioInputContainer}>
              <InputField
                placeholder="Time to shine! ✨ Tell us what makes you uniquely you. Maybe share your favorite dad joke, your secret talent, or what gets you excited about tech. Keep it real, keep it fun!"
                value={tempBio}
                onChangeText={setTempBio}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={styles.bioInput}
              />
            </Input>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setBioModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleBioUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Location Edit Modal */}
      <Modal
        isOpen={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Location
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="City"
                  value={tempCity}
                  onChangeText={setTempCity}
                />
              </Input>
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="State"
                  value={tempState}
                  onChangeText={setTempState}
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setLocationModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleLocationUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Email Edit Modal */}
      <Modal
        isOpen={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Email
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <VStack>
                <Text bold className="text-typography-700 mb-2">
                  Email
                </Text>
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder="Email"
                    value={tempEmail}
                    onChangeText={setTempEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setEmailModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handleEmailUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Phone Edit Modal */}
      <Modal
        isOpen={phoneModalVisible}
        onClose={() => setPhoneModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              Edit Phone
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <VStack>
                <Text bold className="text-typography-700 mb-2">
                  Phone
                </Text>
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder="Phone"
                    value={tempPhone}
                    onChangeText={setTempPhone}
                    keyboardType="phone-pad"
                  />
                </Input>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setPhoneModalVisible(false)}
              className="mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={handlePhoneUpdate}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Info Modal */}
      <Modal
        isOpen={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" bold>
              About Your Profile
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <VStack space="sm">
                <Text size="md" bold className="text-typography-900">
                  Profile Visibility
                </Text>
                <Text className="text-typography-600">
                  Your profile information is visible to event organizers and
                  production companies looking for talent like you.
                </Text>
              </VStack>

              <VStack space="sm">
                <Text size="md" bold className="text-typography-900">
                  Contact Information
                </Text>
                <Text className="text-typography-600">
                  Your email and phone number will only be shared with
                  organizers who are active in the system. This helps them
                  communicate with you about job details and logistics.
                </Text>
              </VStack>

              <VStack space="sm">
                <Text size="md" bold className="text-typography-900">
                  Privacy & Control
                </Text>
                <Text className="text-typography-600">
                  You have full control over your profile information and can
                  update or remove it at any time. We recommend keeping your
                  profile up to date to receive the most relevant opportunities.
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={() => setInfoModalVisible(false)}
            >
              <ButtonText>Got it</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
