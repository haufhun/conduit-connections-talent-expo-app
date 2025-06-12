import { useUserSchedule } from "@/api/blockouts_api";
import { Fab, FabIcon } from "@/components/ui/fab";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, CalendarDaysIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/providers/auth-provider";
import { TalentBlockout } from "@/types/blockouts";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleScreen() {
  const { session } = useAuth();
  const router = useRouter();

  // Get current date and 30 days from now for schedule range
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useUserSchedule(session?.user?.id || "", startDate, endDate);

  if (!session?.user?.id) {
    return <Redirect href="/" />;
  }

  const blockouts = scheduleData?.data || [];

  // Format date and time helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatBlockoutTime = (blockout: TalentBlockout) => {
    if (blockout.is_all_day) {
      return "All Day";
    }
    return `${formatTime(blockout.start_time)} - ${formatTime(
      blockout.end_time
    )}`;
  };

  const getBlockoutDuration = (blockout: TalentBlockout) => {
    if (blockout.is_all_day) {
      return "All Day Event";
    }

    const start = new Date(blockout.start_time);
    const end = new Date(blockout.end_time);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Group blockouts by date
  const groupedBlockouts = blockouts.reduce((acc, blockout) => {
    const date = new Date(blockout.start_time).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(blockout);
    return acc;
  }, {} as Record<string, TalentBlockout[]>);

  // Sort dates and blockouts within each date
  const sortedDates = Object.keys(groupedBlockouts).sort(
    (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
  );

  sortedDates.forEach((date) => {
    groupedBlockouts[date].sort(
      (a: TalentBlockout, b: TalentBlockout) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <VStack className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#5de0e6" />
          <Text className="mt-2 text-typography-600">
            Loading your schedule...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <VStack className="flex-1 justify-center items-center p-4">
          <Text className="text-red-600 text-center">
            Error loading schedule:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} className="bg-white">
      <VStack className="flex-1 px-0">
        {/* Header */}
        <VStack className="pt-6 pb-2 px-5">
          <HStack className="justify-between items-center">
            <VStack>
              <Text size="2xl" className="font-bold text-typography-900">
                My Schedule
              </Text>
              <Text size="sm" className="text-typography-600">
                {blockouts.length} blockout{blockouts.length !== 1 ? "s" : ""}{" "}
                in the next 30 days
              </Text>
            </VStack>
            <CalendarDaysIcon className="text-primary-500 h-7 w-7" />
          </HStack>
        </VStack>

        {/* Schedule Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <VStack className="pb-24 px-4" space="lg">
            {sortedDates.length === 0 ? (
              /* Empty State */
              <VStack
                className="flex-1 justify-center items-center py-16"
                space="md"
              >
                <CalendarDaysIcon className="text-primary-200 opacity-60 h-12 w-12" />
                <VStack className="items-center" space="sm">
                  <Text size="lg" className="font-semibold text-primary-900">
                    No blockouts scheduled
                  </Text>
                  <Text className="text-typography-500 text-center max-w-64">
                    You don&apos;t have any blockouts in the next 30 days. Add
                    one to block time in your schedule.
                  </Text>
                </VStack>
              </VStack>
            ) : (
              /* Blockouts List */
              sortedDates.map((date) => (
                <VStack key={date} space="sm">
                  {/* Date Header */}
                  <Text
                    size="lg"
                    bold
                    className="text-primary-700 pt-2 pb-1 px-1"
                  >
                    {formatDate(date)}
                  </Text>

                  {/* Blockouts for this date */}
                  <VStack space="sm">
                    {groupedBlockouts[date].map((blockout: TalentBlockout) => (
                      <TouchableOpacity
                        key={blockout.blockout_id}
                        className="p-4 bg-white rounded-xl border border-black/10"
                        activeOpacity={0.7}
                        // TODO: Navigate to edit blockout screen
                      >
                        <HStack space="md" className="items-center">
                          <VStack className="w-14 h-14 justify-center items-center">
                            <CalendarDaysIcon className="h-6 w-6" />
                          </VStack>

                          <VStack space="xs" className="flex-1">
                            <HStack className="items-center justify-between">
                              <Text
                                size="lg"
                                bold
                                className="text-typography-900"
                              >
                                {blockout.title}
                              </Text>
                            </HStack>

                            <HStack space="sm">
                              <Text size="sm" className="text-typography-500">
                                {formatBlockoutTime(blockout)}
                              </Text>
                              <Text size="sm" className="text-typography-500">
                                • {getBlockoutDuration(blockout)}
                              </Text>
                            </HStack>

                            {blockout.description && (
                              <Text
                                size="sm"
                                className="text-typography-700"
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {blockout.description}
                              </Text>
                            )}

                            {blockout.is_recurring && (
                              <HStack className="items-center mt-1" space="xs">
                                <Text className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                  Recurring
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </HStack>
                      </TouchableOpacity>
                    ))}
                  </VStack>
                </VStack>
              ))
            )}
          </VStack>
        </ScrollView>

        {/* Floating Action Button */}
        <Fab
          placement="bottom right"
          size="lg"
          style={styles.fab}
          onPress={() => {
            router.push("/(tabs)/schedule/create");
          }}
        >
          <FabIcon as={AddIcon} size="lg" className="text-white" />
        </Fab>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  blockoutCard: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 63, // Moved up to clear the tab bar
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
});
