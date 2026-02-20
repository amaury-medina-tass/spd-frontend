jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getVariables, getMyVariables, getVariableDashboardData } from "@/services/sub/variables.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("sub/variables.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getVariables without query", async () => {
    await getVariables();
    expect(mockGet).toHaveBeenCalledWith("/masters/variables?");
  });

  it("getVariables with query", async () => {
    await getVariables("page=1");
    expect(mockGet).toHaveBeenCalledWith("/masters/variables?page=1");
  });

  it("getMyVariables", async () => {
    await getMyVariables("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("getVariableDashboardData with specific year/month", async () => {
    await getVariableDashboardData("v1", "2024", "6");
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("v1");
    expect(url).toContain("year=2024");
    expect(url).toContain("month=6");
  });

  it("getVariableDashboardData with 'all' values", async () => {
    await getVariableDashboardData("v1", "all", "all");
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("year=");
    expect(url).toContain("month=");
  });
});
