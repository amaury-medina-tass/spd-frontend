jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import {
  getDashboardGlobal, getDashboardNeeds, getCdpsByNeed,
  getActivitiesByCdp, getContractsByCdp, getCdpsByContract,
  getBudgetRecordsByContract, getProjectBudgetOverview,
  getProjectExecution, getMgaActivitiesByProject,
  getDetailedByMga, getModificationsByActivity,
} from "@/services/financial/dashboard.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("dashboard.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({});
  });

  it("getDashboardGlobal without params", async () => {
    await getDashboardGlobal();
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("dashboard"));
  });

  it("getDashboardGlobal with year and month", async () => {
    await getDashboardGlobal(2024, 6);
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain("year=2024");
    expect(url).toContain("month=6");
  });

  it("getDashboardNeeds", async () => {
    await getDashboardNeeds("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("getCdpsByNeed", async () => {
    await getCdpsByNeed("n1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("n1"));
  });

  it("getActivitiesByCdp", async () => {
    await getActivitiesByCdp("c1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("c1"));
  });

  it("getContractsByCdp", async () => {
    await getContractsByCdp("c1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getCdpsByContract", async () => {
    await getCdpsByContract("ct1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getBudgetRecordsByContract", async () => {
    await getBudgetRecordsByContract("ct1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getProjectBudgetOverview", async () => {
    await getProjectBudgetOverview();
    expect(mockGet).toHaveBeenCalled();
  });

  it("getProjectExecution", async () => {
    await getProjectExecution("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("getMgaActivitiesByProject", async () => {
    await getMgaActivitiesByProject("p1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getDetailedByMga", async () => {
    await getDetailedByMga("m1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getModificationsByActivity", async () => {
    await getModificationsByActivity("a1");
    expect(mockGet).toHaveBeenCalled();
  });
});
