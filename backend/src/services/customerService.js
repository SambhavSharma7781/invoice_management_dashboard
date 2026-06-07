import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createQueryError = (message) => {
    const error = new Error(message);
    error.code = "INVALID_QUERY";
    error.statusCode = 400;
    return error;
};

const createNotFoundError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 404;
    return error;
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

export const listCustomers = async () => {
    const customers = await Customer.find({})
        .select("_id name company")
        .sort({ name: 1 })
        .lean();

    return customers;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugToName = (slug) => slug.replace(/-/g, " ").trim();

const findCustomerByIdentifier = async (identifier) => {
    if (!identifier || typeof identifier !== "string") {
        throw createQueryError("Invalid customer identifier");
    }

    if (mongoose.Types.ObjectId.isValid(identifier)) {
        const customerById = await Customer.findById(identifier)
            .select("_id name company")
            .lean();

        if (customerById) {
            return customerById;
        }
    }

    const nameFromSlug = slugToName(decodeURIComponent(identifier));

    if (!nameFromSlug) {
        throw createQueryError("Invalid customer identifier");
    }

    const customer = await Customer.findOne({
        name: {
            $regex: new RegExp(`^${escapeRegex(nameFromSlug)}$`, "i"),
        },
    })
        .select("_id name company")
        .lean();

    if (!customer) {
        throw createNotFoundError("Customer not found", "CUSTOMER_NOT_FOUND");
    }

    return customer;
};

export const getCustomerDetail = async (identifier, query) => {
    const page = parsePositiveInt(query.page, "page", DEFAULT_PAGE);
    const limitInput = parsePositiveInt(query.limit, "limit", DEFAULT_LIMIT);

    if (limitInput > MAX_LIMIT) {
        throw createQueryError(`limit must be less than or equal to ${MAX_LIMIT}`);
    }

    const limit = limitInput;
    const customer = await findCustomerByIdentifier(identifier);
    const customerObjectId = customer._id;

    const [totalInvoices, invoices, metricsResult] = await Promise.all([
        Invoice.countDocuments({ customerId: customerObjectId }),
        Invoice.find({ customerId: customerObjectId })
            .select("-__v")
            .sort({ issueDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Invoice.aggregate([
            { $match: { customerId: customerObjectId } },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["Draft", "Void"]] },
                                0,
                                "$total",
                            ],
                        },
                    },
                    paidRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, "$total", 0],
                        },
                    },
                    pendingRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["Sent", "Unpaid", "Overdue"]] },
                                "$total",
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const metrics = metricsResult[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
    };

    const totalPages = totalInvoices === 0 ? 0 : Math.ceil(totalInvoices / limit);

    return {
        customer,
        metrics: {
            totalInvoices: metrics.totalInvoices || 0,
            totalRevenue: metrics.totalRevenue || 0,
            paidRevenue: metrics.paidRevenue || 0,
            pendingRevenue: metrics.pendingRevenue || 0,
        },
        invoices: {
            data: invoices,
            meta: {
                total: totalInvoices,
                page,
                limit,
                totalPages,
            },
        },
    };
};

export const getTopCustomersSummary = async () => {
    const results = await Invoice.aggregate([
        {
            $group: {
                _id: "$customerId",
                totalInvoices: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["Draft", "Void"]] },
                            0,
                            "$total",
                        ],
                    },
                },
                paidRevenue: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Paid"] },
                            "$total",
                            0,
                        ],
                    },
                },
                pendingRevenue: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["Sent", "Unpaid", "Overdue"]] },
                            "$total",
                            0,
                        ],
                    },
                },
            },
        },
        {
            $sort: {
                totalRevenue: -1,
                totalInvoices: -1,
            },
        },
        {
            $limit: 5,
        },
        {
            $lookup: {
                from: "customers",
                localField: "_id",
                foreignField: "_id",
                as: "customer",
            },
        },
        {
            $unwind: "$customer",
        },
        {
            $project: {
                _id: 0,
                customer: {
                    _id: "$customer._id",
                    name: "$customer.name",
                    company: "$customer.company",
                },
                totalRevenue: {
                    $round: ["$totalRevenue", 2],
                },
                totalInvoices: 1,
                paidRevenue: {
                    $round: ["$paidRevenue", 2],
                },
                pendingRevenue: {
                    $round: ["$pendingRevenue", 2],
                },
            },
        },
    ]);

    return results;
};
