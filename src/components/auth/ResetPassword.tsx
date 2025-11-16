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
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const resetPasswordSchema = zod
  .object({
    token: zod.string().min(1, { message: "OTP code is required" }),
    password: zod
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Props = {
  email: string;
  onBackToForgot: () => void;
  onResetComplete: () => void;
};

export default function TokenResetPassword({
  email,
  onBackToForgot,
  onResetComplete,
}: Props) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const verifyTokenAndReset = async (
    data: zod.infer<typeof resetPasswordSchema>
  ) => {
    // First verify the token by attempting to verify the email
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: data.token,
      type: "recovery",
    });

    if (verifyError) {
      console.error("Error verifying token:", verifyError);
      Alert.alert("Invalid or expired OTP code");
      return;
    }

    // If token is valid, update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      Alert.alert(updateError.message);
    } else {
      Toast.show("Password updated successfully", {
        type: "success",
        placement: "top",
        duration: 1500,
      });
      onResetComplete();
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
          <Heading>Reset Password</Heading>
          <Text className="mt-2">Enter the OTP code sent to {email}</Text>

          <Controller
            control={control}
            name="token"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={!!error} className="w-full mt-4">
                <FormControlLabel>
                  <FormControlLabelText>OTP Code</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type="text"
                    placeholder="Enter OTP Code"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoCorrect={false}
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

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={!!error} className="mt-6 w-full">
                <FormControlLabel>
                  <FormControlLabelText>New Password</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    textContentType="password"
                    secureTextEntry={!showPassword}
                  />
                  <InputSlot
                    onPress={() => setShowPassword(!showPassword)}
                    className="mr-3"
                  >
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={!!error} className="mt-6 w-full">
                <FormControlLabel>
                  <FormControlLabelText>Confirm Password</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    textContentType="password"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <InputSlot
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="mr-3"
                  >
                    <InputIcon
                      as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    />
                  </InputSlot>
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
            onPress={handleSubmit(verifyTokenAndReset)}
            disabled={formState.isSubmitting}
          >
            <ButtonText>Reset Password</ButtonText>
          </Button>

          <Button
            className="w-full mt-4"
            size="sm"
            variant="link"
            onPress={onBackToForgot}
          >
            <ButtonText>Back</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
