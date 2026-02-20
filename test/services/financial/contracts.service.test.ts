jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getMasterContracts, getMasterContract } from "@/services/financial/contracts.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("contracts.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getMasterContracts", async () => {
    await getMasterContracts("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("master-contracts?page=1"));
  });

  it("getMasterContract", async () => {
    await getMasterContract("c1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("master-contracts/c1"));
  });
});
