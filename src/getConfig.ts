type Config = {
	dueDate: Date;
	sheetId: string;
	sheetName: string;
	rows: ConfigRow[];
};

type ConfigRow = {
	name: string;
	maxlength: number;
	required: boolean;
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
 * @param sheetId - The ID of the Google Spreadsheet.
 * @param sheetName - The name of the sheet containing the configuration data.
 * @returns An object containing the configuration data.
 * @throws Error if the specified sheet is not found.
 */
function getConfig(sheetId: string, sheetName: string): Config {
	const ss = SpreadsheetApp.openById(sheetId);
	const sheet = ss.getSheetByName(sheetName);

	if (!sheet) {
		throw new Error("Config not found.");
	}

	const data = sheet.getDataRange().getValues();

	return {
		dueDate: data[0][0],
		sheetId: data[1][0].trim(),
		sheetName: data[2][0].trim(),
		rows: data.slice(4).map((row) => ({
			name: row[0].trim(),
			maxlength: Number.parseInt(row[1]) || 0,
			required: Boolean(row[2]),
		})),
	};
}
