import { z } from "zod";

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
  timezone: z.string().optional().default("UTC"),
  metadata: z.record(z.any()).optional().default({}),
});

// Schema for time validation
const timeSchemaBase = z.object({
  start_time: z.string().datetime("Invalid start time format"),
  end_time: z.string().datetime("Invalid end time format"),
  is_all_day: z.boolean().optional().default(false),
});

// Schema for recurrence validation
const recurrenceSchemaBase = z.object({
  is_recurring: z.boolean().optional().default(false),
  rrule: z.string().optional(),
});

// Complete schema for creating a blockout
export const createBlockoutSchema = baseBlockoutSchema
  .merge(timeSchemaBase)
  .merge(recurrenceSchemaBase)
  .refine((data) => new Date(data.start_time) < new Date(data.end_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  })
  .refine((data) => !data.is_recurring || (data.is_recurring && data.rrule), {
    message: "RRULE is required for recurring blockouts",
    path: ["rrule"],
  });

// Schema for updating a blockout (all fields optional except validation rules)
export const updateBlockoutSchema = baseBlockoutSchema
  .partial()
  .merge(timeSchemaBase.partial())
  .merge(recurrenceSchemaBase.partial())
  .merge(
    z.object({
      is_active: z.boolean().optional(),
    })
  )
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
  )
  .refine(
    (data) => {
      if (data.is_recurring !== undefined) {
        return !data.is_recurring || (data.is_recurring && data.rrule);
      }
      return true;
    },
    {
      message: "RRULE is required for recurring blockouts",
      path: ["rrule"],
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

// RRULE validation schema
export const rruleSchema = z.string().refine(
  (rrule) => {
    // Basic RRULE validation - starts with FREQ=
    return rrule.startsWith("FREQ=");
  },
  {
    message: "Invalid RRULE format. Must start with FREQ=",
  }
);

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
export type CreateBlockoutInput = z.infer<typeof createBlockoutSchema>;
export type CreateBlockoutSchemaType = z.infer<typeof createBlockoutSchema>;
export type UpdateBlockoutInput = z.infer<typeof updateBlockoutSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type RecurrencePatternInput = z.infer<typeof recurrencePatternSchema>;

// Helper function to validate RRULE strings
export const validateRRule = (rrule: string): boolean => {
  try {
    rruleSchema.parse(rrule);
    return true;
  } catch {
    return false;
  }
};

// Helper function to create form-friendly default values
export const getDefaultBlockoutValues = (): Partial<CreateBlockoutInput> => ({
  title: "",
  description: "",
  is_all_day: false,
  is_recurring: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  metadata: {},
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
