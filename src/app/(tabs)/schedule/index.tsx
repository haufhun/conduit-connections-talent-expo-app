import { useUserSchedule } from "@/api/blockouts_api";
import { BlockoutCard } from "@/components/BlockoutCard";
import { Fab, FabIcon } from "@/components/ui/fab";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, CalendarDaysIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/providers/auth-provider";
import { TalentExpandedBlockout } from "@/types/blockouts";
import { Redirect, useRouter } from "expo-router";
import moment from "moment-timezone";
import React from "react";
import { ActivityIndicator, SectionList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_DAYS = 500;

export default function ScheduleScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const startDate = moment().local().format("YYYY-MM-DD");
  const endDate = moment()
    .local()
    .add(DEFAULT_DAYS, "day")
    .format("YYYY-MM-DD");
  const {
    data: scheduleData,
    isLoading,
    error,
    refetch,
  } = useUserSchedule(session?.user?.id || "", startDate, endDate);

  if (!session?.user?.id) {
    return <Redirect href="/" />;
  }

  const blockouts = scheduleData?.data || [];

  // Group blockouts by date and format for SectionList
  // For multi-day blockouts, create entries for each day they span (from today onwards)
  const groupedBlockouts = blockouts.reduce((acc, blockout) => {
    const start = moment.utc(blockout.start_time).local();
    const end = moment.utc(blockout.end_time).local();
    const today = moment().startOf("day");

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

        <SectionList
          sections={sectionData}
          keyExtractor={(item) => item.blockout_id.toString()}
          renderItem={({ item: blockout }) => (
            <BlockoutCard blockout={blockout} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              size="lg"
              bold
              className="text-primary-700 pt-2 pb-1 px-5 bg-white"
            >
              {title}
            </Text>
          )}
          refreshing={isLoading}
          onRefresh={() => {
            refetch();
          }}
          contentContainerStyle={styles.sectionListContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          ListEmptyComponent={
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
          }
        />

        {/* Floating Action Button */}
        <Fab
          placement="bottom right"
          size="lg"
          className="bg-[#5DE0E6] shadow-sm"
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
});
