type EmailTemplateData = { [key: string]: string | number };

function formatEmailTemplate(
	template: string,
	data: EmailTemplateData,
): string {
	const placeholderRegex = /\{\{(.+?)\}\}/g;

	return template.replace(placeholderRegex, (match, key) => {
		const trimmedKey = key.trim();
		return trimmedKey in data ? String(data[trimmedKey]) : match;
	});
}

export { formatEmailTemplate };
