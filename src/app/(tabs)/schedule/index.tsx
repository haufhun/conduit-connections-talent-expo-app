import { useUserSchedule } from "@/api/blockouts_api";
import { Fab, FabIcon } from "@/components/ui/fab";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, CalendarDaysIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/providers/auth-provider";
import { TalentExpandedBlockout } from "@/types/blockouts";
import { getBlockoutStatus } from "@/utils/blockout-permissions";
import { getDayjsFromUtcDateString } from "@/utils/date";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Redirect, useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_DAYS = 365;

const formatTime = (dateString: string) => {
  const date = getDayjsFromUtcDateString(dateString);

  return date.format("h:mm A");
};

export default function ScheduleScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const startDate = dayjs().utc().format("YYYY-MM-DD");
  const endDate = dayjs().utc().add(DEFAULT_DAYS, "day").format("YYYY-MM-DD");
  const {
    data: scheduleData,
    isLoading,
    error,
  } = useUserSchedule(session?.user?.id || "", startDate, endDate);

  if (!session?.user?.id) {
    return <Redirect href="/" />;
  }

  const blockouts = scheduleData?.data || [];

  const formatBlockoutTime = (blockout: TalentExpandedBlockout) => {
    const start = getDayjsFromUtcDateString(blockout.start_time);
    const end = getDayjsFromUtcDateString(blockout.end_time);

    if (blockout.is_all_day) {
      if (!start.isSame(end, "day")) {
        return `${start.format("MMM D")} - ${end.format("MMM D")}`;
      }
      return "All Day";
    }

    // If spans multiple days, show dates + times
    if (!start.isSame(end, "day")) {
      return `${start.format("MMM D, h:mm A")} - ${end.format(
        "MMM D, h:mm A"
      )}`;
    }

    return `${formatTime(blockout.start_time)} - ${formatTime(
      blockout.end_time
    )}`;
  };

  const getBlockoutDuration = (blockout: TalentExpandedBlockout) => {
    if (blockout.is_all_day) {
      const start = getDayjsFromUtcDateString(blockout.start_time);
      const end = getDayjsFromUtcDateString(blockout.end_time);
      const days = end.diff(start, "day") + 1;

      if (days > 1) {
        return `${days} days`;
      }
      return "All Day Event";
    }

    const start = getDayjsFromUtcDateString(blockout.start_time);
    const end = getDayjsFromUtcDateString(blockout.end_time);

    // Check if it spans multiple days
    if (!start.isSame(end, "day")) {
      const days = end.diff(start, "day") + 1;
      return `${days} days`;
    }

    const durationMs = end.diff(start);
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

  // Group blockouts by date and format for SectionList
  // For multi-day blockouts, create entries for each day they span (from today onwards)
  const groupedBlockouts = blockouts.reduce((acc, blockout) => {
    const start = getDayjsFromUtcDateString(blockout.start_time);
    const end = getDayjsFromUtcDateString(blockout.end_time);
    const today = dayjs().startOf("day");

    // If it's a single day blockout, add it normally
    if (start.isSame(end, "day")) {
      const date = start.format("ddd, MMM DD YYYY");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(blockout);
    } else {
      // For multi-day blockouts, add an entry for each day it spans
      // But only from today onwards (don't show past days)
      let currentDay = start.startOf("day");
      const endDay = end.startOf("day");

      // Start from today if the blockout started in the past
      if (currentDay.isBefore(today, "day")) {
        currentDay = today;
      }

      while (
        currentDay.isSame(endDay, "day") ||
        currentDay.isBefore(endDay, "day")
      ) {
        const date = currentDay.format("ddd, MMM DD YYYY");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(blockout);
        currentDay = currentDay.add(1, "day");
      }
    }

    return acc;
  }, {} as Record<string, TalentExpandedBlockout[]>);

  // Sort dates and blockouts within each date
  const sortedDates = Object.keys(groupedBlockouts).sort(
    (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
  );

  sortedDates.forEach((date) => {
    groupedBlockouts[date].sort(
      (a: TalentExpandedBlockout, b: TalentExpandedBlockout) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  });

  // Transform data for SectionList
  const sectionData = sortedDates.map((date) => ({
    title: date,
    data: groupedBlockouts[date],
  }));

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
    <SafeAreaView className="flex-1 bg-white pb-[50px]">
      <VStack className="flex-1 px-0">
        {/* Header */}
        <VStack className="pt-6 pb-2 px-5">
          <HStack className="justify-between items-center">
            <VStack>
              <HStack space="sm">
                <Icon as={CalendarDaysIcon} className="h-7 w-7" />
                <Text size="2xl" className="font-bold text-typography-900">
                  My Schedule
                </Text>
              </HStack>
              <Text size="sm" className="text-typography-600">
                {blockouts.length} blockout{blockouts.length !== 1 ? "s" : ""}{" "}
                in the next {DEFAULT_DAYS} days
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Schedule Content */}
        {sectionData.length === 0 ? (
          /* Empty State */
          <VStack
            className="flex-1 justify-center items-center py-16"
            space="md"
          >
            <Icon
              as={CalendarDaysIcon}
              // className="h-12 w-12 text-primary-200 opacity-60"
            />
            <VStack className="items-center" space="sm">
              <Text size="lg" className="font-semibold text-primary-900">
                No blockouts scheduled
              </Text>
              <Text className="text-typography-500 text-center max-w-64">
                You don&apos;t have any blockouts in the next {DEFAULT_DAYS}{" "}
                days. Add one to block time in your schedule.
              </Text>
            </VStack>
          </VStack>
        ) : (
          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.blockout_id.toString()}
            renderItem={({ item: blockout }) => {
              const status = getBlockoutStatus(blockout);

              return (
                <TouchableOpacity
                  className={`mx-4 mb-2 p-4 bg-white rounded-xl border border-black/10 ${
                    !status.canEdit ? "opacity-60" : ""
                  }`}
                  activeOpacity={status.canEdit ? 0.7 : 1}
                  onPress={() => {
                    if (status.canEdit) {
                      router.push({
                        pathname: "/(tabs)/schedule/[id]/edit",
                        params: {
                          id: blockout.blockout_id.toString(),
                        },
                      });
                    } else {
                      Alert.alert(
                        "Cannot Edit",
                        "This blockout cannot be edited because it has already ended. Blockouts can only be edited if their end time is in the future.",
                        [{ text: "OK" }]
                      );
                    }
                  }}
                >
                  <HStack space="md" className="items-center relative">
                    <VStack className="w-14 h-14 justify-center items-center">
                      <Icon as={CalendarDaysIcon} className="h-full w-10" />
                    </VStack>

                    <VStack space="xs" className="flex-1">
                      <HStack className="items-center justify-between">
                        <Text size="lg" bold className="text-typography-900">
                          {blockout.title}
                        </Text>
                        {/* Multi-day badge */}
                        {(() => {
                          const start = getDayjsFromUtcDateString(
                            blockout.start_time
                          );
                          const end = getDayjsFromUtcDateString(
                            blockout.end_time
                          );
                          const isMultiDay = !start.isSame(end, "day");

                          if (isMultiDay) {
                            return (
                              <VStack className="bg-primary-100 px-2 py-1 rounded-full">
                                <Text
                                  size="xs"
                                  className="text-primary-700 font-medium"
                                >
                                  Multi-day
                                </Text>
                              </VStack>
                            );
                          }
                          return null;
                        })()}
                      </HStack>

                      <HStack space="sm" className="flex-wrap">
                        <Text size="sm" className="text-typography-500">
                          {formatBlockoutTime(blockout)}
                        </Text>
                        <Text size="sm" className="text-typography-500">
                          • {getBlockoutDuration(blockout)}
                        </Text>
                      </HStack>

                      {blockout.original_blockout.description && (
                        <Text
                          size="sm"
                          className="text-typography-700"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {blockout.original_blockout.description}
                        </Text>
                      )}

                      {/* Show status indicator only for ended blockouts */}
                      {!status.canEdit && (
                        <HStack className="items-center justify-between mt-2">
                          <Text className="text-xs text-gray-500">
                            Ended - View Only
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* Recurring icon in bottom right */}
                    {blockout.original_blockout.is_recurring && (
                      <VStack className="absolute bottom-0 right-0">
                        <Icon as={RefreshCw} size="sm" />
                      </VStack>
                    )}
                  </HStack>
                </TouchableOpacity>
              );
            }}
            renderSectionHeader={({ section: { title } }) => (
              <Text
                size="lg"
                bold
                className="text-primary-700 pt-2 pb-1 px-5 bg-white"
              >
                {title}
              </Text>
            )}
            contentContainerStyle={styles.sectionListContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />
        )}

        {/* Floating Action Button */}
        <Fab
          placement="bottom right"
          size="lg"
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
  sectionListContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for FAB
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
});
