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
