type EmaiTemplateData = { [key: string]: string | number };

function formatEmailTemplate(template: string, data: EmaiTemplateData): string {
	const placeholderRegex = /\{\{(.*?)\}\}/g;

	return template.replace(placeholderRegex, (match, key) => {
		return data[key] ? String(data[key]) : match;
	});
}

export { formatEmailTemplate };
