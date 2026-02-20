jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getModules, getModule, createModule, updateModule, deleteModule,
  getModuleActions, assignModuleAction, removeModuleAction,
} from "@/services/access-control/modules.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("modules.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getModules", async () => {
    await getModules("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("modules?page=1"));
  });

  it("getModule", async () => {
    await getModule("m1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("modules/m1"));
  });

  it("createModule", async () => {
    await createModule({ name: "Test" });
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("modules"), { name: "Test" });
  });

  it("updateModule", async () => {
    await updateModule("m1", { name: "Updated" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("modules/m1"), { name: "Updated" });
  });

  it("deleteModule", async () => {
    await deleteModule("m1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("modules/m1"));
  });

  it("getModuleActions", async () => {
    await getModuleActions("m1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("modules/m1/actions"));
  });

  it("assignModuleAction", async () => {
    await assignModuleAction("m1", "a1");
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("modules/m1/actions"), { actionId: "a1" });
  });

  it("removeModuleAction", async () => {
    await removeModuleAction("m1", "a1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("modules/m1/actions/a1"));
  });
});
