import { TalentExpandedBlockout } from "@/types/blockouts";
import moment from "moment-timezone";

export const formatTime = (dateString: string) => {
  const date = moment.utc(dateString).local();

  return date.format("h:mm A");
};

export const formatBlockoutTime = (blockout: TalentExpandedBlockout) => {
  const start = moment.utc(blockout.start_time).local();
  const end = moment.utc(blockout.end_time).local();

  if (blockout.is_all_day) {
    if (!start.isSame(end, "day")) {
      return `${start.format("MMM D")} - ${end.format("MMM D")}`;
    }
    return "All Day";
  }

  // If spans multiple days, show dates + times
  if (!start.isSame(end, "day")) {
    return `${start.format("MMM D, h:mm A")} - ${end.format("MMM D, h:mm A")}`;
  }

  return `${formatTime(blockout.start_time)} - ${formatTime(
    blockout.end_time
  )}`;
};

export const getBlockoutDuration = (blockout: TalentExpandedBlockout) => {
  if (blockout.is_all_day) {
    const start = moment.utc(blockout.start_time).local();
    const end = moment.utc(blockout.end_time).local();
    const days = end.diff(start, "day") + 1;

    if (days > 1) {
      return `${days} days`;
    }
    return "All Day Event";
  }

  const start = moment.utc(blockout.start_time).local();
  const end = moment.utc(blockout.end_time).local();

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

/**
 * Formats a frequency type into a human-readable string with proper pluralization
 * @param frequency - The frequency type (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param interval - The interval number (1, 2, 3, etc.)
 * @returns Formatted frequency string (e.g., "day", "days", "week", "weeks")
 */
export const formatFrequencyLabel = (
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
  interval: number
): string => {
  const isPlural = interval > 1;

  switch (frequency) {
    case "DAILY":
      return isPlural ? "days" : "day";
    case "WEEKLY":
      return isPlural ? "weeks" : "week";
    case "MONTHLY":
      return isPlural ? "months" : "month";
    case "YEARLY":
      return isPlural ? "years" : "year";
  }
};
