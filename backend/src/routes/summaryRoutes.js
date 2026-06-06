import { Router } from "express";
import { getTopCustomers } from "../controllers/summaryController.js";

const router = Router();

router.get("/top-customers", getTopCustomers);

export default router;
