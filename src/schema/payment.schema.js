import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  premiumType: z.enum(["free", "trending", "standered"], {
    required_error: "Premium type is required",
    invalid_type_error: "Premium type must be one of: free, trending, or standered",
  }),
  currency: z.string().min(1, "Currency is required"), // e.g., 'usd'
  paymentMethodType: z.enum(['card', 'bank_transfer', 'cashapp', 'paypal']).optional(), // based on Stripe docs
  customerEmail: z.email("Invalid email"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().min(1).default(1),
  successUrl: z.url("Success URL is required"),
  cancelUrl: z.url("Cancel URL is required"),
});