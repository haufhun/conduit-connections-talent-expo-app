import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import { Center } from "@/components/ui/center";
import { useAuth } from "@/providers/auth-provider";
import { Redirect } from "expo-router";
import React from "react";
import { Text } from "react-native";

type AuthScreen = "signin" | "signup" | "forgot-password" | "reset-password";

export default function Auth() {
  const { session } = useAuth();
  const [screen, setScreen] = React.useState<AuthScreen>("signin");
  const [resetEmail, setResetEmail] = React.useState("");

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Center className="flex-1 p-6">
      {screen === "signup" ? (
        <SignUp onSignInPress={() => setScreen("signin")} />
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

      <Center className="mt-8 p-4 bg-gray-100 rounded-lg">
        <Text className="text-sm text-gray-600 mb-2 font-medium">
          Environment Configuration
        </Text>
        <Text className="text-xs text-gray-500 mb-1">
          URL: {process.env.EXPO_PUBLIC_SUPABASE_URL}
        </Text>
        <Text className="text-xs text-gray-500">
          Anon Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}
        </Text>
      </Center>
    </Center>
  );
}
