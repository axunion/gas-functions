type EmaiTemplateData = { [key: string]: string | number };

function formatEmailTemplate(template: string, data: EmaiTemplateData): string {
  const placeholderRegex = /\{\{(.*?)\}\}/g;

  return template.replace(placeholderRegex, (match, key) => {
    key = key.trim();
    return data[key] ? String(data[key]) : match;
  });
}

export { formatEmailTemplate };
