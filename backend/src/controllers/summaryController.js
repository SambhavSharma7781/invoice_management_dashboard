import { getTopCustomersSummary } from "../services/customerService.js";

export const getTopCustomers = async (req, res, next) => {
  try {
    const data = await getTopCustomersSummary();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
