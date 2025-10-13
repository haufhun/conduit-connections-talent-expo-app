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
      const blockoutStart = new Date(blockout.start_time);
      const blockoutEnd = new Date(blockout.end_time);

      if (blockoutStart < rangeEnd && blockoutEnd > rangeStart) {
        console.log("Adding non-recurring blockout:", blockout.blockout_id);
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
        console.log("Expanding RRULE:", JSON.stringify(rule));

        const originalStart = new Date(blockout.start_time);
        const originalEnd = new Date(blockout.end_time);
        const duration = originalEnd.getTime() - originalStart.getTime();

        console.log("start and end:", originalStart, originalEnd);

        // Get occurrences within our date range (with some buffer)
        const occurrences = rule.between(
          new Date(rangeStart.getTime() - duration),
          new Date(rangeEnd.getTime() + duration),
          true
        );

        console.log(
          "Occurrences for blockout",
          blockout.blockout_id,
          occurrences
        );

        occurrences.forEach((occurrence) => {
          const occurrenceEnd = new Date(occurrence.getTime() + duration);

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

  return expandedBlockouts;
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
    const blockoutStart = new Date(blockout.start_time);
    const blockoutEnd = new Date(blockout.end_time);

    // Check for overlap
    return blockoutStart < requestEnd && blockoutEnd > requestStart;
  });

  return {
    available: conflictingBlockouts.length === 0,
    conflictingBlockouts,
  };
};
