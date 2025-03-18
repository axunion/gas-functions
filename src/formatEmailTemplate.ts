/**
 * Replaces placeholders in the template with corresponding values from the data object.
 * Placeholders should be in the format {{ key }}.
 */
function formatEmailTemplate(
	template: string,
	data: { [key: string]: string | number },
): string {
	const placeholderRegex = /\{\{(.+?)\}\}/g;

	return template.replace(placeholderRegex, (match, key) => {
		const trimmedKey = key.trim();
		return trimmedKey in data ? String(data[trimmedKey]) : match;
	});
}

export { formatEmailTemplate };
