jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  del: jest.fn(),
}));

import {
  getCdps, getCdpPositionDetail, getCdpPositionActivities,
  associateCdpPositionActivity, disassociateCdpPositionActivity,
  consumeCdpPositionFunds,
} from "@/services/financial/cdps.service";
import { get, post, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockDel = del as jest.Mock;

describe("cdps.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getCdps", async () => {
    await getCdps("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("getCdpPositionDetail", async () => {
    await getCdpPositionDetail("p1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("p1"));
  });

  it("getCdpPositionActivities", async () => {
    await getCdpPositionActivities("p1", "page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("p1"));
  });

  it("associateCdpPositionActivity", async () => {
    await associateCdpPositionActivity("p1", "da1");
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), { detailedActivityId: "da1" });
  });

  it("disassociateCdpPositionActivity", async () => {
    await disassociateCdpPositionActivity("p1", "da1");
    expect(mockDel).toHaveBeenCalled();
  });

  it("consumeCdpPositionFunds", async () => {
    const data = { detailedActivityId: "da1", amount: 1000 };
    await consumeCdpPositionFunds("p1", data);
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), data);
  });
});
