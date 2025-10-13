import { RRule } from "rrule";
import { z } from "zod";

// RRule options type that matches the rrule package structure
// export interface RRuleOptions {
//   freq:
//     | typeof RRule.DAILY
//     | typeof RRule.WEEKLY
//     | typeof RRule.MONTHLY
//     | typeof RRule.YEARLY;
//   dtstart: Date;
//   interval: number;
//   byweekday?: number | Weekday | (number | Weekday)[];
//   bymonthday?: number | number[];
//   bymonth?: number | number[];
//   count?: number;
//   until?: Date;
// }

// Zod schema for RRule options validation
const rruleOptionsSchema = z
  .object({
    freq: z.union([
      z.literal(RRule.DAILY),
      z.literal(RRule.WEEKLY),
      z.literal(RRule.MONTHLY),
      z.literal(RRule.YEARLY),
    ]),
    dtstart: z.date(),
    interval: z.number().int().positive(),
    byweekday: z.union([z.number(), z.array(z.number())]).optional(),
    bymonthday: z.union([z.number(), z.array(z.number())]).optional(),
    bymonth: z.union([z.number(), z.array(z.number())]).optional(),
    count: z.number().int().positive().optional(),
    until: z.date().optional(),
  })
  .refine(
    (data) => {
      // Must have either count or until, but not both
      return (data.count !== undefined) !== (data.until !== undefined);
    },
    {
      message: "Must specify either 'count' or 'until', but not both",
      path: ["count"],
    }
  )
  .refine(
    (data) => {
      // If freq is WEEKLY, byweekday is required
      if (data.freq === RRule.WEEKLY) {
        return data.byweekday !== undefined;
      }
      return true;
    },
    {
      message: "byweekday is required when frequency is WEEKLY",
      path: ["byweekday"],
    }
  )
  .refine(
    (data) => {
      // If freq is MONTHLY or YEARLY, bymonthday is required
      if (data.freq === RRule.MONTHLY || data.freq === RRule.YEARLY) {
        return data.bymonthday !== undefined;
      }
      return true;
    },
    {
      message: "bymonthday is required when frequency is MONTHLY or YEARLY",
      path: ["bymonthday"],
    }
  )
  .refine(
    (data) => {
      // If freq is YEARLY, bymonth is required
      if (data.freq === RRule.YEARLY) {
        return data.bymonth !== undefined;
      }
      return true;
    },
    {
      message: "bymonth is required when frequency is YEARLY",
      path: ["bymonth"],
    }
  );

// Base schema for common blockout fields
const baseBlockoutSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// Schema for time validation
const timeSchemaBase = z.object({
  start_time: z.string().datetime("Invalid start time format"),
  end_time: z.string().datetime("Invalid end time format"),
  timezone: z.string().min(1, "Timezone is required"),
  is_all_day: z.boolean().optional().default(false),
});

// Schema for recurrence validation
const recurrenceSchemaBase = z.object({
  rrule: rruleOptionsSchema.nullable().optional(),
});

// Complete schema for creating a blockout
export const createBlockoutSchema = baseBlockoutSchema
  .merge(timeSchemaBase)
  .merge(recurrenceSchemaBase)
  .refine((data) => new Date(data.start_time) < new Date(data.end_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

// Schema for updating a blockout (all fields optional except validation rules)
export const updateBlockoutSchema = baseBlockoutSchema
  .partial()
  .merge(timeSchemaBase.partial())
  .merge(recurrenceSchemaBase.partial())
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return new Date(data.start_time) < new Date(data.end_time);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

// Schema for date range queries
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

// Schema for availability check
export const availabilityCheckSchema = z
  .object({
    talentId: z.string().uuid("Invalid talent ID"),
    startTime: z.string().datetime("Invalid start time format"),
    endTime: z.string().datetime("Invalid end time format"),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

// Export RRULE validation schema
export const rruleSchema = rruleOptionsSchema;

// Schema for recurring pattern creation helper
export const recurrencePatternSchema = z
  .object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().min(1).max(999).optional(),
    byWeekDay: z.array(z.number().min(0).max(6)).optional(),
    until: z.string().datetime().optional(),
    count: z.number().min(1).max(1000).optional(),
  })
  .refine(
    (data) => {
      // Either until or count, not both
      return !(data.until && data.count);
    },
    {
      message: "Cannot specify both 'until' and 'count' for recurrence",
    }
  );

// Types inferred from schemas
export type RRuleOptions = z.infer<typeof rruleOptionsSchema>;
export type CreateBlockoutInput = z.infer<typeof createBlockoutSchema>;
export type CreateBlockoutSchemaType = z.infer<typeof createBlockoutSchema>;
export type UpdateBlockoutInput = z.infer<typeof updateBlockoutSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type RecurrencePatternInput = z.infer<typeof recurrencePatternSchema>;

// Helper function to validate RRULE options
export const validateRRule = (rrule: RRuleOptions): boolean => {
  try {
    rruleSchema.parse(rrule);
    return true;
  } catch {
    return false;
  }
};

// Helper function to convert RRuleOptions to RRule instance
export const createRRuleFromOptions = (options: RRuleOptions): RRule => {
  return new RRule(options as any);
};

// Helper function to convert RRule instance to RRuleOptions
export const getRRuleOptions = (rule: RRule): RRuleOptions => {
  const opts = rule.options;
  return {
    freq: opts.freq,
    dtstart: opts.dtstart!,
    interval: opts.interval ?? 1,
    byweekday: opts.byweekday as number | number[] | undefined,
    bymonthday: opts.bymonthday as number | number[] | undefined,
    bymonth: opts.bymonth as number | number[] | undefined,
    count: opts.count ?? undefined,
    until: opts.until ?? undefined,
  };
};

// Helper function to create form-friendly default values
export const getDefaultBlockoutValues = (): Partial<CreateBlockoutInput> => ({
  title: "",
  description: "",
  is_all_day: false,
});

// Helper function to format dates for form inputs
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format for datetime-local input
};

// Helper function to format dates for all-day events
export const formatAllDayDate = (
  date: Date,
  timezone: string = "UTC"
): { start_time: string; end_time: string } => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  };
};
