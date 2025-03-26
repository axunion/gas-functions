type RecaptchaResponse = {
	success: boolean;
	score: number;
	action: string;
	challenge_ts: string;
	hostname: string;
	"error-codes"?: string[];
};

/**
 * Verifies the reCAPTCHA response using Google's reCAPTCHA API.
 */
function verifyRecaptcha(params: {
	secret: string;
	recaptcha: string;
}): RecaptchaResponse {
	const { secret, recaptcha } = params;
	const url = "https://www.google.com/recaptcha/api/siteverify";

	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(url, {
			method: "post",
			payload: { secret, response: recaptcha },
		});
	} catch (error) {
		throw new Error(`Failed to fetch reCAPTCHA API: ${error}`);
	}

	const httpCode = response.getResponseCode();

	if (httpCode !== 200) {
		throw new Error(`Failed to verify reCAPTCHA: HTTP ${httpCode}`);
	}

	let result: RecaptchaResponse;

	try {
		result = JSON.parse(response.getContentText());
	} catch (error) {
		throw new Error(`Failed to parse reCAPTCHA API response: ${error}`);
	}

	return result;
}

export { verifyRecaptcha };
