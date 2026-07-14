import { beforeAll, describe, expect, it } from "vitest";
import { detectImageMimeType } from "../src/detectImageMimeType";
import { setupUtilities } from "./mocks";

const b64 = (bytes: number[]) =>
	Buffer.from(Uint8Array.from(bytes)).toString("base64");

beforeAll(() => {
	setupUtilities();
});

describe("detectImageMimeType", () => {
	it("detects JPEG from raw base64 with magic bytes", () => {
		const jpegSig = [0xff, 0xd8, 0xff, 0x00, 0x01];
		const res = detectImageMimeType({ base64Data: b64(jpegSig) });
		expect(res).toEqual({ mimeType: "image/jpeg", extension: "jpg" });
	});

	it("detects PNG from data URL (case-insensitive type)", () => {
		const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x00, 0x00];
		const base64Data = `data:image/PNG;base64,${b64(pngSig)}`;
		const res = detectImageMimeType({ base64Data });
		expect(res).toEqual({ mimeType: "image/png", extension: "png" });
	});

	it("detects GIF from data URL", () => {
		const gifSig = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // GIF89a
		const base64Data = `data:image/gif;base64,${b64(gifSig)}`;
		const res = detectImageMimeType({ base64Data });
		expect(res).toEqual({ mimeType: "image/gif", extension: "gif" });
	});

	it("detects WEBP from RIFF/WEBP signature", () => {
		// RIFF + size (4 bytes) + WEBP
		const webpBytes = [
			0x52,
			0x49,
			0x46,
			0x46, // RIFF
			0x00,
			0x00,
			0x00,
			0x00, // size placeholder
			0x57,
			0x45,
			0x42,
			0x50, // WEBP
			0x56, // extra padding
		];
		const res = detectImageMimeType({ base64Data: b64(webpBytes) });
		expect(res).toEqual({ mimeType: "image/webp", extension: "webp" });
	});

	it("returns SVG when data URL explicitly specifies image/svg+xml", () => {
		const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`;
		const res = detectImageMimeType({ base64Data: svgDataUrl });
		expect(res).toEqual({ mimeType: "image/svg+xml", extension: "svg" });
	});

	it("throws for too short base64 data", () => {
		const tooShort = b64([0x00, 0x01]);
		expect(() => detectImageMimeType({ base64Data: tooShort })).toThrow(
			"Base64 data is too short to determine image type.",
		);
	});

	it("throws the unsupported-format error without wrapping it", () => {
		const unknown = b64([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
		expect(() => detectImageMimeType({ base64Data: unknown })).toThrow(
			/^Unsupported or unknown image format\.$/,
		);
	});

	it("throws for empty/blank input", () => {
		expect(() => detectImageMimeType({ base64Data: "   " })).toThrow(
			"Base64 data is required and must be a non-empty string.",
		);
	});
});
