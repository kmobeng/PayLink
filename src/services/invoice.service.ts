import { prisma } from "../config/prisma";
import { InvoiceStatus } from "../generated/prisma/enums";
import { readFile } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { createError } from "../utils/createError.util";
import sendEmail from "../utils/email.util";
import logger from "../config/winston.config";

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
    const lastInvoice = await prisma.invoice.findFirst({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    const lastNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber?.split("-")[1] ?? "0")
      : 0;

    const invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        businessId,
        clientId,
        dueDate,
        invoiceNumber,
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

export const getInvoicesService = async (
  userId: string,
  status?: InvoiceStatus,
) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        businessId: userId,
        ...(status && { status }),
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

export const getInvoicesByClientIdService = async (
  userId: string,
  clientId: string,
) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        businessId: userId,
        clientId: clientId,
      },
      include: {
        items: true,
      },
    });

    if (!invoices || invoices.length === 0) {
      throw createError("No invoices found for this client", 404);
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
      include: {
        items: true,
      },
    });

    if (!invoices || invoices.length === 0) {
      throw createError("Invoice not found", 404);
    }

    return invoices;
  } catch (error) {
    throw error;
  }
};

export const updateDraftInvoiceByIdService = async (
  userId: string,
  invoiceId: string,
  clientId?: string,
  dueDate?: Date,
  items?: InvoiceItem[],
) => {
  try {
    const findInvoice = await prisma.invoice.findFirst({
      where: {
        businessId: userId,
        id: invoiceId,
      },
      include: {
        items: true,
      },
    });

    if (!findInvoice) {
      throw createError("Draft invoice not found", 404);
    }

    if (findInvoice.status !== "DRAFT") {
      throw createError("Only draft invoices can be updated", 400);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        clientId: clientId ?? findInvoice.clientId,
        dueDate: dueDate ?? findInvoice.dueDate,
        items: {
          deleteMany: {},
          create:
            items?.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: Number(item.quantity) * Number(item.unitPrice),
            })) ??
            findInvoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: Number(item.quantity) * Number(item.unitPrice),
            })),
        },
      },
    });

    return updatedInvoice;
  } catch (error) {
    throw error;
  }
};

export const deleteInvoiceByIdService = async (
  userId: string,
  invoiceId: string,
) => {
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

export const sendInvoiceToClientService = async (
  userId: string,
  invoiceId: string,
) => {
  try {
    const findInvoice = await prisma.invoice.findFirst({
      where: {
        businessId: userId,
        id: invoiceId,
      },
      include: {
        items: true,
        client: true,
        business: true,
      },
    });

    if (!findInvoice) {
      throw createError("Invoice not found", 404);
    }

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const formatDate = (value: Date) =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(value);

    const subtotal = findInvoice.items.reduce(
      (sum, item) => sum + Number(item.totalPrice ?? 0),
      0,
    );

    const itemRows = findInvoice.items
      .map((item, index) => {
        const rowStyle =
          index % 2 === 1 ? ' style="background-color: #f5f5f5"' : "";
        const unitPrice = String(item.unitPrice);
        const totalPrice = String(item.totalPrice);

        return `
        <tr${rowStyle}>
          <td class="cell" style="padding: 14px 16px; font-size: 14px; line-height: 22.4px; color: #000000;">
            ${escapeHtml(item.description)}
          </td>
          <td align="right" class="cell" style="padding: 14px 16px; font-size: 14px; line-height: 22.4px; color: #000000;">
            ${item.quantity}
          </td>
          <td align="right" class="cell" style="padding: 14px 16px; font-size: 14px; line-height: 22.4px; color: #000000;">
            ${escapeHtml(unitPrice)}
          </td>
          <td align="right" class="cell" style="padding: 14px 16px; font-size: 14px; line-height: 22.4px; color: #000000;">
            ${escapeHtml(totalPrice)}
          </td>
        </tr>
      `;
      })
      .join("");

    const templatePath = path.resolve(
      process.cwd(),
      "src",
      "email",
      "email.html",
    );
    let html = await readFile(templatePath, "utf-8");

    html = html
      .replaceAll("{{businessName}}", escapeHtml(findInvoice.business.name))
      .replaceAll("{{businessEmail}}", escapeHtml(findInvoice.business.email))
      .replaceAll(
        "{{invoiceNumber}}",
        escapeHtml(findInvoice.invoiceNumber ?? "INV-00000"),
      )
      .replaceAll(
        "{{issuedDate}}",
        escapeHtml(formatDate(findInvoice.createdAt)),
      )
      .replaceAll("{{dueDate}}", escapeHtml(formatDate(findInvoice.dueDate)))
      .replaceAll("{{clientName}}", escapeHtml(findInvoice.client.name))
      .replaceAll("{{clientEmail}}", escapeHtml(findInvoice.client.email))
      .replaceAll("{{clientPhone}}", escapeHtml(findInvoice.client.phone ?? ""))
      .replaceAll("{{subtotal}}", String(subtotal))
      .replaceAll("{{total}}", String(subtotal))
      .replaceAll("{{itemRows}}", itemRows);

    const browser = await puppeteer.launch();
    let pdfBuffer: Buffer;

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "24px",
          right: "24px",
          bottom: "24px",
          left: "24px",
        },
      });
      pdfBuffer = Buffer.from(pdfBytes);
    } finally {
      await browser.close();
    }

    const invoiceLabel = findInvoice.invoiceNumber ?? "invoice";

    const subject = `Invoice: ${findInvoice.business.name} - ${invoiceLabel}`;

    const message = `Dear ${findInvoice.client.name},\n\nPlease find attached the invoice ${invoiceLabel} from ${findInvoice.business.name}.\n\nBest regards,\n${findInvoice.business.name}`;

    try {
      await sendEmail({
        email: findInvoice.client.email,
        subject,
        message,
        attachments: [
          {
            filename: `${invoiceLabel}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error) {
      logger.error("Error sending email:", error);
      throw createError(
        "There was an error sending the email. Please try again later.",
        500,
      );
    }

    await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return;
  } catch (error) {
    throw error;
  }
};
