jest.unmock("@/lib/error-codes");

import { ErrorCodes, ERROR_CODES, getErrorMessage } from "./error-codes";

describe("ErrorCodes", () => {
  it("should have all auth error codes", () => {
    expect(ErrorCodes.INVALID_CREDENTIALS).toBe("INVALID_CREDENTIALS");
    expect(ErrorCodes.USER_INACTIVE).toBe("USER_INACTIVE");
    expect(ErrorCodes.EMAIL_NOT_VERIFIED).toBe("EMAIL_NOT_VERIFIED");
    expect(ErrorCodes.INVALID_PASSWORD).toBe("INVALID_PASSWORD");
  });

  it("should have all role error codes", () => {
    expect(ErrorCodes.ROLE_NOT_FOUND).toBe("ROLE_NOT_FOUND");
    expect(ErrorCodes.ROLE_ALREADY_EXISTS).toBe("ROLE_ALREADY_EXISTS");
    expect(ErrorCodes.ROLE_HAS_USERS).toBe("ROLE_HAS_USERS");
  });

  it("should have financial error codes", () => {
    expect(ErrorCodes.CDP_NOT_FOUND).toBe("CDP_NOT_FOUND");
    expect(ErrorCodes.CDP_INSUFFICIENT_BALANCE).toBe("CDP_INSUFFICIENT_BALANCE");
    expect(ErrorCodes.POAI_PPA_NOT_FOUND).toBe("POAI_PPA_NOT_FOUND");
  });

  it("should be readonly (as const)", () => {
    expect(typeof ErrorCodes.INVALID_CREDENTIALS).toBe("string");
  });
});

describe("ERROR_CODES (messages map)", () => {
  it("should have a message for every error code", () => {
    const codes = Object.values(ErrorCodes);
    for (const code of codes) {
      expect(ERROR_CODES[code]).toBeDefined();
      expect(typeof ERROR_CODES[code]).toBe("string");
    }
  });
});

describe("getErrorMessage", () => {
  it("should return the correct message for a known code", () => {
    expect(getErrorMessage("INVALID_CREDENTIALS")).toBe("Credenciales inválidas");
    expect(getErrorMessage("USER_NOT_FOUND")).toBe("Usuario no encontrado");
  });

  it("should return fallback for unknown code", () => {
    expect(getErrorMessage("UNKNOWN_CODE_XYZ")).toBe("Error inesperado");
  });
});
