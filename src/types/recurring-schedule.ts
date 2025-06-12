import { RRule } from "rrule";

export type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type WeekdayType =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type MonthlyType = "DAY_OF_MONTH" | "DAY_OF_WEEK";

export type EndType = "NEVER" | "ON_DATE" | "AFTER_OCCURRENCES";

export interface RecurringScheduleOptions {
  frequency: FrequencyType;
  interval: number;

  // Weekly options
  weekdays: WeekdayType[];

  // Monthly options
  monthlyType: MonthlyType;
  dayOfMonth: number;
  weekOfMonth: number; // 1-4, -1 for last
  dayOfWeek: WeekdayType;

  // End options
  endType: EndType;
  endDate?: Date;
  occurrences?: number;
}

export const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "DAILY" as const },
  { label: "Weekly", value: "WEEKLY" as const },
  { label: "Monthly", value: "MONTHLY" as const },
  { label: "Yearly", value: "YEARLY" as const },
];

export const WEEKDAY_OPTIONS = [
  { label: "Monday", value: "MONDAY" as const, short: "MO" },
  { label: "Tuesday", value: "TUESDAY" as const, short: "TU" },
  { label: "Wednesday", value: "WEDNESDAY" as const, short: "WE" },
  { label: "Thursday", value: "THURSDAY" as const, short: "TH" },
  { label: "Friday", value: "FRIDAY" as const, short: "FR" },
  { label: "Saturday", value: "SATURDAY" as const, short: "SA" },
  { label: "Sunday", value: "SUNDAY" as const, short: "SU" },
];

export const MONTHLY_TYPE_OPTIONS = [
  { label: "On day of month", value: "DAY_OF_MONTH" as const },
  { label: "On day of week", value: "DAY_OF_WEEK" as const },
];

export const END_TYPE_OPTIONS = [
  { label: "Never", value: "NEVER" as const },
  { label: "On date", value: "ON_DATE" as const },
  { label: "After occurrences", value: "AFTER_OCCURRENCES" as const },
];

export const WEEK_OF_MONTH_OPTIONS = [
  { label: "First", value: 1 },
  { label: "Second", value: 2 },
  { label: "Third", value: 3 },
  { label: "Fourth", value: 4 },
  { label: "Last", value: -1 },
];

// Convert our form options to RRule constants
export const mapFrequencyToRRule = (frequency: FrequencyType): number => {
  switch (frequency) {
    case "DAILY":
      return RRule.DAILY;
    case "WEEKLY":
      return RRule.WEEKLY;
    case "MONTHLY":
      return RRule.MONTHLY;
    case "YEARLY":
      return RRule.YEARLY;
  }
};

export const mapWeekdayToRRule = (weekday: WeekdayType) => {
  switch (weekday) {
    case "MONDAY":
      return RRule.MO;
    case "TUESDAY":
      return RRule.TU;
    case "WEDNESDAY":
      return RRule.WE;
    case "THURSDAY":
      return RRule.TH;
    case "FRIDAY":
      return RRule.FR;
    case "SATURDAY":
      return RRule.SA;
    case "SUNDAY":
      return RRule.SU;
  }
};
