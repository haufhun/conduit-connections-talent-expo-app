// Types for talent blockouts

/**
 * Business Rules for Blockout Editing:
 * - Blockouts can only be edited if their end_time is in the future
 * - Past blockouts (where end_time <= current time) are read-only
 * - This ensures data integrity for completed time periods
 */

export type TalentBlockoutDatabase = {
  blockout_id: number;
  end_time: string;
  is_all_day: boolean;
  start_time: string;
  title: string;
  description: string | null;
  is_recurring: boolean;
  rrule: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type TalentExpandedBlockout = {
  blockout_id: number;
  end_time: string;
  is_all_day: boolean;
  start_time: string;
  title: string;
  original_blockout: TalentBlockoutDatabase;
};

// For creating new blockouts
export type CreateTalentBlockout = {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  timezone?: string;
  is_recurring?: boolean;
  rrule?: string;
  metadata?: Record<string, any>;
};

// For updating existing blockouts
export type UpdateTalentBlockout = Partial<CreateTalentBlockout> & {
  is_active?: boolean;
};

// Helper types for working with blockouts
export type BlockoutType = "single" | "recurring";

// RRULE helpers for common patterns
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type RecurrencePattern = {
  frequency: RecurrenceFrequency;
  interval?: number;
  byWeekDay?: number[]; // 0=Sunday, 1=Monday, etc.
  until?: string; // End date in ISO format
  count?: number; // Number of occurrences
};

// Utility functions for working with RRULE strings
export const createRRuleString = (pattern: RecurrencePattern): string => {
  let rrule = `FREQ=${pattern.frequency}`;

  if (pattern.interval && pattern.interval > 1) {
    rrule += `;INTERVAL=${pattern.interval}`;
  }

  if (pattern.byWeekDay && pattern.byWeekDay.length > 0) {
    const days = pattern.byWeekDay
      .map((day) => {
        const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
        return dayNames[day];
      })
      .join(",");
    rrule += `;BYDAY=${days}`;
  }

  if (pattern.until) {
    // Convert ISO date to RRULE format (YYYYMMDDTHHMMSSZ)
    const date = new Date(pattern.until);
    const rruleDate = date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    rrule += `;UNTIL=${rruleDate}`;
  }

  if (pattern.count) {
    rrule += `;COUNT=${pattern.count}`;
  }

  return rrule;
};

// Parse RRULE string back to pattern object
export const parseRRuleString = (rrule: string): RecurrencePattern | null => {
  if (!rrule) return null;

  const pattern: RecurrencePattern = {
    frequency: "DAILY", // default
  };

  const parts = rrule.split(";");

  for (const part of parts) {
    const [key, value] = part.split("=");

    switch (key) {
      case "FREQ":
        pattern.frequency = value as RecurrenceFrequency;
        break;
      case "INTERVAL":
        pattern.interval = parseInt(value);
        break;
      case "BYDAY":
        const dayMap: Record<string, number> = {
          SU: 0,
          MO: 1,
          TU: 2,
          WE: 3,
          TH: 4,
          FR: 5,
          SA: 6,
        };
        pattern.byWeekDay = value
          .split(",")
          .map((day) => dayMap[day])
          .filter((d) => d !== undefined);
        break;
      case "UNTIL":
        // Convert RRULE date format back to ISO
        const year = value.slice(0, 4);
        const month = value.slice(4, 6);
        const day = value.slice(6, 8);
        pattern.until = `${year}-${month}-${day}`;
        break;
      case "COUNT":
        pattern.count = parseInt(value);
        break;
    }
  }

  return pattern;
};

// Common RRULE patterns
export const COMMON_RRULES = {
  DAILY: "FREQ=DAILY",
  WEEKLY: "FREQ=WEEKLY",
  WEEKDAYS: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  WEEKENDS: "FREQ=WEEKLY;BYDAY=SA,SU",
  MONTHLY: "FREQ=MONTHLY",
  YEARLY: "FREQ=YEARLY",
} as const;
