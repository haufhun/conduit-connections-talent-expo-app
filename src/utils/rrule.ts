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

/**
 * Expands recurring blockouts into individual occurrences within a date range
 */
export const expandRecurringBlockouts = (
  blockouts: any[],
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
        // blockout.rrule is now an RRuleOptions object

        const rule = RRule.fromString(blockout.rrule);

        const originalStart = moment.utc(blockout.start_time).toDate();
        const originalEnd = moment.utc(blockout.end_time).toDate();
        const duration = originalEnd.getTime() - originalStart.getTime();

        // Get occurrences within our date range (with some buffer)
        const occurrences = rule.between(
          moment.utc(rangeStart.getTime() - duration).toDate(),
          moment.utc(rangeEnd.getTime() + duration).toDate(),
          true
        );

        occurrences.forEach((occurrence) => {
          const occurrenceEnd = moment
            .utc(occurrence.getTime() + duration)
            .toDate();

          // Check if this occurrence overlaps with our range
          if (occurrence < rangeEnd && occurrenceEnd > rangeStart) {
            expandedBlockouts.push({
              blockout_id: blockout.blockout_id,
              title: blockout.title,
              start_time: occurrence.toISOString(),
              end_time: occurrenceEnd.toISOString(),
              is_all_day: blockout.is_all_day,
              original_blockout: blockout,
            });
          }
        });
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
