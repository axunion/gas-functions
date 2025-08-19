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
	const config = getConfig(properties.SPREADSHEET_ID_CONFIG, "");
	console.log(config);
}

/**
 * Retrieves configuration data from a specified Google Sheet.
 *
 * @param fileId - The ID of the Google Spreadsheet.
 * @param type - The type of configuration to retrieve.
 * @returns An object containing the configuration data.
 * @throws Error if the specified sheet is not found.
 */
function getConfig(fileId: string, type: string): Config {
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
