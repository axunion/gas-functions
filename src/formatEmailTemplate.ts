/**
 * Formats an email template by replacing placeholders with data values.
 * Placeholders should be in the format {{key}} (e.g., {{name}}, {{orderNumber}}).
 *
 * @param template - The email template string with placeholders. If null or undefined, an empty string is returned.
 * @param data - An object where keys correspond to placeholder names (without curly braces and trimmed) and values are the replacement strings or numbers.
 * @returns The formatted email template string. If the template is null/undefined, returns an empty string. If data is null/undefined, returns the original template.
 */
function formatEmailTemplate(
	template: string | null | undefined,
	data: { [key: string]: string | number } | null | undefined,
): string {
	if (template === null || template === undefined) {
		return "";
	}

	if (data === null || data === undefined) {
		return template;
	}

	const placeholderRegex = /\{\{(.+?)\}\}/g;

	return template.replace(placeholderRegex, (match, key) => {
		const trimmedKey = key.trim();
		return Object.prototype.hasOwnProperty.call(data, trimmedKey)
			? String(data[trimmedKey])
			: match;
	});
}

export { formatEmailTemplate };
