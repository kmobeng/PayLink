import { Request, Response, NextFunction } from "express";
import {
  createInvoiceSchema,
  InvoiceParamIdSchema,
  updateDraftInvoiceSchema,
} from "../validators/invoice.validator";
import { createError } from "../utils/createError.util";
import {
  createInvoiceService,
  getInvoicesService,
  getInvoiceByIdService,
  updateDraftInvoiceByIdService,
  deleteInvoiceByIdService,
} from "../services/invoice.service";

export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { clientId, dueDate, items } = parsed.data;

    const result = await createInvoiceService(
      req.user?.id as string,
      clientId,
      dueDate,
      items,
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const invoices = await getInvoicesService(userId);

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = InvoiceParamIdSchema.safeParse(req.params);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const result = await getInvoiceByIdService(
      req.user?.id as string,
      parsed.data.invoiceId,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateDraftInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updateDraftInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const paramParsed = InvoiceParamIdSchema.safeParse(req.params);
    if (!paramParsed.success) {
      const errorMessages = paramParsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { clientId, dueDate, items } = parsed.data;

    const result = await updateDraftInvoiceByIdService(
      req.user?.id as string,
      paramParsed.data.invoiceId,
      clientId,
      dueDate,
      items,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramParsed = InvoiceParamIdSchema.safeParse(req.params);

    if (!paramParsed.success) {
      const errorMessages = paramParsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    await deleteInvoiceByIdService(
      req.user?.id as string,
      paramParsed.data.invoiceId,
    );

    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
