import { useGetUserProfile } from "@/api/api";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { session, mounting } = useAuth();
  const {
    data: userProfile,
    error: userProfileError,
    isLoading: isLoadingUserProfile,
    isFetching: isFetchingUserProfile,
  } = useGetUserProfile();

  const isLoading =
    mounting || isLoadingUserProfile || isFetchingUserProfile || !session;
  const hasError = !!userProfileError;

  const handleContactUs = () => {
    const email = "info@conduitconnections.com";
    const subject = "Contact from Conduit App";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(mailtoUrl).catch((err) => {
      console.error("Failed to open email app:", err);
      Alert.alert(
        "Error",
        "Unable to open email app. Please email us at info@conduitconnections.com"
      );
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          supabase.auth
            .signOut()
            .catch((err) => console.error("Error during sign out:", err));
        },
      },
    ]);
  };

  // Loading: block all UI until auth and profile requests settle
  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        className="bg-background-0 flex-1 justify-center items-center"
        edges={["bottom", "left", "right"]}
      >
        <VStack className="items-center" space="lg">
          <ActivityIndicator size="large" color={BrandColors.PRIMARY} />
          <Text className="text-typography-600 text-center">
            Loading settings...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  // Error: preserve your error component and show it whenever the query errored
  if (hasError || !userProfile) {
    return (
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
                {userProfileError?.message ||
                  "We couldn't load your settings. Please try again in a moment."}
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  // Main UI: safe to render, ensure text never empty to avoid measurement flash
  const firstName = userProfile.first_name?.trim();
  const lastName = userProfile.last_name?.trim();
  const fullName =
    firstName || lastName
      ? `${firstName || ""} ${lastName || ""}`.trim()
      : "User";
  const email = userProfile.email || " ";

  return (
    <SafeAreaView
      style={styles.safeArea}
      className="bg-background-0"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <VStack style={[styles.header, { paddingTop: (insets.top || 0) + 20 }]}>
          <Text size="3xl" bold className="text-typography-900 mb-4">
            Settings
          </Text>
          <HStack space="lg" className="items-center">
            <View style={styles.avatarContainer}>
              <Image
                source={
                  userProfile?.avatar_url
                    ? { uri: userProfile.avatar_url }
                    : require("@/assets/images/icon.png")
                }
                style={styles.avatar}
                contentFit="cover"
              />
              <LinearGradient
                colors={["rgba(93, 224, 230, 0)", "rgba(0, 74, 173, 0.4)"]}
                style={styles.avatarGradient}
              />
            </View>
            <VStack style={{ flex: 1 }} space="xs">
              <Text size="xl" bold className="text-typography-900">
                {fullName}
              </Text>
              <Text size="sm" className="text-typography-600">
                {email}
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Settings Sections */}
        <VStack style={styles.section} className="bg-background-0">
          <Text size="xl" bold className="text-typography-900 mb-4">
            Support
          </Text>
          <VStack className="rounded-xl overflow-hidden border border-primary-200">
            <TouchableHighlight
              onPress={handleContactUs}
              underlayColor="rgba(93, 224, 230, 0.15)"
              style={styles.settingItemWrapper}
            >
              <HStack space="md" className="items-center flex-1">
                <Center className="w-12 h-12 rounded-full bg-primary-500">
                  <IconSymbol
                    name="envelope.fill"
                    size={22}
                    color={BrandColors.WHITE}
                  />
                </Center>
                <VStack style={{ flex: 1 }}>
                  <Text size="md" bold className="text-typography-900">
                    Contact Us
                  </Text>
                  <Text size="sm" className="text-typography-500">
                    Get help or send feedback
                  </Text>
                </VStack>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={BrandColors.GRAY_400}
                />
              </HStack>
            </TouchableHighlight>
          </VStack>
        </VStack>

        <VStack style={styles.section} className="bg-background-0">
          <Text size="xl" bold className="text-typography-900 mb-4">
            Account
          </Text>
          <VStack className="rounded-xl overflow-hidden border border-error-200">
            <TouchableHighlight
              onPress={handleLogout}
              underlayColor="rgba(220, 38, 38, 0.1)"
              style={styles.settingItemWrapper}
            >
              <HStack space="md" className="items-center flex-1">
                <Center className="w-12 h-12 rounded-full bg-error-500">
                  <IconSymbol
                    name="rectangle.portrait.and.arrow.right"
                    size={22}
                    color={BrandColors.WHITE}
                  />
                </Center>
                <VStack style={{ flex: 1 }}>
                  <Text size="md" bold className="text-error-600">
                    Log Out
                  </Text>
                  <Text size="sm" className="text-typography-500">
                    Sign out of your account
                  </Text>
                </VStack>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={BrandColors.GRAY_400}
                />
              </HStack>
            </TouchableHighlight>
          </VStack>
        </VStack>

        {/* Footer */}
        <VStack style={styles.footer} className="items-center" space="xs">
          <Text size="xs" className="text-typography-400 text-center">
            Version 1.0.0
          </Text>
          <Text size="xs" className="text-typography-300 text-center">
            Made with ❤️ by Conduit Connections
          </Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    marginBottom: 35,
  },
  contentContainer: { flexGrow: 1, paddingBottom: 32 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(93, 224, 230, 0.1)",
    backgroundColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: BrandColors.GRAY_100,
    borderWidth: 2,
    borderColor: BrandColors.PRIMARY,
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.SECONDARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  avatar: { width: "100%", height: "100%", borderRadius: 40 },
  avatarGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  settingItemWrapper: { padding: 18, backgroundColor: BrandColors.WHITE },
  footer: { paddingTop: 32, paddingBottom: 16, paddingHorizontal: 24 },
});
