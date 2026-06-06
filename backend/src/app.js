import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/summary", summaryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
