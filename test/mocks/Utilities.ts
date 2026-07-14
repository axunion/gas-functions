/** Inject a minimal Utilities mock into globalThis (base64Decode only). */
export const setupUtilities = () => {
	(
		globalThis as unknown as {
			Utilities: { base64Decode: (s: string) => number[] };
		}
	).Utilities = {
		base64Decode: (s: string): number[] => Array.from(Buffer.from(s, "base64")),
	};
};
