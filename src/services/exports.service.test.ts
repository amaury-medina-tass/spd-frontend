jest.unmock("@/services/exports.service");

jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { requestExport, getExportStatus, listExports } from "./exports.service";
import { get, post } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;

describe("exports.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({});
    mockPost.mockResolvedValue({});
  });

  it("requestExport should call post with create endpoint", async () => {
    const dto = { system: "SPD", type: "ACTIVITIES" as const };
    await requestExport(dto);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("exports"),
      dto
    );
  });

  it("getExportStatus should call get with status endpoint", async () => {
    await getExportStatus("job-123");
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("job-123")
    );
  });

  it("listExports should call get with list endpoint", async () => {
    await listExports();
    expect(mockGet).toHaveBeenCalled();
  });
});
