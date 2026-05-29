import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const addClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().refine(isValidPhoneNumber, "Invalid phone number"),
});

export const getClientByIdSchema = z.object({
  id: z.uuid("Invalid client ID"),
});

export const updateClientSchema = addClientSchema.partial();

export const getClientQuerySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});
