type InputValues = Record<string, string | string[]>;

type AcceptedRow = {
	name: string;
	maxlength: number;
	required: boolean;
};

/**
 * Validates input parameters against a set of accepted criteria.
 * Checks for required fields and maximum length. For array values, it joins them into a single string.
 * Type checks on values are intentional: inputs typically come from untrusted runtime data (e.g. doPost payloads).
 *
 * @param params - The parameters for validation.
 * @param params.inputValues - An object where keys are field names and values are the input strings or array of strings.
 * @param params.acceptedRows - An array of objects defining the validation criteria for each field (name, maxlength, required).
 * @returns An array of non-empty, processed string values for fields that passed validation, ordered as per `acceptedRows`.
 * @throws Error if any validation rule is violated.
 */
function validateParameters(params: {
	inputValues: InputValues;
	acceptedRows: AcceptedRow[];
}): string[] {
	const { inputValues, acceptedRows } = params;
	const values: string[] = [];

	for (const { name, maxlength, required } of acceptedRows) {
		const value = inputValues[name];

		if (value === undefined || value === null) {
			if (required) {
				throw new Error(`"${name}" is required.`);
			}
			continue;
		}

		if (typeof value === "string") {
			if (required && value.trim() === "") {
				throw new Error(`"${name}" is required.`);
			}
			if (value.length > maxlength) {
				throw new Error(
					`"${name}" is too long. Maximum length is ${maxlength}.`,
				);
			}
			if (value !== "") {
				values.push(value);
			}
		} else if (Array.isArray(value)) {
			if (required && value.length === 0) {
				throw new Error(`"${name}" is required.`);
			}
			if (value.some((v) => typeof v !== "string")) {
				throw new Error(`"${name}" contains non-string elements.`);
			}
			const joinedValue = value.join(",");
			if (joinedValue.length > maxlength) {
				throw new Error(
					`"${name}" is too long. Maximum length is ${maxlength} (after joining array elements).`,
				);
			}
			if (joinedValue !== "") {
				values.push(joinedValue);
			}
		} else {
			throw new Error(
				`"${name}" has an invalid type. Expected string or array of strings.`,
			);
		}
	}

	return values;
}

export { validateParameters };
