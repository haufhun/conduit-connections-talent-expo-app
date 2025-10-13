import dayjs from "dayjs";

export interface RecurringPreset {
  label: string;
  value: string; // "NONE" or an RRULE string
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
 * Get the day of week abbreviation (MO, TU, WE, etc.)
 */
function getDayOfWeekAbbr(date: Date): string {
  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return days[date.getDay()];
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
  const presets: RecurringPreset[] = [
    {
      label: "Does not repeat",
      value: "NONE",
    },
  ];

  const sameDay = isSameDay(startDate, endDate);

  // Add weekday/weekend preset if applicable
  if (sameDay) {
    if (isWeekday(startDate)) {
      presets.push({
        label: "Every Weekday",
        value: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=20",
      });
    } else if (isWeekend(startDate)) {
      presets.push({
        label: "Every Weekend",
        value: "RRULE:FREQ=WEEKLY;BYDAY=SA,SU;COUNT=20",
      });
    }
  }

  // Daily preset (only if same day)
  if (sameDay) {
    presets.push({
      label: "Daily",
      value: "RRULE:FREQ=DAILY;COUNT=20",
    });
  }

  // Weekly preset
  const dayAbbr = getDayOfWeekAbbr(startDate);
  const dayName = getDayName(startDate);
  presets.push({
    label: `Weekly on ${dayName}`,
    value: `RRULE:FREQ=WEEKLY;BYDAY=${dayAbbr};COUNT=20`,
  });

  // Monthly preset
  const weekOfMonth = getWeekOfMonth(startDate);
  const ordinal = getOrdinalSuffix(weekOfMonth);
  presets.push({
    label: `Monthly on the ${ordinal} ${dayName}`,
    value: `RRULE:FREQ=MONTHLY;BYDAY=${weekOfMonth}${dayAbbr};COUNT=20`,
  });

  // Annual preset
  const monthDay = dayjs(startDate).format("MMMM D");
  presets.push({
    label: `Annually on ${monthDay}`,
    value: `RRULE:FREQ=YEARLY;BYMONTH=${
      startDate.getMonth() + 1
    };BYMONTHDAY=${startDate.getDate()};COUNT=20`,
  });

  // Custom option
  presets.push({
    label: "Custom",
    value: "CUSTOM",
  });

  return presets;
}
