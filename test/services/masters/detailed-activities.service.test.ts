jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getDetailedActivities, getDetailedActivity, createDetailedActivity,
  updateDetailedActivity, deleteDetailedActivity,
} from "@/services/masters/detailed-activities.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("detailed-activities.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getDetailedActivities", async () => {
    await getDetailedActivities("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("detailed-activities?page=1"));
  });

  it("getDetailedActivity", async () => {
    await getDetailedActivity("da1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("detailed-activities/da1"));
  });

  it("createDetailedActivity", async () => {
    await createDetailedActivity({ name: "Test" });
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("detailed-activities"), { name: "Test" });
  });

  it("updateDetailedActivity", async () => {
    await updateDetailedActivity("da1", { name: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("detailed-activities/da1"), { name: "Updated" });
  });

  it("deleteDetailedActivity", async () => {
    await deleteDetailedActivity("da1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("detailed-activities/da1"));
  });
});
