type InputValues = Record<string, string | string[]>;

type AcceptedRow = {
	name: string;
	maxlength: number;
	required: boolean;
};

type ValidateResult = {
	values: string[];
	errors: string[];
};

/**
 * Validates input parameters against a set of accepted criteria.
 * Checks for required fields and maximum length. For array values, it joins them into a single string.
 *
 * @param params - The parameters for validation.
 * @param params.inputValues - An object where keys are field names and values are the input strings or array of strings.
 * @param params.acceptedRows - An array of objects defining the validation criteria for each field (name, maxlength, required).
 * @returns An object containing two arrays: `values` (valid, processed string values for fields that passed validation, ordered as per `acceptedRows`) and `errors` (any validation error messages).
 * @throws {Error} If `params`, `params.inputValues`, or `params.acceptedRows` is null or undefined.
 */
function validateParameters(params: {
	inputValues: InputValues;
	acceptedRows: AcceptedRow[];
}): ValidateResult {
	if (!params || typeof params !== "object") {
		throw new Error("Validation parameters must be provided as an object.");
	}

	if (!params.inputValues || typeof params.inputValues !== "object") {
		throw new Error("'inputValues' must be provided as an object.");
	}

	if (!params.acceptedRows || !Array.isArray(params.acceptedRows)) {
		throw new Error("'acceptedRows' must be provided as an array.");
	}

	const { inputValues, acceptedRows } = params;
	const values: string[] = [];
	const errors: string[] = [];

	for (const { name, maxlength, required } of acceptedRows) {
		const value = inputValues[name];

		if (value === undefined || value === null) {
			// Consider null as well
			if (required) {
				errors.push(`"${name}" is required.`);
			}
			// No value to add, continue to next acceptedRow
			continue;
		}

		if (typeof value === "string") {
			if (required && value === "") {
				errors.push(`"${name}" is required.`);
				// Do not add to values if required and empty
			} else if (value.length > maxlength) {
				errors.push(`"${name}" is too long. Maximum length is ${maxlength}.`);
				// Do not add to values if too long
			} else {
				values.push(value);
			}
		} else if (Array.isArray(value)) {
			if (required && value.length === 0) {
				errors.push(`"${name}" is required.`);
				// Do not add to values if required and empty
			} else {
				// Check for non-string elements before joining
				if (value.some((v) => typeof v !== "string")) {
					errors.push(`"${name}" contains non-string elements.`);
					// Do not add to values if type error
				} else {
					const joinedValue = value.join(","); // Default separator
					if (joinedValue.length > maxlength) {
						errors.push(
							`"${name}" is too long. Maximum length is ${maxlength} (after joining array elements).`,
						);
						// Do not add to values if too long after join
					} else {
						values.push(joinedValue);
					}
				}
			}
		} else {
			// Handle cases where value is not undefined/null, not string, not array (e.g. number, boolean, object)
			errors.push(
				`"${name}" has an invalid type. Expected string or array of strings.`,
			);
		}
	}

	return { values, errors };
}

export { validateParameters };
