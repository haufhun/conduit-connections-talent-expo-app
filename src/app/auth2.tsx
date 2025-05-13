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
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  AlertCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react-native";
import React from "react";

const App = () => {
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const handleLogin = () => {
    if (passwordInput?.length < 6) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
      setEmailInput("");
      setPasswordInput("");
    }
  };
  return (
    <Center className="flex-1 p-6">
      <VStack className="rounded-xl border border-outline-200 bg-background-0 p-6 w-full max-w-[336px]">
        <Heading>Log in</Heading>
        <Text className="mt-2">Login to start using gluestack</Text>
        <FormControl className="w-full mt-4">
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              type="text"
              placeholder="Enter your email"
              value={emailInput}
              //@ts-ignore
              // onChange={(e) => setEmailInput(e.target.value)}
              onChangeText={setEmailInput}
            />
          </Input>
        </FormControl>

        <FormControl isInvalid={isInvalid} className="mt-6 w-full">
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={passwordInput}
              //@ts-ignore
              // onChange={(e) => setPasswordInput(e.target.value)}
              onChangeText={setPasswordInput}
            />
            <InputSlot
              onPress={() => setShowPassword(!showPassword)}
              className="mr-3"
            >
              <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
            </InputSlot>
          </Input>

          <FormControlHelper>
            <FormControlHelperText>
              Must be atleast 6 characters.
            </FormControlHelperText>
          </FormControlHelper>

          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText size="sm">
              At least 6 characters are required.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

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
        <Button className="w-full" size="sm" onPress={handleLogin}>
          <ButtonText>Log in</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
};

export default App;
