import { z } from 'zod';


export const jobSchema = z.object({
    title: z.string({
        required_error: "Job title is required",
        invalid_type_error: "Title must be a string",
    }).min(3, "Title must be at least 3 characters long"),

    location: z.string({
        required_error: "Location is required",
        invalid_type_error: "Location must be a string",
    }).min(2, "Location must be at least 2 characters"),

    salary: z.string({
        required_error: "Salary is required",
        invalid_type_error: "Salary must be a string",
    }).min(1, "Salary cannot be empty"),

    role: z.string({
        required_error: "Role is required",
        invalid_type_error: "Role must be a string",
    }).min(2, "Role must be at least 2 characters"),

    employmentType: z.string({
        required_error: "Employment type is required",
        invalid_type_error: "Employment type must be a string",
    }).min(2, "Employment type must be at least 2 characters"),

    desc: z.string({
        required_error: "Job description is required",
        invalid_type_error: "Description must be a string",
    }).min(10, "Description must be at least 10 characters"),

    industryId: z.array(
        z.number({
            required_error: "industries ID is required",
            invalid_type_error: "insdutries ID must be a number"
        }).int("industries ID must be an integer")
    ).min(1, "At least one industries ID is required"),

    jobResponsiblities: z.array(
        z.string().min(3, "Each responsibility must be at least 3 characters long")
    ).min(1, "At least one job responsibility is required"),

    jobQualifications: z.array(
        z.string().min(3, "Each qualification must be at least 3 characters long")
    ).min(1, "At least one job qualification is required"),

    skillsId: z.array(
        z.number({
            required_error: "Skill ID is required",
            invalid_type_error: "Skill ID must be a number"
        }).int("Skill ID must be an integer")
    ).min(1, "At least one skill ID is required"),

});
