type RecaptchaResponse = {
	success: true | false;
	score: number;
	action: string;
	challenge_ts: string;
	hostname: string;
	"error-codes"?: string[];
};

function verifyRecaptcha(secret: string, recaptcha: string): RecaptchaResponse {
	const url = "https://www.google.com/recaptcha/api/siteverify";
	const response = UrlFetchApp.fetch(url, {
		method: "post",
		payload: { secret, response: recaptcha },
	});

	return JSON.parse(response.getContentText());
}
