import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";

const ALLOWED_STATUSES = new Set(["Sent", "Unpaid", "Overdue", "Paid", "Void", "Draft"]);
const ALLOWED_SORT_BY = new Set(["amount", "dueDate", "issueDate"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_TAX_RATES = new Set([0, 3, 5, 18, 28]);

const createQueryError = (message) => {
    const error = new Error(message);
    error.code = "INVALID_QUERY";
    error.statusCode = 400;
    return error;
};

const createValidationError = (message) => {
    const error = new Error(message);
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    return error;
};

const createNotFoundError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 404;
    return error;
};

const createConflictError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 409;
    return error;
};

const normalizeValue = (value, fieldName) => {
    if (value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        throw createQueryError(`${fieldName} must be a string`);
    }
    return value;
};

const normalizeList = (value, fieldName) => {
    if (value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        throw createQueryError(`${fieldName} must be a comma-separated string`);
    }
    return value;
};

const parsePositiveInt = (value, field, defaultValue) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
        throw createQueryError(`${field} must be a positive integer`);
    }

    return numberValue;
};

const parseDate = (value, field) => {
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
        throw createQueryError(`Invalid ${field}`);
    }
    return dateValue;
};

const parseBodyDate = (value, field) => {
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
        throw createValidationError(`Invalid ${field}`);
    }
    return dateValue;
};

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const generateInvoiceId = () => {
    const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
    return `INV-${randomNumber}`;
};

const parseDateRange = (fromValue, toValue, fieldName) => {
    if (!fromValue && !toValue) {
        return null;
    }

    const range = {};

    if (fromValue) {
        range.$gte = parseDate(fromValue, `${fieldName}From`);
    }

    if (toValue) {
        range.$lte = parseDate(toValue, `${fieldName}To`);
    }

    if (range.$gte && range.$lte && range.$gte > range.$lte) {
        throw createQueryError(`${fieldName}From must be on or before ${fieldName}To`);
    }

    return range;
};

export const listInvoices = async (query) => {
    const page = parsePositiveInt(normalizeValue(query.page, "page"), "page", DEFAULT_PAGE);
    const limitInput = parsePositiveInt(
        normalizeValue(query.limit, "limit"),
        "limit",
        DEFAULT_LIMIT
    );

    if (limitInput > MAX_LIMIT) {
        throw createQueryError(`limit must be less than or equal to ${MAX_LIMIT}`);
    }

    const limit = limitInput;

    const filters = {};

    const statusValue = normalizeList(query.status, "status");
    if (statusValue !== undefined) {
        const statuses = String(statusValue)
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

        if (statuses.length === 0) {
            throw createQueryError("status filter cannot be empty");
        }

        const uniqueStatuses = Array.from(new Set(statuses));
        uniqueStatuses.forEach((status) => {
            if (!ALLOWED_STATUSES.has(status)) {
                throw createQueryError(`Invalid status value: ${status}`);
            }
        });

        filters.status = { $in: uniqueStatuses };
    }

    const customerIdValue = normalizeValue(query.customerId, "customerId");
    if (customerIdValue) {
        if (!mongoose.Types.ObjectId.isValid(customerIdValue)) {
            throw createQueryError("Invalid customerId");
        }
        filters.customerId = customerIdValue;
    }

    const issueDateRange = parseDateRange(
        normalizeValue(query.issueDateFrom, "issueDateFrom"),
        normalizeValue(query.issueDateTo, "issueDateTo"),
        "issueDate"
    );
    if (issueDateRange) {
        filters.issueDate = issueDateRange;
    }

    const dueDateRange = parseDateRange(
        normalizeValue(query.dueDateFrom, "dueDateFrom"),
        normalizeValue(query.dueDateTo, "dueDateTo"),
        "dueDate"
    );
    if (dueDateRange) {
        filters.dueDate = dueDateRange;
    }

    const sortByValue = normalizeValue(query.sortBy, "sortBy");
    const orderValue = normalizeValue(query.order, "order");

    const sortBy = (sortByValue || "issueDate").toString().trim();
    if (!ALLOWED_SORT_BY.has(sortBy)) {
        throw createQueryError(`Invalid sortBy value: ${sortBy}`);
    }

    const order = (orderValue || "desc").toString().trim().toLowerCase();
    if (!ALLOWED_ORDER.has(order)) {
        throw createQueryError(`Invalid order value: ${order}`);
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };

    const total = await Invoice.countDocuments(filters);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = await Invoice.find(filters)
        .select("-__v")
        .populate("customerId", "name company")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};

export const getInvoiceByInvoiceId = async (invoiceId) => {
    if (
        typeof invoiceId !== "string" ||
        !/^INV-\d{7}$/.test(invoiceId)
    ) {
        const error = new Error("Invoice not found");
        error.code = "INVOICE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }
    const invoice = await Invoice.findOne({ invoiceId })
        .select("-__v")
        .populate("customerId", "name company")
        .lean();

    if (!invoice) {
        const error = new Error("Invoice not found");
        error.code = "INVOICE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }

    return invoice;
};

export const createInvoice = async (payload) => {
    const customerId = payload?.customerId;
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw createValidationError("Invalid customerId");
    }

    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
        throw createNotFoundError("Customer not found", "CUSTOMER_NOT_FOUND");
    }

    const amount = Number(payload?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw createValidationError("Amount must be greater than 0");
    }

    const taxRate = Number(payload?.taxRate);
    if (!Number.isFinite(taxRate) || !ALLOWED_TAX_RATES.has(taxRate)) {
        throw createValidationError("Invalid taxRate");
    }

    const status = payload?.status;
    if (!status || !ALLOWED_STATUSES.has(status)) {
        throw createValidationError("Invalid status");
    }

    const issueDate = parseBodyDate(payload?.issueDate, "issueDate");
    const dueDate = parseBodyDate(payload?.dueDate, "dueDate");
    if (dueDate < issueDate) {
        throw createValidationError("dueDate must be on or after issueDate");
    }

    let invoiceId = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = generateInvoiceId();
        const exists = await Invoice.exists({ invoiceId: candidate });
        if (!exists) {
            invoiceId = candidate;
            break;
        }
    }

    if (!invoiceId) {
        throw createConflictError(
            "Failed to generate unique invoiceId",
            "INVOICE_ID_GENERATION_FAILED"
        );
    }

    const tax = roundCurrency((amount * taxRate) / 100);
    const total = roundCurrency(amount + tax);

    const invoice = await Invoice.create({
        invoiceId,
        customerId,
        amount,
        taxRate,
        tax,
        total,
        status,
        issueDate,
        dueDate,
    });

    const createdInvoice = await Invoice.findById(invoice._id)
        .select("-__v")
        .populate("customerId", "name company")
        .lean();

    return createdInvoice;
};

export const updateInvoiceByInvoiceId = async (invoiceId, payload) => {
    if (typeof invoiceId !== "string" || !/^INV-\d{7}$/.test(invoiceId)) {
        const error = new Error("Invoice not found");
        error.code = "INVOICE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }

    const existingInvoice = await Invoice.findOne({ invoiceId }).select("_id").lean();
    if (!existingInvoice) {
        const error = new Error("Invoice not found");
        error.code = "INVOICE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }

    const customerId = payload?.customerId;
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw createValidationError("Invalid customerId");
    }

    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
        throw createNotFoundError("Customer not found", "CUSTOMER_NOT_FOUND");
    }

    const amount = Number(payload?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw createValidationError("Amount must be greater than 0");
    }

    const taxRate = Number(payload?.taxRate);
    if (!Number.isFinite(taxRate) || !ALLOWED_TAX_RATES.has(taxRate)) {
        throw createValidationError("Invalid taxRate");
    }

    const status = payload?.status;
    if (!status || !ALLOWED_STATUSES.has(status)) {
        throw createValidationError("Invalid status");
    }

    const issueDate = parseBodyDate(payload?.issueDate, "issueDate");
    const dueDate = parseBodyDate(payload?.dueDate, "dueDate");
    if (dueDate < issueDate) {
        throw createValidationError("dueDate must be on or after issueDate");
    }

    const tax = roundCurrency((amount * taxRate) / 100);
    const total = roundCurrency(amount + tax);

    const updatedInvoice = await Invoice.findOneAndUpdate(
        { invoiceId },
        {
            customerId,
            amount,
            taxRate,
            tax,
            total,
            status,
            issueDate,
            dueDate,
        },
        { new: true }
    )
        .select("-__v")
        .populate("customerId", "name company")
        .lean();

    if (!updatedInvoice) {
        const error = new Error("Invoice not found");
        error.code = "INVOICE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }

    return updatedInvoice;
};
