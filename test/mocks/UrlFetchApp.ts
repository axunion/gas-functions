import { vi } from "vitest";

export interface MockHttpResponse {
	code: number;
	body: object | string;
}

export const createMockResponse = (
	res: MockHttpResponse,
): GoogleAppsScript.URL_Fetch.HTTPResponse => ({
	getResponseCode: () => res.code,
	getContentText: () =>
		typeof res.body === "string" ? res.body : JSON.stringify(res.body),
	getAllHeaders: () => ({}),
	getAs: vi.fn(),
	getBlob: vi.fn(),
	getContent: vi.fn(),
	getHeaders: () => ({}),
});

export const mockUrlFetchApp = {
	fetch:
		vi.fn<
			(
				url: string,
				options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
			) => GoogleAppsScript.URL_Fetch.HTTPResponse
		>(),
	fetchAll: vi.fn(),
	getRequest: vi.fn(),
};

export const setupUrlFetchApp = () => {
	(
		globalThis as unknown as { UrlFetchApp: typeof mockUrlFetchApp }
	).UrlFetchApp = mockUrlFetchApp;
};

/** Set mock to return a successful response */
export const mockFetchSuccess = (body: object) => {
	mockUrlFetchApp.fetch.mockReturnValue(
		createMockResponse({ code: 200, body }),
	);
};

/** Set mock to return an HTTP error response */
export const mockFetchHttpError = (code: number, body: object | string) => {
	mockUrlFetchApp.fetch.mockReturnValue(createMockResponse({ code, body }));
};

/** Set mock to throw a network error */
export const mockFetchNetworkError = (message = "Network error") => {
	mockUrlFetchApp.fetch.mockImplementation(() => {
		throw new Error(message);
	});
};
