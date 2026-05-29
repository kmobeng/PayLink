import { prisma } from "../config/prisma";
import { createError } from "../utils/createError.util";

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export const createInvoiceService = async (
  businessId: string,
  clientId: string,
  dueDate: Date,
  items: InvoiceItem[],
) => {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        businessId,
        clientId,
        dueDate,
        items: {
            create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      },
    });

    return invoice;
  } catch (error) {
    throw error;
  }
};

export const getInvoicesService = async (userId: string) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        businessId: userId,
      },
      include: {
        items: true,
      },
    });

    if (!invoices || invoices.length === 0) {
      throw createError("No invoices found for this user", 404);
    }

    return invoices;
  } catch (error) {
    throw error;
  }
};

export const getInvoiceByIdService = async (
  userId: string,
  invoiceId: string,
) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        businessId: userId,
        id: invoiceId,
      },
    });

    if (!invoices || invoices.length === 0) {
      throw createError("Invoice not found", 404);
    }

    return invoices
  } catch (error) {
    throw error;
  }
};


export const updateDraftInvoiceByIdService = async (userId: string,invoiceId: string, clientId?: string, dueDate?: Date, items?: InvoiceItem[])=>{
    try{
        const findInvoice = await prisma.invoice.findFirst({
            where:{
                businessId: userId,
                id: invoiceId,
            },
            include:{
                items: true
            }
        });

        if(!findInvoice){
            throw createError("Draft invoice not found", 404);
        }

        if(findInvoice.status !== "DRAFT"){
            throw createError("Only draft invoices can be updated", 400);
        }

        const updatedInvoice = await prisma.invoice.update({
            where:{
                id: invoiceId
            },
            data:{
                clientId: clientId ?? findInvoice.clientId,
                dueDate: dueDate ?? findInvoice.dueDate,
                items: {
                    deleteMany: {},
                    create: items?.map((item) => ({
                      description: item.description,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      totalPrice: Number(item.quantity) * Number(item.unitPrice),
                    })) ?? findInvoice.items.map((item) => ({
                      description: item.description,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      totalPrice: Number((item as any).quantity) * Number((item as any).unitPrice),
                    }))
                }
            }
        });

        return updatedInvoice;
    }catch(error){
        throw error
    }
}

export const deleteInvoiceByIdService = async (userId: string, invoiceId: string) => {
    try {
      const findInvoice = await prisma.invoice.findFirst({  
        where: {
          businessId: userId,
          id: invoiceId,
        },
      });

        if (!findInvoice) {
            throw createError("Invoice not found", 404);
        }


        await prisma.invoice.delete({
            where: {
                id: invoiceId,
            },
        });
    } catch (error) {
        throw error;
    }
};
