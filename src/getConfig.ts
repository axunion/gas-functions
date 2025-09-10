/**
 * Configuration object structure for managing spreadsheet field validations.
 */
type Config = {
	/** The target spreadsheet file ID */
	fileId: string;
	/** The target sheet name within the spreadsheet */
	sheetName: string;
	/** Array of field configuration objects for validation */
	fieldConfigs: {
		/** Field name */
		name: string;
		/** Maximum allowed length for the field value */
		maxlength: number;
		/** Whether the field is required */
		required: boolean;
	}[];
};

/** Configuration sheet name */
const CONFIG_SHEET_NAME = "config" as const;
/** Config sheet column indexes */
const COL_TYPE = 1;
const COL_FILE_ID = 2;
const COL_SHEET_NAME = 3;

/** Field config sheet column indexes */
const FIELD_COL_NAME = 0;
const FIELD_COL_MAXLENGTH = 1;
const FIELD_COL_REQUIRED = 2;

/**
 * Test function for debugging configuration retrieval.
 */
function _getConfig(): void {
	const properties = PropertiesService.getScriptProperties().getProperties();
	const type = "";
	const configRow = getConfigRow(properties.SPREADSHEET_ID_CONFIG, type);
	const config = getConfig(properties.SPREADSHEET_ID_CONFIG, type);
	console.log(configRow);
	console.log(config);
}

/**
 * Retrieves a configuration row from a spreadsheet.
 * Searches for a configuration entry matching the specified type.
 *
 * @param spreadsheet - The Google Spreadsheet object
 * @param type - The configuration type to match
 * @param fileId - The file ID for error reporting
 * @returns The configuration row as an array of values
 * @throws {Error} If config sheet is not found or no matching configuration exists
 */
function _getConfigRow(
	spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
	type: string,
	fileId: string,
): unknown[] {
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

	return configRow;
}

/**
 * Retrieves a configuration row by file ID.
 *
 * @param fileId - The Google Spreadsheet file ID
 * @param type - The configuration type to search for
 * @returns The configuration row as an array of values
 * @throws {Error} If spreadsheet cannot be opened or configuration not found
 */
function getConfigRow(fileId: string, type: string): unknown[] {
	const ss = SpreadsheetApp.openById(fileId);
	return _getConfigRow(ss, type, fileId);
}

/**
 * Retrieves a complete configuration object with field validation rules.
 *
 * @param fileId - The Google Spreadsheet file ID containing configuration
 * @param type - The configuration type (also used as field sheet name)
 * @returns Config object with file ID, sheet name, and field configurations
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

	const configRow = _getConfigRow(ss, type, fileId);
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

export { getConfig };
