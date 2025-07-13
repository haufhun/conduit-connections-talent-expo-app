import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import VerifyCode from "@/components/auth/VerifyCode";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { useAuth } from "@/providers/auth-provider";
import { Redirect } from "expo-router";
import * as Updates from "expo-updates";
import React from "react";
import { Alert, ScrollView, Text } from "react-native";

type AuthScreen =
  | "signin"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "verify-code";

export default function Auth() {
  const { session } = useAuth();
  const [screen, setScreen] = React.useState<AuthScreen>("signin");
  const [resetEmail, setResetEmail] = React.useState("");
  const [verifyEmail, setVerifyEmail] = React.useState("");
  const [tapCount, setTapCount] = React.useState(0);
  const [showDeveloperSettings, setShowDeveloperSettings] =
    React.useState(false);

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Center className="flex-1 p-6">
      {screen === "signup" ? (
        <SignUp
          onSignInPress={() => setScreen("signin")}
          onVerificationSent={(email) => {
            setVerifyEmail(email);
            setScreen("verify-code");
          }}
        />
      ) : screen === "verify-code" ? (
        <VerifyCode
          email={verifyEmail}
          onBackToSignIn={() => setScreen("signin")}
          onResendCode={() => {
            // Could add additional resend logic here if needed
          }}
        />
      ) : screen === "forgot-password" ? (
        <ForgotPassword
          onBackToSignIn={() => setScreen("signin")}
          onTokenSent={(email) => {
            setResetEmail(email);
            setScreen("reset-password");
          }}
        />
      ) : screen === "reset-password" ? (
        <ResetPassword
          email={resetEmail}
          onBackToForgot={() => setScreen("forgot-password")}
          onResetComplete={() => setScreen("signin")}
        />
      ) : (
        <SignIn
          onSignUpPress={() => setScreen("signup")}
          onTokenResetPress={() => setScreen("forgot-password")}
        />
      )}

      {/* Developer Settings Section */}
      <Center className="mt-8 w-full">
        <Button
          className="w-full bg-transparent"
          style={{ height: 100 }}
          variant="link"
          onPress={() => {
            const newCount = tapCount + 1;
            setTapCount(newCount);

            if (newCount >= 10) {
              setShowDeveloperSettings(true);
            }
          }}
        ></Button>

        {tapCount >= 5 && tapCount < 10 && (
          <Text className="text-sm text-gray-600 mb-2">
            Tap {10 - tapCount} more times to show developer settings
          </Text>
        )}

        {showDeveloperSettings && (
          <ScrollView className="max-h-64 w-full">
            <Center className="p-4 bg-gray-100 rounded-lg">
              <Button
                className="w-full mt-4"
                size="sm"
                variant="link"
                onPress={() => {
                  // make a network call to a test api endpoint
                  fetch("https://jsonplaceholder.typicode.com/posts")
                    .then((response) => response.json())
                    .then((data) => {
                      Alert.alert(
                        "Test API Success",
                        `Fetched ${data.length} posts`
                      );
                    })
                    .catch((error) => {
                      Alert.alert("Error calling test API:", error);
                    });
                }}
              >
                <ButtonText>Test Button</ButtonText>
              </Button>
              <Text className="text-sm text-gray-600 mb-2 font-medium">
                Environment Configuration
              </Text>
              <Text className="text-xs text-gray-500 mb-1">
                URL: {process.env.EXPO_PUBLIC_SUPABASE_URL}
              </Text>
              <Text className="text-xs text-gray-500">
                Anon Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}
              </Text>

              <Text className="text-xs text-gray-500">
                Update ID: {Updates.updateId || "Not available"}
              </Text>
              <Text className="text-xs text-gray-500">
                Channel: {Updates.channel || "Not available"}
              </Text>
              <Text className="text-xs text-gray-500">
                RuntimeVersion: {Updates.runtimeVersion || "Not available"}
              </Text>
              <Text className="text-xs text-gray-500">
                Created At: {Updates.createdAt?.toLocaleString()}
              </Text>
            </Center>
          </ScrollView>
        )}
      </Center>
    </Center>
  );
}
