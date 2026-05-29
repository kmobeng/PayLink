import { Request, Response, NextFunction } from "express";
import {
  addClientSchema,
  getClientByIdSchema,
  updateClientSchema,
} from "../validators/client.validator";
import { createError } from "../utils/createError.util";
import {
  addClientService,
  deleteClientService,
  getClientByIdService,
  getClientsService,
  updateClientService,
} from "../services/client.service";

export const addClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = addClientSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { name, email, phone } = parsed.data;

    const result = await addClientService(name, email, phone, req.user?.id!);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getClientsService(req.user?.id!);

    res.status(200).json({ success: true,result: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = getClientByIdSchema.safeParse(req.params);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { id } = parsed.data;

    const result = await getClientByIdService(id, req.user?.id!);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedId = getClientByIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      const errorMessages = parsedId.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { id } = parsedId.data;

    const parsed = updateClientSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { name, email, phone } = parsed.data;

    const result = await updateClientService(
      id,
      req.user?.id!,
      name,
      email,
      phone,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = getClientByIdSchema.safeParse(req.params);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((err: any) => err.message)
        .join(", ");
      throw createError(errorMessages, 400);
    }

    const { id } = parsed.data;

    await deleteClientService(id, req.user?.id!);

    res
      .status(200)
      .json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
};
