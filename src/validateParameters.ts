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
 * Validates input parameters against accepted criteria.
 * Checks each field for required status and maximum length. For array values, it ensures all elements are strings and joins them.
 * Returns an object with valid values and any error messages.
 */
function validateParameters(params: {
	inputValues: InputValues;
	acceptedRows: AcceptedRow[];
}): ValidateResult {
	const { inputValues, acceptedRows } = params;
	const values: string[] = [];
	const errors: string[] = [];

	for (const { name, maxlength, required } of acceptedRows) {
		const value = inputValues[name];

		if (value === undefined) {
			if (required) {
				errors.push(`"${name}" is required.`);
			}

			continue;
		}

		if (typeof value === "string") {
			if (required && value === "") {
				errors.push(`"${name}" is required.`);
				continue;
			}

			if (value.length > maxlength) {
				errors.push(`"${name}" is too long. Maximum length is ${maxlength}.`);
				continue;
			}

			values.push(value);
		} else if (Array.isArray(value)) {
			if (required && value.length === 0) {
				errors.push(`"${name}" is required.`);
				continue;
			}

			if (value.some((v) => typeof v !== "string")) {
				errors.push(`"${name}" contains non-string elements.`);
				continue;
			}

			values.push(value.join(","));
		}
	}

	return { values, errors };
}

export { validateParameters };
