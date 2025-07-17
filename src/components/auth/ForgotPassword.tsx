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
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, ScrollView, Text } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const forgotPasswordSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
});

type Props = {
  onBackToSignIn: () => void;
  onTokenSent: (email: string) => void;
};

export default function TokenForgotPassword({
  onBackToSignIn,
  onTokenSent,
}: Props) {
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const sendResetToken = async (
    data: zod.infer<typeof forgotPasswordSchema>
  ) => {
    // We'll just use Supabase's resetPasswordForEmail but ignore the redirect
    // The user will get both a link and a token in their email
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);

    if (error) {
      console.error("Error sending reset token:", error);
      Alert.alert(error.message);
    } else {
      Toast.show("Reset token sent to your email", {
        type: "success",
        placement: "top",
        duration: 3000,
      });
      onTokenSent(data.email);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        paddingBottom: 120, // Extra bottom padding for developer settings
      }}
      showsVerticalScrollIndicator={false}
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
        <Heading>Forgot Password</Heading>
        <Text className="mt-2">
          Enter your email to receive a OTP to reset your password
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <FormControl isInvalid={!!error} className="w-full mt-4">
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="text"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  keyboardType="email-address"
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
          onPress={handleSubmit(sendResetToken)}
          disabled={formState.isSubmitting}
        >
          <ButtonText>Send OTP Code</ButtonText>
        </Button>

        <Button
          className="w-full mt-4"
          size="sm"
          variant="link"
          onPress={onBackToSignIn}
        >
          <ButtonText>Back to Sign In</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}
