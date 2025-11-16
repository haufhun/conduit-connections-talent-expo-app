import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const verifyCodeSchema = zod.object({
  code: zod
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export default function VerifyCode({
  email,
  onBackToSignIn,
}: {
  email: string;
  onBackToSignIn: () => void;
}) {
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const verifyCode = async (data: zod.infer<typeof verifyCodeSchema>) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: data.code,
      type: "email",
    });

    if (error) {
      console.error("Error verifying code:", error);
      Alert.alert(error.message);
    } else {
      Toast.show("Email verified successfully", {
        type: "success",
        placement: "top",
        duration: 1500,
      });
    }
  };

  const handleResendCode = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      console.error("Error resending code:", error);
      Alert.alert(error.message);
    } else {
      Toast.show("Verification code resent", {
        type: "success",
        placement: "top",
        duration: 1500,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          paddingBottom: 120, // Extra bottom padding for developer settings
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@/assets/images/conduit-logo-white-1563rect.png")}
          style={{
            width: 280,
            height: 84,
            marginBottom: 24,
            resizeMode: "contain",
          }}
        />
        <VStack className="rounded-xl border border-outline-200 bg-background-0 p-6 w-full max-w-[336px]">
          <Heading>Verify Email</Heading>
          <Text className="mt-2">
            We sent a verification code to {email}. Please enter the 6-digit
            code to verify your account.
          </Text>

          <Controller
            control={control}
            name="code"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={!!error} className="w-full mt-4">
                <FormControlLabel>
                  <FormControlLabelText>Verification Code</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type="text"
                    placeholder="000000"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoComplete="one-time-code"
                    autoCorrect={false}
                    textContentType="oneTimeCode"
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                    className="text-center text-lg font-mono tracking-widest"
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

          <Button
            className="w-full mt-6"
            size="sm"
            onPress={handleSubmit(verifyCode)}
            disabled={formState.isSubmitting}
          >
            <ButtonText>Verify Code</ButtonText>
          </Button>

          <Button
            className="w-full mt-4"
            size="sm"
            variant="link"
            onPress={handleResendCode}
          >
            <ButtonText>Resend Code</ButtonText>
          </Button>

          <Button
            className="w-full mt-2"
            size="sm"
            variant="link"
            onPress={onBackToSignIn}
          >
            <ButtonText>Back to Sign In</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
