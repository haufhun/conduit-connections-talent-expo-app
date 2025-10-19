import { RRuleOptions } from "@/validators/blockouts.validators";
import dayjs from "dayjs";
import { RRule } from "rrule";

export interface RecurringPreset {
  label: string;
  value: string | RRuleOptions | null; // "NONE", "CUSTOM", or RRuleOptions
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
  return dayjs(startDate).isSame(dayjs(endDate), "day");
}

/**
 * Generate recurring preset options based on the start and end dates
 */
export function getRecurringPresets(
  startDate: Date,
  endDate: Date
): RecurringPreset[] {
  const dtstart = startDate;

  const presets: RecurringPreset[] = [
    {
      label: "None",
      value: null,
    },
  ];

  const sameDay = isSameDay(startDate, endDate);
  const dayNum = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const rruleDayNum = dayNum === 0 ? 6 : dayNum - 1; // Convert to RRule format (0 = Monday)

  // Add weekday/weekend preset if applicable
  if (sameDay) {
    if (isWeekday(startDate)) {
      presets.push({
        label: "Every Weekday",
        value: {
          freq: RRule.WEEKLY,
          dtstart,
          interval: 1,
          byweekday: [0, 1, 2, 3, 4], // Monday-Friday
          // bymonthday: [],
          // // @ts-ignore Have to have this to get equality comparison to work
          // bymonth: null,
          count: 20,
        },
      });
    } else if (isWeekend(startDate)) {
      presets.push({
        label: "Every Weekend",
        value: {
          freq: RRule.WEEKLY,
          dtstart,
          interval: 1,
          byweekday: [5, 6], // Saturday-Sunday
          count: 20,
        },
      });
    }
  }

  // Daily preset (only if same day)
  if (sameDay) {
    presets.push({
      label: "Daily",
      value: {
        freq: RRule.DAILY,
        dtstart,
        interval: 1,
        count: 20,
      },
    });
  }

  // Weekly preset
  const dayName = getDayName(startDate);
  presets.push({
    label: `Weekly on ${dayName}`,
    value: {
      freq: RRule.WEEKLY,
      dtstart,
      interval: 1,
      byweekday: [rruleDayNum],
      count: 20,
    },
  });

  // Monthly preset
  const weekOfMonth = getWeekOfMonth(startDate);
  const ordinal = getOrdinalSuffix(weekOfMonth);

  // For monthly, use the day of month approach
  presets.push({
    label: `Monthly on the ${ordinal} ${dayName}`,
    value: {
      freq: RRule.MONTHLY,
      dtstart,
      interval: 1,
      bymonthday: [startDate.getDate()],
      count: 20,
    },
  });

  // Annual preset
  const monthDay = dayjs(startDate).format("MMMM D");
  presets.push({
    label: `Annually on ${monthDay}`,
    value: {
      freq: RRule.YEARLY,
      dtstart,
      interval: 1,
      bymonthday: [startDate.getDate()],
      bymonth: [startDate.getMonth() + 1],
      count: 20,
    },
  });

  // Custom option
  presets.push({
    label: "Custom",
    value: "CUSTOM",
  });

  return presets;
}
