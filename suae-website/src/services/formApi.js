const nodeApiBase = (import.meta.env.VITE_NODE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE_URL = `${nodeApiBase}/api/form`;

export class FormApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      type = "api_error",
      response = null
    } = {}
  ) {
    super(message);

    this.name = "FormApiError";
    this.status = status;
    this.type = type;
    this.response = response;
  }
}

const parseApiResponse = async (response) => {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new FormApiError(
      "Server se valid response nahi mila.",
      {
        status: response.status,
        type: "invalid_response"
      }
    );
  }

  if (!response.ok) {
    throw new FormApiError(
      result?.message ||
        `Request failed with status ${response.status}.`,
      {
        status: response.status,
        type: "http_error",
        response: result
      }
    );
  }

  return result;
};

const requestApi = async (
  url,
  options,
  networkErrorMessage
) => {
  try {
    const response = await fetch(url, options);

    return await parseApiResponse(response);
  } catch (error) {
    if (error instanceof FormApiError) {
      throw error;
    }

    throw new FormApiError(
      networkErrorMessage,
      {
        type: "network_error"
      }
    );
  }
};

export const getCaptcha = async () => {
  const result = await requestApi(
    `${API_BASE_URL}/captcha`,
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    },
    "CAPTCHA API se connection nahi ho pa raha hai."
  );

  if (
    result?.status !== true ||
    !result?.token ||
    !result?.question
  ) {
    throw new FormApiError(
      result?.message ||
        "CAPTCHA load nahi ho saka.",
      {
        type: "captcha_load_failed",
        response: result
      }
    );
  }

  return {
    token: String(result.token),
    question: String(result.question)
  };
};

export const verifyCaptcha = async ({
  token,
  answer
}) => {
  const cleanToken = String(
    token || ""
  ).trim();

  const cleanAnswer = String(
    answer || ""
  ).trim();

  if (!cleanToken) {
    throw new FormApiError(
      "CAPTCHA token missing hai. Refresh karke dobara try karein.",
      {
        type: "captcha_token_missing"
      }
    );
  }

  if (!cleanAnswer) {
    throw new FormApiError(
      "Please enter the CAPTCHA answer.",
      {
        type: "captcha_answer_missing"
      }
    );
  }

  const result = await requestApi(
    `${API_BASE_URL}/verify-captcha`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: cleanToken,
        answer: Number(cleanAnswer)
      })
    },
    "CAPTCHA verification API abhi available nahi hai."
  );

  if (result?.status !== true) {
    throw new FormApiError(
      result?.message ||
        "CAPTCHA answer incorrect hai.",
      {
        type: "captcha_verification_failed",
        response: result
      }
    );
  }

  return result;
};

export const sendOtp = async ({
  mobile,
  formId = 2
}) => {
  const result = await requestApi(
    `${API_BASE_URL}/send-otp`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mobile,
        form_id: formId
      })
    },
    "OTP service abhi available nahi hai."
  );

  if (result?.status !== true) {
    throw new FormApiError(
      result?.message ||
        "OTP send nahi ho saka.",
      {
        type: "otp_send_failed",
        response: result
      }
    );
  }

  return result;
};

export const verifyOtp = async ({
  mobile,
  otp
}) => {
  const result = await requestApi(
    `${API_BASE_URL}/verify-otp`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mobile,
        otp: String(otp)
      })
    },
    "OTP verification service abhi available nahi hai."
  );

  if (result?.status !== true) {
    throw new FormApiError(
      result?.message ||
        "OTP verification failed.",
      {
        type: "otp_verification_failed",
        response: result
      }
    );
  }

  return result;
};

export const submitConsultationForm = async (
  payload
) => {
  const result = await requestApi(
    `${API_BASE_URL}/submit`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    "Form submission API abhi available nahi hai."
  );

  if (result?.status !== true) {
    throw new FormApiError(
      result?.message ||
        "Form submit nahi ho saka.",
      {
        type: "form_submission_failed",
        response: result
      }
    );
  }

  return result;
};