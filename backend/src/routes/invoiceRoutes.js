import { Router } from "express";
import { createInvoice, getInvoice, getInvoices, updateInvoice } from "../controllers/invoiceController.js";

const router = Router();

router.get("/", getInvoices);
router.post("/", createInvoice);
router.get("/:invoiceId", getInvoice);
router.put("/:invoiceId", updateInvoice);

export default router;