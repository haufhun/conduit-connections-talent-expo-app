import { PhoneNumberInput } from "@/components/PhoneNumberInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React, { useState } from "react";
import { View } from "react-native";

export default function PhoneNumberExample() {
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <View className="flex-1 bg-white p-6">
      <VStack space="lg" className="w-full">
        <Text className="text-2xl font-bold text-typography-900 mb-4">
          Phone Number Input Example
        </Text>

        <VStack space="md">
          <Text className="text-lg font-semibold text-typography-800">
            Default Style (Outline)
          </Text>
          <PhoneNumberInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
          />
          <Text className="text-sm text-typography-600">
            Raw value: {phoneNumber}
          </Text>
        </VStack>

        <VStack space="md">
          <Text className="text-lg font-semibold text-typography-800">
            Underlined Style
          </Text>
          <PhoneNumberInput
            variant="underlined"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
          />
        </VStack>

        <VStack space="md">
          <Text className="text-lg font-semibold text-typography-800">
            Rounded Style
          </Text>
          <PhoneNumberInput
            variant="rounded"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
          />
        </VStack>

        <VStack space="md">
          <Text className="text-lg font-semibold text-typography-800">
            Different Sizes
          </Text>
          <HStack space="md" className="w-full">
            <View className="flex-1">
              <Text className="text-sm text-typography-600 mb-2">Small</Text>
              <PhoneNumberInput
                size="sm"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Small"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-typography-600 mb-2">Large</Text>
              <PhoneNumberInput
                size="lg"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Large"
              />
            </View>
          </HStack>
        </VStack>
      </VStack>
    </View>
  );
}
