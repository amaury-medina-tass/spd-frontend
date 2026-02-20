jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

import {
  getRoles, getRole, createRole, updateRole, deleteRole,
  getRolePermissions, updateRolePermissions,
} from "./roles.service";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

describe("roles.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("getRoles", async () => {
    await getRoles("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("roles?page=1"));
  });

  it("getRole", async () => {
    await getRole("r1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("roles/r1"));
  });

  it("createRole", async () => {
    await createRole({ name: "Admin" });
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("roles"), { name: "Admin" });
  });

  it("updateRole", async () => {
    await updateRole("r1", { name: "Editor" });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("roles/r1"), { name: "Editor" });
  });

  it("deleteRole", async () => {
    await deleteRole("r1");
    expect(mockDel).toHaveBeenCalledWith(expect.stringContaining("roles/r1"));
  });

  it("getRolePermissions", async () => {
    await getRolePermissions("r1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("roles/r1/permissions"));
  });

  it("updateRolePermissions", async () => {
    await updateRolePermissions("r1", ["p1", "p2"]);
    expect(mockPatch).toHaveBeenCalledWith(
      expect.stringContaining("roles/r1/permissions"),
      { permissionIds: ["p1", "p2"] }
    );
  });
});
