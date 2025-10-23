import { RecurringScheduleOptions } from "@/validators/blockouts.validators";
import moment from "moment-timezone";

export interface RecurringPreset {
  label: string;
  value: string | RecurringScheduleOptions | null; // "NONE", "CUSTOM", or RecurringScheduleOptions
}

/**
 * Get the week of the month (1-5) for a given date
 */
function getWeekOfMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
}

/**
 * Get the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  if (num === 1) return "first";
  if (num === 2) return "second";
  if (num === 3) return "third";
  if (num === 4) return "fourth";
  if (num === 5) return "fifth";
  return `${num}th`;
}

/**
 * Get the full day name
 */
function getDayName(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

/**
 * Check if a date is a weekday (Monday-Friday)
 */
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Check if a date is a weekend (Saturday-Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if start and end dates are on the same day
 */
function isSameDay(startDate: Date, endDate: Date): boolean {
  return moment(startDate).isSame(moment(endDate), "day");
}

/**
 * Convert day number (0=Sunday) to our WeekdayType
 */
function getDayWeekdayType(
  dayNum: number
):
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY" {
  const map = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ] as const;
  return map[dayNum];
}

/**
 * Generate recurring preset options based on the start and end dates
 */
export function getRecurringPresets(
  startDate: Date,
  endDate: Date
): RecurringPreset[] {
  const presets: RecurringPreset[] = [
    {
      label: "None",
      value: null,
    },
  ];

  const sameDay = isSameDay(startDate, endDate);
  const dayNum = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayWeekdayType = getDayWeekdayType(dayNum);

  // Add weekday/weekend preset if applicable
  if (sameDay) {
    if (isWeekday(startDate)) {
      presets.push({
        label: "Every Weekday",
        value: {
          frequency: "WEEKLY",
          interval: 1,
          weekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
          monthlyType: "DAY_OF_MONTH",
          dayOfMonth: 1, // This field is irrelevant for WEEKLY frequency it seems
          weekOfMonth: 1,
          dayOfWeek: "MONDAY",
          endType: "AFTER_OCCURRENCES",
          occurrences: 20,
        },
      });
    } else if (isWeekend(startDate)) {
      presets.push({
        label: "Every Weekend",
        value: {
          frequency: "WEEKLY",
          interval: 1,
          weekdays: ["SATURDAY", "SUNDAY"],
          monthlyType: "DAY_OF_MONTH",
          dayOfMonth: 1, // This field is irrelevant for WEEKLY frequency it seems
          weekOfMonth: 1,
          dayOfWeek: "MONDAY",
          endType: "AFTER_OCCURRENCES",
          occurrences: 20,
        },
      });
    }
  }

  // Daily preset (only if same day)
  if (sameDay) {
    presets.push({
      label: "Daily",
      value: {
        frequency: "DAILY",
        interval: 1,
        weekdays: [],
        monthlyType: "DAY_OF_MONTH",
        dayOfMonth: 1, // This field is irrelevant for WEEKLY frequency it seems
        weekOfMonth: 1,
        dayOfWeek: "MONDAY",
        endType: "AFTER_OCCURRENCES",
        occurrences: 20,
      },
    });
  }

  // Weekly preset
  const dayName = getDayName(startDate);
  presets.push({
    label: `Weekly on ${dayName}`,
    value: {
      frequency: "WEEKLY",
      interval: 1,
      weekdays: [dayWeekdayType],
      monthlyType: "DAY_OF_MONTH",
      dayOfMonth: 1, // This field is irrelevant for WEEKLY frequency it seems
      weekOfMonth: 1,
      dayOfWeek: "MONDAY",
      endType: "AFTER_OCCURRENCES",
      occurrences: 20,
    },
  });

  // Monthly preset
  const weekOfMonth = getWeekOfMonth(startDate);
  const ordinal = getOrdinalSuffix(weekOfMonth);

  // For monthly, use the day of month approach
  // presets.push({
  //   label: `Monthly on the ${ordinal} ${dayName}`,
  //   value: {
  //     frequency: "MONTHLY",
  //     interval: 1,
  //     weekdays: [],
  //     monthlyType: "DAY_OF_MONTH",
  //     dayOfMonth: startDate.getDate(),
  //     weekOfMonth: 1,
  //     dayOfWeek: "MONDAY",
  //     endType: "AFTER_OCCURRENCES",
  //     occurrences: 20,
  //   },
  // });

  const dayOfMonth = startDate.getDate();
  const suffix =
    dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31
      ? "st"
      : dayOfMonth === 2 || dayOfMonth === 22
      ? "nd"
      : dayOfMonth === 3 || dayOfMonth === 23
      ? "rd"
      : "th";

  presets.push({
    label: `Monthly on the ${dayOfMonth}${suffix}`,
    value: {
      frequency: "MONTHLY",
      interval: 1,
      weekdays: [],
      monthlyType: "DAY_OF_MONTH",
      dayOfMonth: startDate.getDate(),
      weekOfMonth: 1,
      dayOfWeek: "MONDAY",
      endType: "AFTER_OCCURRENCES",
      occurrences: 20,
    },
  });

  // Annual preset
  const monthDay = moment(startDate).format("MMMM D");
  presets.push({
    label: `Annually on ${monthDay}`,
    value: {
      frequency: "YEARLY",
      interval: 1,
      weekdays: [],
      monthlyType: "DAY_OF_MONTH",
      dayOfMonth: startDate.getDate(),
      weekOfMonth: 1,
      dayOfWeek: "MONDAY",
      endType: "AFTER_OCCURRENCES",
      occurrences: 20,
    },
  });

  // Custom option
  presets.push({
    label: "Custom",
    value: "CUSTOM",
  });

  return presets;
}
