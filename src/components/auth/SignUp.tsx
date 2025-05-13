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
import { Alert, Text } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const signUpSchema = zod
  .object({
    email: zod.string().email({ message: "Invalid email address" }),
    password: zod
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUp({
  onSignInPress,
}: {
  onSignInPress: () => void;
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUp = async (data: zod.infer<typeof signUpSchema>) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Error signing up:", error);
      Alert.alert(error.message);
    } else {
      Toast.show("Signed up successfully", {
        type: "success",
        placement: "top",
        duration: 1500,
      });
    }
  };

  return (
    <VStack className="rounded-xl border border-outline-200 bg-background-0 p-6 w-full max-w-[336px]">
      <Heading>Sign up</Heading>
      <Text className="mt-2">Create a new account</Text>

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

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl isInvalid={!!error} className="mt-6 w-full">
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                placeholder="Confirm your password"
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
                <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
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
        onPress={handleSubmit(signUp)}
        disabled={formState.isSubmitting}
      >
        <ButtonText>Sign Up</ButtonText>
      </Button>

      <Button
        className="w-full mt-4"
        size="sm"
        variant="link"
        onPress={onSignInPress}
      >
        <ButtonText>Sign In Instead</ButtonText>
      </Button>
    </VStack>
  );
}
