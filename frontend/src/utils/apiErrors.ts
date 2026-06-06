import axios from "axios";

const FRIENDLY_ERRORS: Record<number, string> = {
  400: "Invalid filters selected. Please review and try again.",
  404: "No invoices found.",
  500: "Something went wrong on our server. Please try again later.",
};

const NETWORK_ERROR_MESSAGE = "Unable to connect to the server.";

export function getFriendlyApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status && FRIENDLY_ERRORS[status]) {
      return FRIENDLY_ERRORS[status];
    }

    if (!error.response) {
      return NETWORK_ERROR_MESSAGE;
    }

    if (status && status >= 500) {
      return FRIENDLY_ERRORS[500];
    }
  }

  if (error instanceof Error && error.message === "Network Error") {
    return NETWORK_ERROR_MESSAGE;
  }

  return FRIENDLY_ERRORS[500];
}
