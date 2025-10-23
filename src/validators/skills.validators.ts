import { z } from "zod";

export const skillSumarySchema = z.object({
  summary: z
    .string()
    .min(1, "Please provide a summary")
    .max(500, "Summary must be 500 characters or less"),
});
export type SkillSummarySchemaType = z.infer<typeof skillSumarySchema>;

export const skillExperienceSchema = z.object({
  years_of_experience: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(1, "Years of experience must be 1 or greater")
    .max(50, "Years of experience must be 50 or less"),
});
export type SkillExperienceSchemaType = z.infer<typeof skillExperienceSchema>;

export const skillHourlyRateSchema = z.object({
  hourly_rate: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(1, "Hourly rate must be 1 or greater")
    .max(1000, "Hourly rate must be 1000 or less"),
});
export type SkillHourlyRateSchemaType = z.infer<typeof skillHourlyRateSchema>;

export const skillExperienceRateSchema = z.object({
  years_of_experience: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(1, "Years of experience must be 1 or greater")
    .max(50, "Years of experience must be 50 or less")
    .optional(),
  hourly_rate: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .min(1, "Hourly rate must be 1 or greater")
    .max(1000, "Hourly rate must be 1000 or less")
    .optional(),
});
export type SkillExperienceRateSchemaType = z.infer<
  typeof skillExperienceRateSchema
>;

export const skillYoutubeUrlSchema = z.object({
  youtube_url: z
    .string()
    .optional()
    .refine((url) => {
      if (!url) return true;
      try {
        new URL(url);
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
      } catch {
        return false;
      }
    }, "Please enter a valid YouTube URL"),
});
export type SkillYoutubeUrlSchemaType = z.infer<typeof skillYoutubeUrlSchema>;

export const skillImageUrlsSchema = z.object({
  image_urls: z
    .array(z.string())
    .nonempty("Please upload at least one image")
    .max(5, "You can only add up to 5 images"),
});
export type SkillImageUrlsSchemaType = z.infer<typeof skillImageUrlsSchema>;

export const createSkillSchema = z
  .object({
    skill_id: z.number({
      required_error: "Please select a skill",
    }),
  })
  .merge(skillSumarySchema)
  .merge(skillExperienceSchema)
  .merge(skillHourlyRateSchema)
  .merge(skillYoutubeUrlSchema)
  .merge(skillImageUrlsSchema);
export type CreateSkillSchemaType = z.infer<typeof createSkillSchema>;
