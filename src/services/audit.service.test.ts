jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getAuditLogs } from "./audit.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("audit.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getAuditLogs should call get with audit endpoint and params", async () => {
    await getAuditLogs("page=1&limit=10");
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("page=1&limit=10")
    );
  });
});
