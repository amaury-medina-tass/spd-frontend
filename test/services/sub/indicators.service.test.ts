jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getMyIndicativeIndicators, getMyActionPlanIndicators } from "@/services/sub/indicators.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("sub/indicators.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getMyIndicativeIndicators", async () => {
    await getMyIndicativeIndicators("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("getMyActionPlanIndicators", async () => {
    await getMyActionPlanIndicators("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });
});
