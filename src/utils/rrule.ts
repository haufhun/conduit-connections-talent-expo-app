import moment from "moment-timezone";
import { RRule } from "rrule";

export interface ExpandedBlockout {
  blockout_id: number;
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  original_blockout: any;
}

type BlockoutRuleFromDatabase = {
  rrule: string | null;
  title: string;
  end_time: string;
  created_at: string;
  is_all_day: boolean;
  start_time: string;
  updated_at: string;
  blockout_id: number;
  description: string | null;
  timezone: string;
};

export const getOccurrencesFromRecurringBlockout = (
  rrule: string,
  blockout: BlockoutRuleFromDatabase,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedBlockout[] => {
  const rule = RRule.fromString(rrule);
  rule.options.tzid = blockout.timezone;

  const original = rule.between(rangeStart, rangeEnd, true);
  console.log("original:", original);

  const mapped = original.map((date) =>
    moment(date).utc().local(true).toDate()
  );
  console.log("mapped:", mapped);

  const duration =
    moment(blockout.end_time).valueOf() - moment(blockout.start_time).valueOf();

  const expandedBlockouts = mapped.map((date) => ({
    blockout_id: blockout.blockout_id,
    title: blockout.title,
    start_time: date.toISOString(),
    end_time: moment(date).add(duration, "milliseconds").toISOString(),
    is_all_day: blockout.is_all_day,
    original_blockout: blockout,
  }));

  console.log(
    "expandedBlockouts:",
    expandedBlockouts.map((b) => b.start_time + " - " + b.end_time)
  );

  return expandedBlockouts;

  // The dtstart is in UTC time. We need to convert it to local time but set the timezone as UTC time
  // If we try to do moment(rule.options.dtstart).local().toDate(), it will go forward 5 hours (in CDT) instead of back 5 hours
  // console.log("rule.dtstart:", rule.options.dtstart);
  // const timezoneOffsetMinutes = moment.tz(blockout.timezone).utcOffset();
  // const timezoneOffsetHours = Math.floor(timezoneOffsetMinutes / 60);
  // const newDtstartInProperTz = moment
  //   .utc(rule.options.dtstart)
  //   .add(timezoneOffsetHours, "hours")
  //   .toDate();
  // console.log("newDtstartInProperTz:", newDtstartInProperTz);

  // // Update the rule with the corrected dtstart
  // rule.options.dtstart = newDtstartInProperTz;
  // rule.options.tzid = blockout.timezone;
  // console.log("Rule:", JSON.stringify(rule.options));

  // const original = rule.between(rangeStart, rangeEnd, true);
  // const original = rule.all();
  // console.log("original:", original);

  // original.forEach((date) => {
  //   // console.log("mappedBack:", date.toLocaleTimeString());
  //   console.log(moment(date).toLocaleString());
  // });

  // return original;
};

/**
 * Expands recurring blockouts into individual occurrences within a date range
 */
export const expandRecurringBlockouts = (
  blockouts: BlockoutRuleFromDatabase[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedBlockout[] => {
  const expandedBlockouts: ExpandedBlockout[] = [];

  blockouts.forEach((blockout) => {
    if (!blockout.rrule) {
      // Non-recurring blockout - check if it overlaps with our range
      const blockoutStart = moment.utc(blockout.start_time).toDate();
      const blockoutEnd = moment.utc(blockout.end_time).toDate();

      if (blockoutStart < rangeEnd && blockoutEnd > rangeStart) {
        expandedBlockouts.push({
          blockout_id: blockout.blockout_id,
          title: blockout.title,
          start_time: blockout.start_time,
          end_time: blockout.end_time,
          is_all_day: blockout.is_all_day,
          original_blockout: blockout,
        });
      }
    } else {
      // Recurring blockout - expand using RRULE
      try {
        const occurrences = getOccurrencesFromRecurringBlockout(
          blockout.rrule,
          blockout,
          rangeStart,
          rangeEnd
        );

        expandedBlockouts.push(...occurrences);

        // // Parse the rrule string and add timezone support
        // const rule = RRule.fromString(blockout.rrule);
        // // console.log("rule:", JSON.stringify(rule));

        // // Parse the original start and end times in the blockout's timezone
        // const originalStartInTZ = moment.tz(
        //   blockout.start_time,
        //   blockout.timezone
        // );
        // const originalEndInTZ = moment.tz(blockout.end_time, blockout.timezone);
        // const duration =
        //   originalEndInTZ.valueOf() - originalStartInTZ.valueOf();
        // // console.log("originalStartInTZ:", originalStartInTZ);

        // // Convert range dates to the blockout's timezone to find occurrences
        // const rangeStartInTZ = moment.tz(rangeStart, blockout.timezone);
        // const rangeEndInTZ = moment.tz(rangeEnd, blockout.timezone);

        // // Create UTC dates that represent the timezone's local time
        // // RRule treats these as "floating" times in the local timezone
        // const rangeStartUTC = new Date(
        //   Date.UTC(
        //     rangeStartInTZ.year(),
        //     rangeStartInTZ.month(),
        //     rangeStartInTZ.date(),
        //     rangeStartInTZ.hour(),
        //     rangeStartInTZ.minute(),
        //     rangeStartInTZ.second()
        //   )
        // );

        // const rangeEndUTC = new Date(
        //   Date.UTC(
        //     rangeEndInTZ.year(),
        //     rangeEndInTZ.month(),
        //     rangeEndInTZ.date(),
        //     rangeEndInTZ.hour(),
        //     rangeEndInTZ.minute(),
        //     rangeEndInTZ.second()
        //   )
        // );

        // // Get occurrences within our date range (with some buffer for duration)
        // const occurrences = rule.between(
        //   new Date(rangeStartUTC.getTime() - duration),
        //   new Date(rangeEndUTC.getTime() + duration),
        //   true
        // );

        // occurrences.forEach((occurrence) => {
        //   // occurrence is in UTC but represents the timezone's local time
        //   // Convert it back to a moment in the correct timezone
        //   const occurrenceInTZ = moment.tz(
        //     {
        //       year: occurrence.getUTCFullYear(),
        //       month: occurrence.getUTCMonth(),
        //       date: occurrence.getUTCDate(),
        //       hour: occurrence.getUTCHours(),
        //       minute: occurrence.getUTCMinutes(),
        //       second: occurrence.getUTCSeconds(),
        //     },
        //     blockout.timezone
        //     // "UTC"
        //   );

        //   const occurrenceEndInTZ = occurrenceInTZ
        //     .clone()
        //     .add(duration, "milliseconds");

        //   // Convert back to ISO strings (these will be in the correct timezone)
        //   const occurrenceStartISO = occurrenceInTZ.toISOString();
        //   const occurrenceEndISO = occurrenceEndInTZ.toISOString();

        //   // Check if this occurrence overlaps with our range
        //   const occurrenceStart = new Date(occurrenceStartISO);
        //   const occurrenceEnd = new Date(occurrenceEndISO);

        //   if (occurrenceStart < rangeEnd && occurrenceEnd > rangeStart) {
        //     expandedBlockouts.push({
        //       blockout_id: blockout.blockout_id,
        //       title: blockout.title,
        //       start_time: occurrenceStartISO,
        //       end_time: occurrenceEndISO,
        //       is_all_day: blockout.is_all_day,
        //       original_blockout: blockout,
        //     });
        //   }
        // });
      } catch (error) {
        console.warn(
          `Failed to parse RRULE for blockout ${blockout.blockout_id}:`,
          error
        );
      }
    }
  });

  const filteredBlockouts = expandedBlockouts.filter(
    (expandedBlockout) =>
      expandedBlockout.end_time >= rangeStart.toISOString() &&
      expandedBlockout.start_time <= rangeEnd.toISOString()
  );

  return filteredBlockouts;
};

/**
 * Checks if a user is available during a specific time range
 */
export const isUserAvailable = (
  userBlockouts: any[],
  requestStart: Date,
  requestEnd: Date
): { available: boolean; conflictingBlockouts: ExpandedBlockout[] } => {
  const expandedBlockouts = expandRecurringBlockouts(
    userBlockouts,
    requestStart,
    requestEnd
  );

  const conflictingBlockouts = expandedBlockouts.filter((blockout) => {
    const blockoutStart = moment.utc(blockout.start_time).toDate();
    const blockoutEnd = moment.utc(blockout.end_time).toDate();

    // Check for overlap
    return blockoutStart < requestEnd && blockoutEnd > requestStart;
  });

  return {
    available: conflictingBlockouts.length === 0,
    conflictingBlockouts,
  };
};
