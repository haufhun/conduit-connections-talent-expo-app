import TokenForgotPassword from "@/components/auth/ForgotPassword";
import TokenResetPassword from "@/components/auth/ResetPassword";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import { Center } from "@/components/ui/center";
import { useAuth } from "@/providers/auth-provider";
import { Redirect } from "expo-router";
import React from "react";

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
        <TokenForgotPassword
          onBackToSignIn={() => setScreen("signin")}
          onTokenSent={(email) => {
            setResetEmail(email);
            setScreen("reset-password");
          }}
        />
      ) : screen === "reset-password" ? (
        <TokenResetPassword
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
    </Center>
  );
}
