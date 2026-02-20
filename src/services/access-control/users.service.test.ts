jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getUsers, getUser, updateUser, deleteUser,
  getUserRoles, assignUserRole, removeUserRole,
} from "./users.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("users.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getUsers", async () => {
    await getUsers("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("users?page=1"));
  });

  it("getUser", async () => {
    await getUser("u1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("users/u1"));
  });

  it("updateUser", async () => {
    await updateUser("u1", { name: "John" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("users/u1"), { name: "John" });
  });

  it("deleteUser", async () => {
    await deleteUser("u1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("users/u1"));
  });

  it("getUserRoles", async () => {
    await getUserRoles("u1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("users/u1/roles"));
  });

  it("assignUserRole", async () => {
    await assignUserRole("u1", "r1");
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("users/u1/roles"), { roleId: "r1" });
  });

  it("removeUserRole", async () => {
    await removeUserRole("u1", "r1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("users/u1/roles/r1"));
  });
});
