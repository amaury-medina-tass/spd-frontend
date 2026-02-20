jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  del: jest.fn(),
}));

import {
  getVariableLocations, associateVariableLocation, disassociateVariableLocation,
  getVariableUsers, assignVariableUser, unassignVariableUser,
} from "./variables.service";
import { get, post, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockDel = del as jest.Mock;

describe("variables.service (masters)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue([]);
    mockPost.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  // Locations
  it("getVariableLocations", async () => {
    await getVariableLocations("v1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("variables/v1/locations"));
  });

  it("associateVariableLocation", async () => {
    await associateVariableLocation("v1", "l1");
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), { locationId: "l1" });
  });

  it("disassociateVariableLocation", async () => {
    await disassociateVariableLocation("v1", "l1");
    expect(mockDel).toHaveBeenCalled();
  });

  // Users
  it("getVariableUsers", async () => {
    await getVariableUsers("v1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("assignVariableUser", async () => {
    await assignVariableUser("v1", "u1");
    expect(mockPost).toHaveBeenCalledWith(expect.anything(), { userId: "u1" });
  });

  it("unassignVariableUser", async () => {
    await unassignVariableUser("v1", "u1");
    expect(mockDel).toHaveBeenCalled();
  });
});
