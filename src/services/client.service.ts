import { prisma } from "../config/prisma";
import { createError } from "../utils/createError.util";

export const addClientService = async (
  name: string,
  email: string,
  phone: string,
  userId: string,
) => {
  try {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        businessId: userId,
      },
    });

    return client;
  } catch (error) {
    throw error;
  }
};

export const getClientsService = async (userId: string, name?: string) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        businessId: userId,
        ...(name ? { name: { contains: name } } : {}),
      },
    });

    if (!clients) {
      throw createError("No clients found", 404);
    }

    return clients;
  } catch (error) {
    throw error;
  }
};

export const getClientByIdService = async (
  clientId: string,
  userId: string,
) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: clientId, businessId: userId },
    });

    if (!client) {
      throw createError("Client not found", 404);
    }

    return client;
  } catch (error) {
    throw error;
  }
};

export const updateClientService = async (
  clientId: string,
  userId: string,
  name?: string,
  email?: string,
  phone?: string,
) => {
  try {
    const findClient = await prisma.client.findFirst({
      where: { id: clientId, businessId: userId },
    });

    if (!findClient) {
      throw createError("Client not found", 404);
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        name: name ?? findClient.name,
        email: email ?? findClient.email,
        phone: phone ?? findClient.phone,
      },
    });

    return updatedClient;
  } catch (error) {
    throw error;
  }
};

export const deleteClientService = async (clientId: string, userId: string) => {
  try {
    const findClient = await prisma.client.findFirst({
      where: { id: clientId, businessId: userId },
    });

    if (!findClient) {
      throw createError("Client not found", 404);
    }

    await prisma.client.delete({
      where: { id: clientId },
    });
  } catch (error) {
    throw error;
  }
};
