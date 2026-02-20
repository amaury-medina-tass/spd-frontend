jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getFinancialNeeds, getFinancialNeed } from "@/services/financial/needs.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("needs.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getFinancialNeeds", async () => {
    await getFinancialNeeds("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("needs?page=1"));
  });

  it("getFinancialNeed", async () => {
    await getFinancialNeed("n1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("needs/n1"));
  });
});
