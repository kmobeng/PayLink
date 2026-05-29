import {Router} from "express";
import { protect } from "../middlewares/auth.middleware";
import { createInvoice, deleteInvoiceById, getInvoiceById, getInvoices, updateDraftInvoiceById } from "../controllers/invoice.controller";

const invoiceRouter = Router();

invoiceRouter.use(protect)

invoiceRouter.route("/").post(createInvoice).get(getInvoices);

invoiceRouter.route("/:invoiceId").get(getInvoiceById).put(updateDraftInvoiceById).delete(deleteInvoiceById);

export default invoiceRouter;