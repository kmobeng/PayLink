import {Router} from "express";
import { protect } from "../middlewares/auth.middleware";
import { createInvoice, deleteInvoiceById, getInvoiceByClientId, getInvoiceById, getInvoices, sendInvoiceToClient, updateDraftInvoiceById } from "../controllers/invoice.controller";

const invoiceRouter = Router();

invoiceRouter.use(protect)

invoiceRouter.route("/").post(createInvoice).get(getInvoices);

invoiceRouter.route("/:invoiceId").get(getInvoiceById).patch(updateDraftInvoiceById).delete(deleteInvoiceById);

invoiceRouter.route("/client/:invoiceId").get(getInvoiceByClientId);

invoiceRouter.route("/:invoiceId/send").post(sendInvoiceToClient);

export default invoiceRouter;