import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
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
import { useAuth } from "@/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import {
  AlertCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as zod from "zod";

const authSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Auth() {
  const { session } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (session) {
    return <Redirect href="/" />;
  }

  const signIn = async (data: zod.infer<typeof authSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
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

  const signUp = async (data: zod.infer<typeof authSchema>) => {
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
    <>
      {/* <ImageBackground
        source={{
          uri: "https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} /> */}

      <Center className="flex-1 p-6">
        <VStack className="rounded-xl border border-outline-200 bg-background-0 p-6 w-full max-w-[336px]">
          <Heading>Log in</Heading>
          <Text className="mt-2">Login to start using gluestack</Text>

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

                {/* <FormControlHelper>
                  <FormControlHelperText>
                    Must be at least 6 characters.
                  </FormControlHelperText>
                </FormControlHelper> */}

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
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>Remember me</CheckboxLabel>
            </Checkbox>

            <Button variant="link" size="sm">
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
            <ButtonText>Log in</ButtonText>
          </Button>

          <Button
            className="w-full mt-4"
            size="sm"
            variant="outline"
            onPress={handleSubmit(signUp)}
            disabled={formState.isSubmitting}
          >
            <ButtonText>Sign up</ButtonText>
          </Button>
        </VStack>
      </Center>
      {/* </ImageBackground> */}
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 32,
  },
  input: {
    width: "90%",
    padding: 12,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#6a1b9a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: "90%",
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 1,
  },
  signUpButtonText: {
    color: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "left",
    width: "90%",
  },
});
