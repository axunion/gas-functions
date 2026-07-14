/**
 * Detects image MIME type and file extension from base64 data by analyzing magic bytes.
 *
 * @param params - Parameters for image type detection.
 * @param params.base64Data - The base64 encoded image data. Can include data URL prefix or be raw base64.
 * @returns An object containing the detected MIME type and file extension.
 * @throws Error if base64Data is empty, too short, or not a supported image format.
 */
function detectImageMimeType(params: { base64Data: string }): {
	mimeType: string;
	extension: string;
} {
	const { base64Data } = params;

	if (!base64Data || base64Data.trim() === "") {
		throw new Error("Base64 data is required and must be a non-empty string.");
	}

	// A data URL that explicitly says SVG can be trusted without binary checks
	if (/^data:image\/svg\+xml;base64,/i.test(base64Data)) {
		return { mimeType: "image/svg+xml", extension: "svg" };
	}

	// Remove data URL prefix if present (case-insensitive)
	const cleanBase64 = base64Data.replace(
		/^data:image\/[a-z0-9.+-]+;base64,/i,
		"",
	);

	if (cleanBase64 === "") {
		throw new Error("Invalid base64 data format.");
	}

	// Decode to check magic bytes; decode errors propagate as-is
	const bytes = new Uint8Array(Utilities.base64Decode(cleanBase64));

	if (bytes.length < 3) {
		throw new Error("Base64 data is too short to determine image type.");
	}

	const startsWith = (sig: number[]) => sig.every((b, i) => bytes[i] === b);

	if (startsWith([0xff, 0xd8, 0xff])) {
		return { mimeType: "image/jpeg", extension: "jpg" };
	}
	if (bytes.length >= 4 && startsWith([0x89, 0x50, 0x4e, 0x47])) {
		return { mimeType: "image/png", extension: "png" };
	}
	if (startsWith([0x47, 0x49, 0x46])) {
		return { mimeType: "image/gif", extension: "gif" };
	}
	if (
		bytes.length >= 12 &&
		startsWith([0x52, 0x49, 0x46, 0x46]) &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return { mimeType: "image/webp", extension: "webp" };
	}

	throw new Error("Unsupported or unknown image format.");
}

export { detectImageMimeType };
