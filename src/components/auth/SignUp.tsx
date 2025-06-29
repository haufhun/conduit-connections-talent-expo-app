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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const signUpSchema = zod
  .object({
    firstName: zod
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: zod
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    email: zod.string().email("Please enter a valid email address"),
    password: zod
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be no more than 128 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      )
      .refine(
        (password) => {
          // Check for common weak patterns
          const commonPatterns = [
            /^(.)\1+$/, // All same character
            /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // Sequential numbers
            /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
            /^(qwerty|asdfgh|zxcvbn|password|admin|welcome|login)/i, // Common weak passwords
          ];
          return !commonPatterns.some((pattern) => pattern.test(password));
        },
        {
          message: "Password cannot contain common patterns or weak sequences",
        }
      ),
    repeatPassword: zod.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const signUp = async (data: zod.infer<typeof signUpSchema>) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
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
        name="firstName"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl isInvalid={!!error} className="w-full mt-4">
            <FormControlLabel>
              <FormControlLabelText>First Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type="text"
                placeholder="Enter your first name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoComplete="given-name"
                autoCorrect={false}
                textContentType="givenName"
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
        name="lastName"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl isInvalid={!!error} className="w-full mt-4">
            <FormControlLabel>
              <FormControlLabelText>Last Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type="text"
                placeholder="Enter your last name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoComplete="family-name"
                autoCorrect={false}
                textContentType="familyName"
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

            <Text size="xs" className="text-typography-500 mt-1">
              Password must be at least 8 characters and contain: uppercase,
              lowercase, number, and special character
            </Text>

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
        name="repeatPassword"
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
