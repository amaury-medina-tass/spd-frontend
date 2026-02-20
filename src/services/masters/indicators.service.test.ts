jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
  patch: jest.fn(),
}));

import {
  getIndicators, createIndicator, updateIndicator, getIndicatorCatalogs, deleteIndicator,
  getActionPlanIndicators, createActionPlanIndicator, updateActionPlanIndicator, deleteActionPlanIndicator,
  getActionPlanIndicatorGoals, createActionPlanIndicatorGoal, updateActionPlanIndicatorGoal, deleteActionPlanIndicatorGoal,
  getActionPlanIndicatorQuadrenniumGoals, createActionPlanIndicatorQuadrenniumGoal,
  updateActionPlanIndicatorQuadrenniumGoal, deleteActionPlanIndicatorQuadrenniumGoal,
  getIndicatorVariables, associateIndicatorVariable, disassociateIndicatorVariable,
  getActionPlanIndicatorVariables, associateActionPlanIndicatorVariable, disassociateActionPlanIndicatorVariable,
  getActionPlanIndicatorProjects, associateActionPlanIndicatorProject, disassociateActionPlanIndicatorProject,
  getIndicativePlanIndicatorLocations, getActionPlanIndicatorLocations,
  associateIndicativePlanIndicatorLocation, associateActionPlanIndicatorLocation,
  disassociateIndicativePlanIndicatorLocation, disassociateActionPlanIndicatorLocation,
  getIndicatorsByLocation, getActionPlanIndicatorsByLocation, getIndicatorLocationVariables,
  getIndicatorUsers, assignIndicatorUser, unassignIndicatorUser,
  getActionPlanIndicatorUsers, assignActionPlanIndicatorUser, unassignActionPlanIndicatorUser,
} from "./indicators.service";
import { get, post, del, patch } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockDel = del as jest.Mock;
const mockPatch = patch as jest.Mock;

describe("indicators.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
    mockPatch.mockResolvedValue({});
  });

  // Basic CRUD
  it("getIndicators", async () => {
    await getIndicators("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("indicators?page=1"));
  });

  it("createIndicator", async () => {
    await createIndicator({ name: "Test" } as any);
    expect(mockPost).toHaveBeenCalled();
  });

  it("updateIndicator", async () => {
    await updateIndicator("i1", { name: "Upd" } as any);
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("indicators/i1"), { name: "Upd" });
  });

  it("getIndicatorCatalogs", async () => {
    await getIndicatorCatalogs();
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("catalogs"));
  });

  it("deleteIndicator", async () => {
    await deleteIndicator("i1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("indicators/i1"));
  });

  // Action Plan Indicators
  it("getActionPlanIndicators", async () => {
    await getActionPlanIndicators("page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("createActionPlanIndicator", async () => {
    await createActionPlanIndicator({ name: "AP" } as any);
    expect(mockPost).toHaveBeenCalled();
  });

  it("updateActionPlanIndicator", async () => {
    await updateActionPlanIndicator("ap1", {} as any);
    expect(mockPatch).toHaveBeenCalled();
  });

  it("deleteActionPlanIndicator", async () => {
    await deleteActionPlanIndicator("ap1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Goals
  it("getActionPlanIndicatorGoals", async () => {
    await getActionPlanIndicatorGoals("page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("createActionPlanIndicatorGoal", async () => {
    await createActionPlanIndicatorGoal({});
    expect(mockPost).toHaveBeenCalled();
  });

  it("updateActionPlanIndicatorGoal", async () => {
    await updateActionPlanIndicatorGoal("g1", {});
    expect(mockPatch).toHaveBeenCalled();
  });

  it("deleteActionPlanIndicatorGoal", async () => {
    await deleteActionPlanIndicatorGoal("g1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Quadrennium Goals
  it("getActionPlanIndicatorQuadrenniumGoals", async () => {
    await getActionPlanIndicatorQuadrenniumGoals("page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("createActionPlanIndicatorQuadrenniumGoal", async () => {
    await createActionPlanIndicatorQuadrenniumGoal({});
    expect(mockPost).toHaveBeenCalled();
  });

  it("updateActionPlanIndicatorQuadrenniumGoal", async () => {
    await updateActionPlanIndicatorQuadrenniumGoal("q1", {});
    expect(mockPatch).toHaveBeenCalled();
  });

  it("deleteActionPlanIndicatorQuadrenniumGoal", async () => {
    await deleteActionPlanIndicatorQuadrenniumGoal("q1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Indicator Variables
  it("getIndicatorVariables", async () => {
    await getIndicatorVariables("i1", "page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("i1"));
  });

  it("associateIndicatorVariable", async () => {
    await associateIndicatorVariable("i1", "v1");
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), { variableId: "v1" });
  });

  it("disassociateIndicatorVariable", async () => {
    await disassociateIndicatorVariable("i1", "v1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Action Plan Indicator Variables
  it("getActionPlanIndicatorVariables", async () => {
    await getActionPlanIndicatorVariables("ap1", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("associateActionPlanIndicatorVariable", async () => {
    await associateActionPlanIndicatorVariable("ap1", "v1");
    expect(mockPost).toHaveBeenCalled();
  });

  it("disassociateActionPlanIndicatorVariable", async () => {
    await disassociateActionPlanIndicatorVariable("ap1", "v1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Projects
  it("getActionPlanIndicatorProjects", async () => {
    await getActionPlanIndicatorProjects("ap1", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("associateActionPlanIndicatorProject", async () => {
    await associateActionPlanIndicatorProject("ap1", "p1");
    expect(mockPost).toHaveBeenCalled();
  });

  it("disassociateActionPlanIndicatorProject", async () => {
    await disassociateActionPlanIndicatorProject("ap1", "p1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Locations
  it("getIndicativePlanIndicatorLocations", async () => {
    await getIndicativePlanIndicatorLocations("i1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getActionPlanIndicatorLocations", async () => {
    await getActionPlanIndicatorLocations("ap1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("associateIndicativePlanIndicatorLocation", async () => {
    await associateIndicativePlanIndicatorLocation("i1", "l1");
    expect(mockPost).toHaveBeenCalled();
  });

  it("associateActionPlanIndicatorLocation", async () => {
    await associateActionPlanIndicatorLocation("ap1", "l1");
    expect(mockPost).toHaveBeenCalled();
  });

  it("disassociateIndicativePlanIndicatorLocation", async () => {
    await disassociateIndicativePlanIndicatorLocation("i1", "l1");
    expect(mockDel).toHaveBeenCalled();
  });

  it("disassociateActionPlanIndicatorLocation", async () => {
    await disassociateActionPlanIndicatorLocation("ap1", "l1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Location-based queries
  it("getIndicatorsByLocation", async () => {
    await getIndicatorsByLocation("c1", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getActionPlanIndicatorsByLocation", async () => {
    await getActionPlanIndicatorsByLocation("c1", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getIndicatorLocationVariables", async () => {
    await getIndicatorLocationVariables("i1", "indicative", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  // User Assignments
  it("getIndicatorUsers", async () => {
    await getIndicatorUsers("i1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("assignIndicatorUser", async () => {
    await assignIndicatorUser("i1", "u1", "John");
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), { userId: "u1", userName: "John" });
  });

  it("unassignIndicatorUser", async () => {
    await unassignIndicatorUser("i1", "u1");
    expect(mockDel).toHaveBeenCalled();
  });

  it("getActionPlanIndicatorUsers", async () => {
    await getActionPlanIndicatorUsers("ap1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("assignActionPlanIndicatorUser", async () => {
    await assignActionPlanIndicatorUser("ap1", "u1", "Jane");
    expect(mockPost).toHaveBeenCalled();
  });

  it("unassignActionPlanIndicatorUser", async () => {
    await unassignActionPlanIndicatorUser("ap1", "u1");
    expect(mockDel).toHaveBeenCalled();
  });
});
