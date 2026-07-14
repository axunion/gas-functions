/**
 * Formats an email template by replacing placeholders with data values.
 * Placeholders should be in the format {{key}} (e.g., {{name}}, {{orderNumber}}).
 * Placeholders without a matching key are left unchanged.
 *
 * @param params - Parameters for formatting.
 * @param params.template - The email template string with placeholders.
 * @param params.data - An object where keys correspond to placeholder names (without curly braces and trimmed) and values are the replacement strings or numbers.
 * @returns The formatted email template string.
 */
function formatEmailTemplate(params: {
	template: string;
	data: { [key: string]: string | number };
}): string {
	const { template, data } = params;

	return template.replace(/\{\{(.+?)\}\}/g, (match, key: string) => {
		const trimmedKey = key.trim();
		return Object.hasOwn(data, trimmedKey) ? String(data[trimmedKey]) : match;
	});
}

export { formatEmailTemplate };
