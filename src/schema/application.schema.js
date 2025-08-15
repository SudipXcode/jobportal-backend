import { z } from 'zod';

export const applicationSchema = z.object({
    jobId: z.number({
        required_error: "Job ID is required",
        invalid_type_error: "Job ID must be a number",
    }).int().positive(),

    jobseekerProfileId: z.number({
        required_error: "Jobseeker ID is required",
        invalid_type_error: "Jobseeker ID must be a number",
    }).int().positive(),

    status: z.enum(['pending', 'accepted', 'rejected'], {
        required_error: "Status is required",
        invalid_type_error: "Status must be one of: pending, accepted, rejected"
    }),
});

export const interviewSchema = z.object({
    applicationId: z.number({
        required_error: "application ID is required",
        invalid_type_error: "application ID must be a number",
    }).int().positive(),
    location: z
        .string()
        .min(2, { message: "Location must be at least 2 characters long" }),
    dateSchedule: z.date({
        required_error: "Expiry time is required",
        invalid_type_error: "Expiry time must be a valid date",
    }),
})

export const applicationUpdateSchema = z.object({
    status: z.enum(['pending', 'accepted', 'rejected'], {
        required_error: "Status is required",
        invalid_type_error: "Status must be one of: pending, accepted, rejected"
    })
})