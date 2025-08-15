import { z } from 'zod';

export const adminRegisterSchema = z.object({
    email: z.email("invalid email format"),  // ✅ new style
    role: z.string().trim().min(1, "Role is required")
        .refine(val => val === "superadmin" || val === "moderator", {
            message: "Role must be either superadmin or moderator"
        }),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Password doesn't match"
});

export const adminLoginSchema = z.object({
    email: z.email("invalid email format"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),

})

export const forgetpasswordSchema = z.object({
    email: z.email("invalid email format"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Password doesn't match"
});

export const changePasswordSchema = z.object({
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Password doesn't match"
});



export const suspendUserSchema = z.object({
    email: z.email("invalid email format")
})
export const industriesSchema = z.object({
    industries: z
        .array(z.string().trim().min(3, "Each industry must be at least 3 characters"))
        .min(1, "At least one industry is required")
});


export const skillsSchema = z.object({
    skills: z.array(
        z.string().trim().min(3, "Each skills must be at least 3 characters")
    ).min(1, "At least one skills is required")
})
export const deleteJobSchema=z.object({
    jobId: z.number({
        required_error: "Job ID is required",
        invalid_type_error: "Job ID must be a number",
    }).int().positive(),
   
})