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
	token: string;
}): RecaptchaResponse {
	const { secret, token } = params;

	if (typeof secret !== "string" || secret.trim() === "") {
		throw new Error("secret parameter must be a non-empty string.");
	}

	if (typeof token !== "string" || token.trim() === "") {
		throw new Error(
			"token parameter (user response token) must be a non-empty string.",
		);
	}

	const url = "https://www.google.com/recaptcha/api/siteverify";
	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(url, {
			method: "post",
			payload: { secret, response: token },
		});
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		throw new Error(
			`Failed to connect to reCAPTCHA API. Please check network connection and API endpoint. Original error: ${errorMessage}`,
		);
	}

	const httpCode = response.getResponseCode();
	const responseText = response.getContentText();

	if (httpCode !== 200) {
		throw new Error(
			`Failed to verify reCAPTCHA. The API returned HTTP status ${httpCode}. Response: ${responseText}`,
		);
	}

	let result: RecaptchaResponse;

	try {
		result = JSON.parse(responseText);
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		throw new Error(
			`Failed to parse reCAPTCHA API response. Ensure the API is returning valid JSON. Original error: ${errorMessage}`,
		);
	}

	return result;
}

export { verifyRecaptcha };
