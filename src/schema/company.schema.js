import { z } from 'zod';

export const companyProfileSchema = z.object({
  about: z.string().min(1, "About is required"),
  companyType: z
    .string()
    .min(1, "Company type is required")
    .refine(val => val === "private" || val === "public" || val === "NGO", {
      message: "companyType must be either private, NGO or public"
    }),
  founded: z.string().min(1, "Founded year is required"),
  companySize: z.string().min(1, "Company size is required"),
  website: z.url("Website must be a valid URL"),
  bio: z.string().optional(),
});