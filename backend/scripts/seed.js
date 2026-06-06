import "../src/config/env.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/config/db.js";
import Customer from "../src/models/Customer.js";
import Invoice from "../src/models/Invoice.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../data/seed-data.json");

const loadSeedData = async () => {
  const raw = await fs.readFile(dataPath, "utf-8");
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : parsed.invoices || parsed.data;

  if (!Array.isArray(records)) {
    throw new Error("Seed data must be an array or contain an 'invoices' array");
  }

  return records;
};

const toNumber = (value, field, index) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`Invalid ${field} for record ${index + 1}`);
  }
  return numberValue;
};

const toDate = (value, field, index) => {
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw new Error(`Invalid ${field} for record ${index + 1}`);
  }
  return dateValue;
};

const buildCustomerMap = (records) => {
  const customerMap = new Map();

  records.forEach((record, index) => {
    const name = record.customer;
    const company = record.company;

    if (!name || !company) {
      throw new Error(`Missing customer name or company for record ${index + 1}`);
    }

    customerMap.set(name, { name, company });
  });

  return customerMap;
};

const upsertCustomers = async (customers) => {
  if (customers.length === 0) {
    return;
  }

  const operations = customers.map((customer) => ({
    updateOne: {
      filter: { name: customer.name },
      update: { $set: { name: customer.name, company: customer.company } },
      upsert: true,
    },
  }));

  await Customer.bulkWrite(operations, { ordered: false });
};

const buildCustomerIdMap = async (customerNames) => {
  const docs = await Customer.find({ name: { $in: customerNames } })
    .select("_id name")
    .lean();

  return new Map(docs.map((doc) => [doc.name, doc._id]));
};

const upsertInvoices = async (records, customerIdByName) => {
  const operations = records.map((record, index) => {
    const customerName = record.customer;
    const customerId = customerIdByName.get(customerName);

    if (!customerId) {
      throw new Error(`Customer not found for record ${index + 1}`);
    }

    if (!record.invoiceId) {
      throw new Error(`Missing invoiceId for record ${index + 1}`);
    }

    return {
      updateOne: {
        filter: { invoiceId: record.invoiceId },
        update: {
          $set: {
            invoiceId: record.invoiceId,
            customerId,
            amount: toNumber(record.amount, "amount", index),
            taxRate: toNumber(record.taxRate, "taxRate", index),
            tax: toNumber(record.tax, "tax", index),
            total: toNumber(record.total, "total", index),
            status: record.status,
            issueDate: toDate(record.issueDate, "issueDate", index),
            dueDate: toDate(record.dueDate, "dueDate", index),
          },
        },
        upsert: true,
      },
    };
  });

  if (operations.length === 0) {
    return 0;
  }

  await Invoice.bulkWrite(operations, { ordered: false });
  return operations.length;
};

const runSeed = async () => {
  console.log("Seed started...");
  await connectToDatabase();

  const records = await loadSeedData();
  const customerMap = buildCustomerMap(records);
  const customers = Array.from(customerMap.values());

  await upsertCustomers(customers);

  const customerIdByName = await buildCustomerIdMap(Array.from(customerMap.keys()));
  const invoicesProcessed = await upsertInvoices(records, customerIdByName);

  console.log(`Customers processed: ${customerMap.size}`);
  console.log(`Invoices processed: ${invoicesProcessed}`);
  console.log("Seed completed successfully.");
};

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch (closeError) {
      console.error("Failed to close database connection", closeError);
    }
  });
