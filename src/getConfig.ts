type Config = {
	fileId: string;
	sheetName: string;
	fieldConfigs: {
		name: string;
		maxlength: number;
		required: boolean;
	}[];
};

type ConfigRow = [unknown, string, string, string, ...unknown[]];

const CONFIG_SHEET_NAME = "config" as const;
const COL_TYPE = 1;
const COL_FILE_ID = 2;
const COL_SHEET_NAME = 3;

const FIELD_COL_NAME = 0;
const FIELD_COL_MAXLENGTH = 1;
const FIELD_COL_REQUIRED = 2;

function _getConfig(): void {
	const properties = PropertiesService.getScriptProperties().getProperties();
	const type = "";
	const configRow = getConfigRow(properties.SPREADSHEET_ID_CONFIG, type);
	const config = getConfig(properties.SPREADSHEET_ID_CONFIG, type);
	console.log(configRow);
	console.log(config);
}

/**
 * Internal helper: Finds a configuration row within a spreadsheet.
 *
 * @throws {Error} If config sheet is not found or no matching configuration exists
 */
function findConfigRow(
	spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
	type: string,
	fileId: string,
): ConfigRow {
	const configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);

	if (!configSheet) {
		throw new Error(
			`Config sheet not found: sheet='${CONFIG_SHEET_NAME}', fileId='${fileId}'`,
		);
	}

	const configRows = configSheet.getDataRange().getValues();

	if (!configRows || !configRows.length) {
		throw new Error(
			`Config sheet is empty: sheet='${CONFIG_SHEET_NAME}', fileId='${fileId}'`,
		);
	}

	const configRow = configRows.find((row) => row[COL_TYPE] === type);

	if (!configRow) {
		throw new Error(`Config not found: type='${type}', fileId='${fileId}'`);
	}

	return configRow as ConfigRow;
}

/**
 * Retrieves a configuration row by file ID.
 *
 * @throws {Error} If spreadsheet cannot be opened or configuration not found
 */
function getConfigRow(fileId: string, type: string): ConfigRow {
	const ss = SpreadsheetApp.openById(fileId);
	return findConfigRow(ss, type, fileId);
}

/**
 * Retrieves a complete configuration object with field validation rules.
 *
 * @throws {Error} If spreadsheet, config sheet, or field sheet cannot be accessed
 */
function getConfig(fileId: string, type: string): Config {
	const ss = SpreadsheetApp.openById(fileId);
	const fieldSheet = ss.getSheetByName(type);

	if (!fieldSheet) {
		throw new Error(
			`Field sheet not found: sheet='${type}', fileId='${fileId}'`,
		);
	}

	const configRow = findConfigRow(ss, type, fileId);
	const fieldData = fieldSheet.getDataRange().getValues();

	return {
		fileId: String(configRow[COL_FILE_ID] ?? "").trim(),
		sheetName: String(configRow[COL_SHEET_NAME] ?? "").trim(),
		fieldConfigs: fieldData
			.slice(1) // skip header row
			.map((row) => ({
				name: String(row[FIELD_COL_NAME] ?? "").trim(),
				maxlength:
					Number.parseInt(String(row[FIELD_COL_MAXLENGTH] ?? "").trim(), 10) ||
					0,
				required:
					String(row[FIELD_COL_REQUIRED] ?? "")
						.trim()
						.toLowerCase() === "true",
			})),
	};
}

export { getConfig, getConfigRow };
