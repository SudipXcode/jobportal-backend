import { z } from 'zod';

export const jobseekerProfileSchema = z.object({
    location: z
        .string()
        .min(2, { message: "Location must be at least 2 characters long" }),

    mobileNumber: z
        .string()
        .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" }),

    dob: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        })
        .transform((val) => new Date(val)),

    gender: z
        .string()
        .refine(
            (val) => ["Male", "Female", "Others"].includes(val),
            { message: "Gender must be Male, Female, or Others" }
        ),
})

export const jobseekerSkillsSchema = z.array(
    z.number().int().positive()
);

// Education schema
export const jobseekerEducationSchema =
    z.object({
        education: z.string().min(1, "Education is required"),
        course: z.string().min(1, "Course is required"),
    })
    ;

// Combined details schema
export const jobseekerDetailsSchema = z.object({
    skills: jobseekerSkillsSchema,
    jobseekerEducation: z.array(jobseekerEducationSchema).nonempty("At least one education entry is required")
});

export const jobpreferencesSchema = z.object({
    industry: z.array(z.number().int().positive())
})

export const reportIssueSchema = z.object({
    issue: z
        .string()
        .min(5, "Issue description must be at least 5 characters long")
        .max(500, "Issue description must be less than 500 characters"),
    companyId: z
        .number()
        .int("Company ID must be an integer")
        .positive("Company ID must be a positive number")
})