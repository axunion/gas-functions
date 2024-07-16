type ConfigRow = {
  name: string;
  maxlength: number;
  required: boolean;
};

type CheckResult = {
  values: string[];
  errors: string[];
};

function validateParameters(
  parameters: Record<string, string | string[]>,
  acceptedRows: ConfigRow[]
): CheckResult {
  const values: string[] = [];
  const errors: string[] = [];

  for (const { name, maxlength, required } of acceptedRows) {
    const value = parameters[name];

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
