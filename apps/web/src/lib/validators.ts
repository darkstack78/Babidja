import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// min(8) aligné sur RegisterEmailDto côté backend (apps/api/src/auth/dto/register-email.dto.ts)
export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est trop court'),
  lastName: z.string().min(2, 'Le nom est trop court'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
