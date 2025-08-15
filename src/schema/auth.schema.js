import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, "name is required"),
  email: z.email("invalid email format"),  // ✅ new style
  role: z.string().trim().min(1, "Role is required")
    .refine(val => val === "company" || val === "jobseeker", {
      message: "Role must be either company or jobseeker"
    }),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Password doesn't match"
});

export const otpSchema = z.object({
  email: z.email("invalid email format")  // ✅
});

export const verifyEmailSchema = z.object({
  email: z.email("invalid email format"),  // ✅
  otp: z.string().trim().min(6, "otp must be 6 digit")
});

export const loginSchema = z.object({
  email: z.email("invalid email format"), 
  password: z.string().trim().min(6, "Password must be at least 6 characters"),

})
export const forgetPasswordSchema = z.object({
  email: z.email("invalid email format"), 
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Password doesn't match"
});

export const changePasswordSchema=z.object({
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().trim()
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Password doesn't match"
});