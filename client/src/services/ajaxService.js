const API_URL = process.env.NEXT_PUBLIC_API_URL;

let jqueryPromise = null;

const loadJQuery = async () => {
    if (
        typeof window === "undefined" ||
        !window.document
    ) {
        throw new Error(
            "jQuery Ajax can only run in the browser"
        );
    }

    if (!jqueryPromise) {
        jqueryPromise = import("jquery").then(
            (jqueryModule) => jqueryModule.default
        );
    }

    return jqueryPromise;
};

const ajaxRequest = async ({
    endpoint,
    method = "GET",
    data = null,
    headers = {},
}) => {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not configured"
        );
    }

    const $ = await loadJQuery();
    const requestMethod = method.toUpperCase();

    const isFormData =
        typeof FormData !== "undefined" &&
        data instanceof FormData;

    const requestOptions = {
        url: `${API_URL}${endpoint}`,
        method: requestMethod,
        dataType: "json",
        headers,
        timeout: isFormData
            ? 120000
            : 10000,
    };

    if (data !== null) {
        if (requestMethod === "GET") {
            requestOptions.data = data;
        } else if (isFormData) {
            requestOptions.data = data;

            requestOptions.processData =
                false;

            requestOptions.contentType =
                false;
        } else {
            requestOptions.data =
                JSON.stringify(data);

            requestOptions.contentType =
                "application/json";
        }
    }

    return new Promise((resolve, reject) => {
        $.ajax(requestOptions)
            .done((response) => {
                resolve(response);
            })
            .fail(
                (
                    jqXHR,
                    textStatus,
                    errorThrown
                ) => {
                    const responseErrors =
                        jqXHR.responseJSON?.errors;

                    const message =
                        Array.isArray(responseErrors) &&
                        responseErrors.length > 0
                            ? responseErrors.join(", ")
                            : jqXHR.responseJSON?.message ||
                            errorThrown ||
                            "The server request failed";

                    const error = new Error(message);

                    error.status = jqXHR.status;
                    error.textStatus = textStatus;

                    reject(error);
                }
            );
    });
};

export const getHealth = () => {
    return ajaxRequest({
        endpoint: "/api/health",
        method: "GET",
    });
};

export default ajaxRequest;