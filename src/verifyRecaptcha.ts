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
 * @param params.token - The user response token provided by reCAPTCHA (g-recaptcha-response). Must be a non-empty string.
 * @param params.scoreThreshold - Score threshold (0.0-1.0). Verification fails if score is below this value. Defaults to 0.5.
 * @returns The RecaptchaResponse object from the API.
 * @throws {Error} If parameters are invalid, API request fails, response is malformed, verification fails, or score is below threshold.
 */
function verifyRecaptcha(params: {
	secret: string;
	token: string;
	scoreThreshold?: number;
}): RecaptchaResponse {
	const { secret, token, scoreThreshold = 0.5 } = params;

	if (typeof secret !== "string" || secret.trim() === "") {
		throw new Error("reCAPTCHA secret must be a non-empty string");
	}

	if (typeof token !== "string" || token.trim() === "") {
		throw new Error("reCAPTCHA token must be a non-empty string");
	}

	if (
		typeof scoreThreshold !== "number" ||
		scoreThreshold < 0 ||
		scoreThreshold > 1
	) {
		throw new Error("scoreThreshold must be a number between 0.0 and 1.0");
	}

	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(
			"https://www.google.com/recaptcha/api/siteverify",
			{
				method: "post",
				payload: {
					secret,
					response: token, // Google's API expects 'response' field
				},
			},
		);
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		throw new Error(`reCAPTCHA API request failed: ${errorMessage}`);
	}

	const httpCode = response.getResponseCode();

	if (httpCode !== 200) {
		throw new Error(
			`reCAPTCHA API returned HTTP ${httpCode}: ${response.getContentText()}`,
		);
	}

	try {
		const result = JSON.parse(response.getContentText()) as RecaptchaResponse;

		if (typeof result.success !== "boolean") {
			throw new Error("Invalid reCAPTCHA response: missing 'success' field");
		}

		if (!result.success) {
			const errorCodes = result["error-codes"]
				? ` (${result["error-codes"].join(", ")})`
				: "";
			throw new Error(`reCAPTCHA verification failed${errorCodes}`);
		}

		if (typeof result.score !== "number") {
			throw new Error(
				"Invalid reCAPTCHA response: missing or invalid 'score' field",
			);
		}

		if (result.score < scoreThreshold) {
			throw new Error(
				`reCAPTCHA score ${result.score} is below threshold ${scoreThreshold}`,
			);
		}

		return result;
	} catch (e: unknown) {
		// Re-throw our own errors, wrap JSON parsing errors
		if (
			e instanceof Error &&
			(e.message.startsWith("Invalid reCAPTCHA") ||
				e.message.startsWith("reCAPTCHA"))
		) {
			throw e;
		}

		const errorMessage = e instanceof Error ? e.message : String(e);
		throw new Error(`Failed to parse reCAPTCHA response: ${errorMessage}`);
	}
}

export { verifyRecaptcha };
