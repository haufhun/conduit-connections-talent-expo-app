import { convertToRRuleOptions } from "@/utils/recurring-schedule";
import { RRule, Options as RRuleOptions } from "rrule";
import { z } from "zod";

// Zod schema for RecurringScheduleOptions validation
const recurringScheduleOptionsSchema = z
  .object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().positive(),
    weekdays: z
      .array(
        z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ])
      )
      .default([]),
    monthlyType: z.enum(["DAY_OF_MONTH", "DAY_OF_WEEK"]),
    dayOfMonth: z.number().int().min(1).max(31),
    weekOfMonth: z.number().int().min(-1).max(4),
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    endType: z.enum(["NEVER", "ON_DATE", "AFTER_OCCURRENCES"]),
    endDate: z.date().optional(),
    occurrences: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // If endType is ON_DATE, endDate is required
      if (data.endType === "ON_DATE") {
        return data.endDate !== undefined;
      }
      return true;
    },
    {
      message: "End date is required when end type is ON_DATE",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If endType is AFTER_OCCURRENCES, occurrences is required
      if (data.endType === "AFTER_OCCURRENCES") {
        return data.occurrences !== undefined && data.occurrences > 0;
      }
      return true;
    },
    {
      message:
        "Number of occurrences is required when end type is AFTER_OCCURRENCES",
      path: ["occurrences"],
    }
  )
  .refine(
    (data) => {
      // If frequency is WEEKLY, at least one weekday should be selected
      if (data.frequency === "WEEKLY") {
        return data.weekdays.length > 0;
      }
      return true;
    },
    {
      message: "At least one weekday must be selected for weekly recurrence",
      path: ["weekdays"],
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
    .nullable()
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
  recurringSchedule: recurringScheduleOptionsSchema.nullable().optional(),
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

// Types inferred from schemas
export type RecurringScheduleOptions = z.infer<
  typeof recurringScheduleOptionsSchema
>;
export type CreateBlockoutInput = z.infer<typeof createBlockoutSchema>;
export type CreateBlockoutSchemaType = z.infer<typeof createBlockoutSchema>;
export type UpdateBlockoutInput = z.infer<typeof updateBlockoutSchema>;

// Re-export RRuleOptions from rrule package for convenience
export type { RRuleOptions };

// Helper function to convert RecurringScheduleOptions to RRule string
export const createRRuleStringFromRecurringSchedule = (
  options: RecurringScheduleOptions,
  startDate: Date
): string => {
  const rruleOptions = convertToRRuleOptions(options, startDate);
  // Cast to any due to type incompatibility between library version and actual usage
  // The RRule constructor accepts Partial<Options> but types may not reflect this correctly
  const rule = new RRule(rruleOptions as any);
  return rule.toString();
};

// Alias for consistency
export const convertRecurringScheduleToRRule =
  createRRuleStringFromRecurringSchedule;
