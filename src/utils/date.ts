import { TalentExpandedBlockout } from "@/types/blockouts";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDayjsFromUtcDateString = (utcDateString: string) => {
  // We should be able to do this, but it's not working b/c dayjs is a POS and won't fix it to work with Expo.
  // return dayjs.utc(dateString).tz(getTimezone());

  // So instead, here is a hack to get the local date from the UTC date string
  // const utcDate = new Date(utcDateString);
  // const localDate = new Date(utcDate.getTime());
  // return dayjs(localDate);

  // Alternative hack to convert UTC date string to local time
  const utcDate = dayjs.utc(utcDateString);
  return utcDate.local();
};

export const getDayjsFromUtcDate = (utcDate: Date) => {
  // Convert Date to UTC string and then to local time
  const utcDateString = utcDate.toISOString();
  return getDayjsFromUtcDateString(utcDateString);
};

export const formatTime = (dateString: string) => {
  const date = getDayjsFromUtcDateString(dateString);

  return date.format("h:mm A");
};

export const formatBlockoutTime = (blockout: TalentExpandedBlockout) => {
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
    return `${start.format("MMM D, h:mm A")} - ${end.format("MMM D, h:mm A")}`;
  }

  return `${formatTime(blockout.start_time)} - ${formatTime(
    blockout.end_time
  )}`;
};

export const getBlockoutDuration = (blockout: TalentExpandedBlockout) => {
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
