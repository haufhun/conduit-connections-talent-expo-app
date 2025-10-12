import {
  RecurringScheduleOptions,
  WeekdayType,
  mapFrequencyToRRule,
  mapWeekdayToRRule,
} from "@/types/recurring-schedule";
import { RRule, datetime } from "rrule";

export const convertToRRule = (
  options: RecurringScheduleOptions,
  startDate: Date
): string => {
  const ruleOptions: any = {
    freq: mapFrequencyToRRule(options.frequency),
    interval: options.interval,
    dtstart: datetime(
      startDate.getFullYear(),
      startDate.getMonth() + 1, // RRule uses 1-based months
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds()
    ),
  };

  // Handle weekly recurrence
  if (options.frequency === "WEEKLY" && options.weekdays.length > 0) {
    ruleOptions.byweekday = options.weekdays.map(mapWeekdayToRRule);
  }

  // Handle monthly recurrence
  if (options.frequency === "MONTHLY") {
    if (options.monthlyType === "DAY_OF_MONTH") {
      ruleOptions.bymonthday = options.dayOfMonth;
    } else if (options.monthlyType === "DAY_OF_WEEK") {
      const weekday = mapWeekdayToRRule(options.dayOfWeek);
      if (options.weekOfMonth === -1) {
        // Last occurrence of the weekday in the month
        ruleOptions.byweekday = [weekday.nth(-1)];
      } else {
        // Specific week of the month
        ruleOptions.byweekday = [weekday.nth(options.weekOfMonth)];
      }
    }
  }

  // Handle end conditions
  if (options.endType === "ON_DATE" && options.endDate) {
    ruleOptions.until = datetime(
      options.endDate.getFullYear(),
      options.endDate.getMonth() + 1,
      options.endDate.getDate(),
      23,
      59,
      59 // End of day
    );
  } else if (options.endType === "AFTER_OCCURRENCES" && options.occurrences) {
    ruleOptions.count = options.occurrences;
  }

  const rule = new RRule(ruleOptions);
  return rule.toString().split("\n")[1]; // Get just the RRULE part, not DTSTART
};

export const parseRRule = (
  rruleString: string,
  startDate: Date
): RecurringScheduleOptions => {
  // This is a simplified parser - you might want to make it more robust
  console.log("Parsing RRULE string:", rruleString);

  // Remove the "RRULE:" prefix if it exists
  const wholeRRuleString = !rruleString.startsWith("RRULE:")
    ? `RRULE:${rruleString}`
    : rruleString;

  const rule = RRule.fromString(
    `DTSTART:${
      startDate.toISOString().replace(/[-:]/g, "").split(".")[0]
    }Z\n${wholeRRuleString}`
  );

  const options: RecurringScheduleOptions = {
    frequency: "WEEKLY",
    interval: rule.options.interval || 1,
    weekdays: [],
    monthlyType: "DAY_OF_MONTH",
    dayOfMonth: 1,
    weekOfMonth: 1,
    dayOfWeek: "MONDAY",
    endType: "NEVER",
  };

  // Map frequency
  switch (rule.options.freq) {
    case RRule.DAILY:
      options.frequency = "DAILY";
      break;
    case RRule.WEEKLY:
      options.frequency = "WEEKLY";
      break;
    case RRule.MONTHLY:
      options.frequency = "MONTHLY";
      break;
    case RRule.YEARLY:
      options.frequency = "YEARLY";
      break;
  }

  // Map weekdays for weekly recurrence
  if (rule.options.byweekday && options.frequency === "WEEKLY") {
    const weekdayMap: { [key: number]: WeekdayType } = {
      0: "MONDAY",
      1: "TUESDAY",
      2: "WEDNESDAY",
      3: "THURSDAY",
      4: "FRIDAY",
      5: "SATURDAY",
      6: "SUNDAY",
    };

    const byweekday = Array.isArray(rule.options.byweekday)
      ? rule.options.byweekday
      : [rule.options.byweekday];

    options.weekdays = byweekday
      .map((wd: any) => {
        const weekdayNum = typeof wd === "number" ? wd : wd.weekday;
        return weekdayMap[weekdayNum];
      })
      .filter(Boolean);
  }

  // Handle monthly recurrence
  if (options.frequency === "MONTHLY") {
    if (rule.options.bymonthday) {
      // Day of month pattern
      options.monthlyType = "DAY_OF_MONTH";
      options.dayOfMonth = Array.isArray(rule.options.bymonthday)
        ? rule.options.bymonthday[0]
        : rule.options.bymonthday;
    } else if (rule.options.byweekday) {
      // Day of week pattern
      options.monthlyType = "DAY_OF_WEEK";

      const weekdayMap: { [key: number]: WeekdayType } = {
        0: "MONDAY",
        1: "TUESDAY",
        2: "WEDNESDAY",
        3: "THURSDAY",
        4: "FRIDAY",
        5: "SATURDAY",
        6: "SUNDAY",
      };

      const byweekday = Array.isArray(rule.options.byweekday)
        ? rule.options.byweekday[0]
        : rule.options.byweekday;

      const weekdayNum =
        typeof byweekday === "number" ? byweekday : (byweekday as any).weekday;
      options.dayOfWeek = weekdayMap[weekdayNum];

      // Get the nth occurrence (1-4, or -1 for last)
      if (typeof byweekday !== "number" && (byweekday as any).n) {
        options.weekOfMonth = (byweekday as any).n;
      } else {
        // Default to first occurrence if no nth specified
        options.weekOfMonth = 1;
      }
    }
  }

  // Handle end conditions
  if (rule.options.until) {
    options.endType = "ON_DATE";
    options.endDate = rule.options.until;
  } else if (rule.options.count) {
    options.endType = "AFTER_OCCURRENCES";
    options.occurrences = rule.options.count;
  }

  return options;
};

export const generateReadableDescription = (
  options: RecurringScheduleOptions
): string => {
  let description = "";

  // Frequency and interval
  if (options.interval === 1) {
    switch (options.frequency) {
      case "DAILY":
        description = "Every day";
        break;
      case "WEEKLY":
        description = "Every week";
        break;
      case "MONTHLY":
        description = "Every month";
        break;
      case "YEARLY":
        description = "Every year";
        break;
    }
  } else {
    switch (options.frequency) {
      case "DAILY":
        description = `Every ${options.interval} days`;
        break;
      case "WEEKLY":
        description = `Every ${options.interval} weeks`;
        break;
      case "MONTHLY":
        description = `Every ${options.interval} months`;
        break;
      case "YEARLY":
        description = `Every ${options.interval} years`;
        break;
    }
  }

  // Weekly specifics
  if (options.frequency === "WEEKLY" && options.weekdays.length > 0) {
    const dayNames = options.weekdays.map(
      (day) => day.charAt(0) + day.slice(1).toLowerCase()
    );
    description += ` on ${dayNames.join(", ")}`;
  }

  // Monthly specifics
  if (options.frequency === "MONTHLY") {
    if (options.monthlyType === "DAY_OF_MONTH") {
      const suffix =
        options.dayOfMonth === 1
          ? "st"
          : options.dayOfMonth === 2
          ? "nd"
          : options.dayOfMonth === 3
          ? "rd"
          : "th";
      description += ` on the ${options.dayOfMonth}${suffix}`;
    } else {
      const weekNames = ["", "first", "second", "third", "fourth"];
      const weekName =
        options.weekOfMonth === -1 ? "last" : weekNames[options.weekOfMonth];
      const dayName =
        options.dayOfWeek.charAt(0) + options.dayOfWeek.slice(1).toLowerCase();
      description += ` on the ${weekName} ${dayName}`;
    }
  }

  // End conditions
  if (options.endType === "ON_DATE" && options.endDate) {
    description += ` until ${options.endDate.toLocaleDateString()}`;
  } else if (options.endType === "AFTER_OCCURRENCES" && options.occurrences) {
    description += ` for ${options.occurrences} occurrence${
      options.occurrences > 1 ? "s" : ""
    }`;
  }

  return description;
};
