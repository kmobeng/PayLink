import { z } from "zod";

export const createInvoiceSchema = z.object({
  clientId: z.uuid("Invalid client ID"),
  dueDate: z.coerce
    .date("Invalid due date")
    .refine((date) => date > new Date(), {
      message: "Due date must be in the future",
    }),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().positive("Quantity must be greater than zero"),
        unitPrice: z.number().positive("Unit price must be greater than zero"),
      }),
    )
    .min(1, "At least one item is required"),
});

export const InvoiceParamIdSchema = z.object({
  invoiceId: z.uuid("Invalid Invoice Id"),
});

export const updateDraftInvoiceSchema = createInvoiceSchema.partial();

export const getInvoicesQuerySchema = z.object({
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(["DRAFT", "SENT", "PAID"]))
    .optional(),
});
