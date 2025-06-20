import { useAvailableUsers } from "@/api/blockouts_api";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";

export default function AvailabilitySearch() {
  const filter = {
    startTime: "2025-06-15T09:00:00Z",
    endTime: "2025-06-15T17:00:00Z",
    // skillIds: [1, 2, 3], // Photography, Video Editing, etc.
  };

  const { data: availableUsersResponse, isLoading } = useAvailableUsers(filter);

  if (isLoading) {
    return <Text>Loading available users...</Text>;
  }

  const availableUsers = availableUsersResponse?.data || [];

  return (
    <SafeAreaView>
      <ScrollView>
        <VStack space="md" className="p-4">
          <Text size="lg" className="font-bold">
            Available Users (June 15, 9 AM - 5 PM)
          </Text>

          {availableUsers.map((user) => (
            <HStack
              key={user.id}
              space="md"
              className="p-3 bg-white rounded-lg"
            >
              <VStack className="flex-1">
                <Text className="font-semibold">
                  {user.first_name} {user.last_name}
                </Text>
                <Text size="sm" className="text-gray-600">
                  Status: {user.availability_status}
                </Text>
                {user.conflicting_blockouts.length > 0 && (
                  <Text size="xs" className="text-red-600">
                    {user.conflicting_blockouts.length} conflicts
                  </Text>
                )}
              </VStack>

              <Button
                size="sm"
                action={
                  user.availability_status === "available"
                    ? "positive"
                    : "negative"
                }
              >
                <ButtonText>
                  {user.availability_status === "available"
                    ? "Book"
                    : "View Conflicts"}
                </ButtonText>
              </Button>
            </HStack>
          ))}
        </VStack>

        <VStack className="h-[50px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
