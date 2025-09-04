type Config = {
	fileId: string;
	sheetName: string;
	fieldConfigs: {
		name: string;
		maxlength: number;
		required: boolean;
	}[];
};

/**
 * Test function to demonstrate getConfig.
 * Retrieves configuration from script properties and logs it.
 * This function is intended for testing or debugging purposes.
 */
function _getConfig(): void {
	const properties = PropertiesService.getScriptProperties().getProperties();
	const config = getConfig(properties.SPREADSHEET_ID_CONFIG, "", true);
	console.log(config);
}

/**
 * Retrieves configuration data from a specified Google Sheet.
 *
 * If `configOnly` is true the function will return the raw data from the
 * `config` sheet (as a 2D array of values) and will not attempt to resolve
 * the referenced sheet by `type`.
 *
 * @param fileId - The ID of the Google Spreadsheet.
 * @param type - The type of configuration to retrieve.
 * @param configOnly - When true returns the `config` sheet data directly.
 * @returns An object containing the configuration data or the raw config sheet values when `configOnly`.
 * @throws Error if the specified sheet is not found (only when configOnly is false).
 */
function getConfig(
	fileId: string,
	type: string,
	configOnly = false,
): Config | unknown[] | undefined {
	const ss = SpreadsheetApp.openById(fileId);
	const configSheet = ss.getSheetByName("config");

	if (!configSheet) {
		throw new Error("Config sheet not found.");
	}

	const configList = configSheet.getDataRange().getValues();

	if (!configList) {
		throw new Error("Config not found.");
	}

	const config = configList.find((row) => !row[0] && row[1] === type);

	if (!config) {
		throw new Error("Config not found.");
	}

	if (configOnly) {
		return config;
	}

	const sheet = ss.getSheetByName(type);

	if (!sheet) {
		throw new Error("Sheet not found.");
	}

	const fieldConfigs = sheet.getDataRange().getValues();

	return {
		fileId: config[2].trim(),
		sheetName: config[3].trim(),
		fieldConfigs: fieldConfigs.slice(1).map((row) => ({
			name: row[0].trim(),
			maxlength: Number.parseInt(row[1], 10) || 0,
			required: Boolean(row[2]),
		})),
	};
}

export { getConfig };
