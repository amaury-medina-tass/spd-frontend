jest.unmock("@/lib/http");

import { HttpError } from "./http";

// We test the HttpError class and exported helpers.
// The fetch-based functions (get, post, etc.) are tested via service tests.

describe("HttpError", () => {
  it("should store status, data, and errors", () => {
    const errors = [{ field: "email", message: "required" }];
    const err = new HttpError(400, { foo: "bar" }, errors, "Bad Request");

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(err.data).toEqual({ foo: "bar" });
    expect(err.errors).toEqual(errors);
    expect(err.message).toBe("Bad Request");
  });

  it("should default message to HttpError", () => {
    const err = new HttpError(500, null);
    expect(err.message).toBe("HttpError");
  });

  it("should default errors to null", () => {
    const err = new HttpError(500, null);
    expect(err.errors).toBeNull();
  });

  describe("getFieldError", () => {
    it("should return the message for a matching field", () => {
      const err = new HttpError(400, null, [
        { field: "email", message: "Email is required" },
        { field: "name", message: "Name is required" },
      ]);
      expect(err.getFieldError("email")).toBe("Email is required");
    });

    it("should return undefined for a non-matching field", () => {
      const err = new HttpError(400, null, [
        { field: "email", message: "Email is required" },
      ]);
      expect(err.getFieldError("password")).toBeUndefined();
    });

    it("should return undefined when errors is null", () => {
      const err = new HttpError(400, null, null);
      expect(err.getFieldError("email")).toBeUndefined();
    });
  });

  describe("getAllErrorMessages", () => {
    it("should return all error messages", () => {
      const err = new HttpError(400, null, [
        { field: "email", message: "Email required" },
        { field: "name", message: "Name required" },
      ]);
      expect(err.getAllErrorMessages()).toEqual(["Email required", "Name required"]);
    });

    it("should return empty array when errors is null", () => {
      const err = new HttpError(400, null, null);
      expect(err.getAllErrorMessages()).toEqual([]);
    });
  });
});

// Test the actual HTTP request functions with mocked fetch
describe("HTTP request functions", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockFetchSuccess = (data: any) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ data }),
    });
  };

  const mockFetchError = (status: number, body: any) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      headers: { get: () => "application/json" },
      json: async () => body,
    });
  };

  // We need to reimport after mocking
  let http: typeof import("./http");

  beforeEach(async () => {
    http = await import("./http");
  });

  it("get should make GET request and return data", async () => {
    mockFetchSuccess({ id: 1 });
    const result = await http.get("/test");
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("post should make POST request with body", async () => {
    mockFetchSuccess({ id: 1 });
    const result = await http.post("/test", { name: "foo" });
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "foo" }),
      }),
    );
  });

  it("put should make PUT request", async () => {
    mockFetchSuccess({ ok: true });
    await http.put("/test/1", { name: "bar" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test/1"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("patch should make PATCH request", async () => {
    mockFetchSuccess({ ok: true });
    await http.patch("/test/1", { name: "baz" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test/1"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("del should make DELETE request", async () => {
    mockFetchSuccess(null);
    await http.del("/test/1");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test/1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should throw HttpError on non-ok response", async () => {
    mockFetchError(400, { message: "Bad Request", errors: [{ field: "x", message: "y" }] });
    await expect(http.get("/fail")).rejects.toThrow(http.HttpError);
  });

  it("should attempt refresh on 401 and retry", async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.includes("/refresh")) {
        return { ok: true, headers: { get: () => "application/json" }, json: async () => ({}) };
      }
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 401,
          headers: { get: () => "application/json" },
          json: async () => ({ message: "Unauthorized" }),
        };
      }
      return {
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ data: { retried: true } }),
      };
    });

    const result = await http.get<any>("/protected");
    expect(result).toEqual({ retried: true });
  });

  it("should handle text responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "text/plain" },
      text: async () => "plain text",
    });
    const result = await http.get("/text");
    expect(result).toBe("plain text");
  });

  it("should rethrow non-401 errors", async () => {
    mockFetchError(500, { message: "Server Error" });
    await expect(http.get("/error")).rejects.toThrow(http.HttpError);
  });
});
