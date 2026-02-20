jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getMGAActivities, getMGAActivity, createMGAActivity,
  updateMGAActivity, deleteMGAActivity,
} from "@/services/masters/mga-activities.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("mga-activities.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getMGAActivities", async () => {
    await getMGAActivities("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("mga-activities?page=1"));
  });

  it("getMGAActivity", async () => {
    await getMGAActivity("m1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("mga-activities/m1"));
  });

  it("createMGAActivity", async () => {
    await createMGAActivity({ name: "Test" });
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("mga-activities"), { name: "Test" });
  });

  it("updateMGAActivity", async () => {
    await updateMGAActivity("m1", { name: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("mga-activities/m1"), { name: "Updated" });
  });

  it("deleteMGAActivity", async () => {
    await deleteMGAActivity("m1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("mga-activities/m1"));
  });
});
