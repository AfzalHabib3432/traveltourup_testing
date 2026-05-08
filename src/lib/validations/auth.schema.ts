import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  redirect_to: z.string().url().optional(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  redirect_to: z.string().url().optional(),
});

/** @deprecated Use `loginSchema` */
export const signInFormSchema = loginSchema;
/** @deprecated Use `signupSchema` */
export const signUpFormSchema = signupSchema;
