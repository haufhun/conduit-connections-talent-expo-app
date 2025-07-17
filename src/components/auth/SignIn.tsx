import { Button, ButtonText } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, ScrollView, Text } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const signInSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignIn({
  onSignUpPress,
  onTokenResetPress,
}: {
  onSignUpPress: () => void;
  onTokenResetPress: () => void;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = async (data: zod.infer<typeof signInSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.log("Error signing in:", JSON.stringify(error));

      console.error("Error signing in:", error);
      Alert.alert(error.message);
    } else {
      Toast.show("Signed in successfully", {
        type: "success",
        placement: "top",
        duration: 1500,
      });
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
        <Heading>Sign In</Heading>
        <Text className="mt-2">Welcome Back! Please sign in to continue</Text>

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

        <HStack className="justify-between my-5">
          <Checkbox value={""} size="sm">
            <CheckboxIndicator>
              <CheckboxIcon />
            </CheckboxIndicator>
            <CheckboxLabel>Remember me</CheckboxLabel>
          </Checkbox>

          <Button variant="link" size="sm" onPress={onTokenResetPress}>
            <ButtonText className="underline underline-offset-1">
              Forgot Password?
            </ButtonText>
          </Button>
        </HStack>

        <Button
          className="w-full"
          size="sm"
          onPress={handleSubmit(signIn)}
          disabled={formState.isSubmitting}
        >
          <ButtonText>Sign In</ButtonText>
        </Button>

        <Button
          className="w-full mt-4"
          size="sm"
          variant="link"
          onPress={onSignUpPress}
        >
          <ButtonText>Sign Up Instead</ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}
