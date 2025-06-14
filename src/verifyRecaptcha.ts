type RecaptchaResponse = {
	success: boolean;
	score: number;
	action: string;
	challenge_ts: string;
	hostname: string;
	"error-codes"?: string[];
};

/**
 * Verifies a reCAPTCHA response token using Google's reCAPTCHA API.
 *
 * @param params - Parameters for reCAPTCHA verification.
 * @param params.secret - The shared key between your site and reCAPTCHA. Must be a non-empty string.
 * @param params.recaptcha - The user response token provided by reCAPTCHA (g-recaptcha-response). Must be a non-empty string.
 * @returns A Promise resolving to the RecaptchaResponse object from the API.
 * @throws {Error} If `params`, `params.secret`, or `params.recaptcha` is invalid.
 * @throws {Error} If the API fetch fails, the HTTP response code is not 200, or if the API response cannot be parsed.
 */
function verifyRecaptcha(params: {
	secret: string;
	recaptcha: string;
}): RecaptchaResponse {
	if (!params || typeof params !== "object") {
		throw new Error(
			"Parameters for reCAPTCHA verification must be provided as an object.",
		);
	}

	const { secret, recaptcha } = params;

	if (typeof secret !== "string" || secret.trim() === "") {
		throw new Error("The 'secret' parameter must be a non-empty string.");
	}

	if (typeof recaptcha !== "string" || recaptcha.trim() === "") {
		throw new Error(
			"The 'recaptcha' parameter (user response token) must be a non-empty string.",
		);
	}

	const url = "https://www.google.com/recaptcha/api/siteverify";

	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(url, {
			method: "post",
			payload: { secret, response: recaptcha },
			muteHttpExceptions: true, // To handle non-200 responses manually
		});
	} catch (e: unknown) {
		// Catch network errors or other issues with UrlFetchApp.fetch itself
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.error(`reCAPTCHA API fetch error: ${errorMessage}`);
		throw new Error(
			`Failed to connect to reCAPTCHA API. Please check network connection and API endpoint. Original error: ${errorMessage}`,
		);
	}

	const httpCode = response.getResponseCode();
	const responseText = response.getContentText();

	if (httpCode !== 200) {
		console.error(
			`reCAPTCHA API non-200 response. Code: ${httpCode}, Response: ${responseText}`,
		);
		throw new Error(
			`Failed to verify reCAPTCHA. The API returned HTTP status ${httpCode}. Response: ${responseText}`,
		);
	}

	let result: RecaptchaResponse;

	try {
		result = JSON.parse(responseText);
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.error(
			`reCAPTCHA API JSON parsing error: ${errorMessage}. Response text: ${responseText}`,
		);
		throw new Error(
			`Failed to parse reCAPTCHA API response. Ensure the API is returning valid JSON. Original error: ${errorMessage}`,
		);
	}

	// Additional check for error-codes in the response, even if success might be true (or false)
	if (result["error-codes"] && result["error-codes"].length > 0) {
		console.warn(
			`reCAPTCHA verification returned with error codes: ${result["error-codes"].join(", ")}`,
		);
		// Depending on policy, you might want to throw an error here or handle it differently.
		// For now, we return the result as the API still provided a structured response.
	}

	return result;
}

export { verifyRecaptcha };
