import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Collapsible } from "@/components/Collapsible";
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
import { useAuth } from "@/providers/auth-provider";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  metadata?: {
    bio?: string;
  };
  email: string;
  avatar_url?: string;
}

export default function ProfileScreen() {
  const { session, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(
    (user as UserProfile)?.first_name || ""
  );
  const [lastName, setLastName] = useState(
    (user as UserProfile)?.last_name || ""
  );
  const [city, setCity] = useState((user as UserProfile)?.city || "");
  const [state, setState] = useState((user as UserProfile)?.state || "");
  const [bio, setBio] = useState((user as UserProfile)?.metadata?.bio || "");
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [tempBio, setTempBio] = useState("");

  async function updateProfile(
    updates: Partial<{
      first_name: string;
      last_name: string;
      city: string;
      state: string;
      metadata: { bio: string };
    }>
  ) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      // Update local state based on which fields were updated
      if (updates.first_name !== undefined) setFirstName(updates.first_name);
      if (updates.last_name !== undefined) setLastName(updates.last_name);
      if (updates.city !== undefined) setCity(updates.city);
      if (updates.state !== undefined) setState(updates.state);
      if (updates.metadata?.bio !== undefined) setBio(updates.metadata.bio);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  const location = [city, state].filter(Boolean).join(", ");

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
        ...((user as UserProfile)?.metadata || {}),
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

  const openNameModal = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setNameModalVisible(true);
  };

  const openBioModal = () => {
    setTempBio(bio);
    setBioModalVisible(true);
  };

  const openLocationModal = () => {
    setTempCity(city);
    setTempState(state);
    setLocationModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} bounces={false}>
        <VStack style={styles.header}>
          <Center style={styles.avatarContainer}>
            <Image
              source={
                (user as UserProfile)?.avatar_url
                  ? { uri: (user as UserProfile)?.avatar_url }
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
          <Collapsible title="About Me" initialIsOpen={bio === ""}>
            {bio ? (
              <HStack space="sm" className="items-start">
                <Text className="text-typography-700 text-base leading-6 flex-1">
                  {bio}
                </Text>
                <TouchableOpacity onPress={openBioModal}>
                  <IconSymbol name="square.and.pencil" size={16} color="#666" />
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
          <Text size="lg" bold className="text-typography-900 mb-3">
            Skills
          </Text>
          <Text className="text-typography-500">No skills added yet</Text>
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
              isDisabled={loading}
            >
              <ButtonText>{loading ? "Saving..." : "Save"}</ButtonText>
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
              isDisabled={loading}
            >
              <ButtonText>{loading ? "Saving..." : "Save"}</ButtonText>
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
              isDisabled={loading}
            >
              <ButtonText>{loading ? "Saving..." : "Save"}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
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
