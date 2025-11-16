import { z } from "zod";

export const profileNameSchema = z.object({
  first_name: z
    .string()
    .min(1, "Please enter your first name")
    .max(50, "First name must be 50 characters or less"),
  last_name: z
    .string()
    .min(1, "Please enter your last name")
    .max(50, "Last name must be 50 characters or less"),
});
export type ProfileNameSchemaType = z.infer<typeof profileNameSchema>;

export const profileBioSchema = z.object({
  bio: z
    .string()
    .min(1, "Please enter your bio")
    .max(1500, "Bio must be 1500 characters or less"),
});
export type ProfileBioSchemaType = z.infer<typeof profileBioSchema>;

export const profileLocationSchema = z.object({
  city: z
    .string()
    .min(1, "Please enter your city")
    .max(50, "City must be 50 characters or less"),
  state: z
    .string()
    .length(2, "State must be a 2-letter code")
    .toUpperCase()
    .refine(
      (val) =>
        [
          "AL",
          "AK",
          "AZ",
          "AR",
          "CA",
          "CO",
          "CT",
          "DE",
          "FL",
          "GA",
          "HI",
          "ID",
          "IL",
          "IN",
          "IA",
          "KS",
          "KY",
          "LA",
          "ME",
          "MD",
          "MA",
          "MI",
          "MN",
          "MS",
          "MO",
          "MT",
          "NE",
          "NV",
          "NH",
          "NJ",
          "NM",
          "NY",
          "NC",
          "ND",
          "OH",
          "OK",
          "OR",
          "PA",
          "RI",
          "SC",
          "SD",
          "TN",
          "TX",
          "UT",
          "VT",
          "VA",
          "WA",
          "WV",
          "WI",
          "WY",
        ].includes(val),
      "Must be a valid US state code"
    ),
});
export type ProfileLocationSchemaType = z.infer<typeof profileLocationSchema>;

export const profileContactSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must be 100 characters or less"),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Allow empty values
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
      return phoneRegex.test(val);
    }, "Please enter a valid phone number"),
});
export type ProfileContactSchemaType = z.infer<typeof profileContactSchema>;
