import { getCustomerDetail, listCustomers } from "../services/customerService.js";

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await listCustomers();

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const result = await getCustomerDetail(req.params.customerId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
