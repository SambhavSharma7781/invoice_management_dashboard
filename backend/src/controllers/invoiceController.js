import {
  createInvoice as createInvoiceService,
  getInvoiceByInvoiceId as getInvoiceByInvoiceIdService,
  listInvoices,
  updateInvoiceByInvoiceId as updateInvoiceByInvoiceIdService,
} from "../services/invoiceService.js";

export const getInvoices = async (req, res, next) => {
  try {
    const result = await listInvoices(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await getInvoiceByInvoiceIdService(
      req.params.invoiceId
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await createInvoiceService(req.body);

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await updateInvoiceByInvoiceIdService(
      req.params.invoiceId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};