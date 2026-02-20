jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getPoaiPpaRecords, getPoaiPpaRecord, createPoaiPpaRecord,
  updatePoaiPpaRecord, deletePoaiPpaRecord, getProjectsForSelect,
} from "@/services/financial/poai-ppa.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("poai-ppa.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getPoaiPpaRecords", async () => {
    await getPoaiPpaRecords("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("poai-ppa?page=1"));
  });

  it("getPoaiPpaRecord", async () => {
    await getPoaiPpaRecord("p1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("poai-ppa/p1"));
  });

  it("createPoaiPpaRecord", async () => {
    const data = { name: "Test" };
    await createPoaiPpaRecord(data);
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("poai-ppa"), data);
  });

  it("updatePoaiPpaRecord", async () => {
    await updatePoaiPpaRecord("p1", { name: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("poai-ppa/p1"), { name: "Updated" });
  });

  it("deletePoaiPpaRecord", async () => {
    await deletePoaiPpaRecord("p1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("poai-ppa/p1"));
  });

  it("getProjectsForSelect", async () => {
    await getProjectsForSelect();
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("limit=100"));
  });
});
