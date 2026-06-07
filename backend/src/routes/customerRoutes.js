import { Router } from "express";
import { getCustomerById, getCustomers } from "../controllers/customerController.js";

const router = Router();

router.get("/", getCustomers);
router.get("/:identifier", getCustomerById);

export default router;
