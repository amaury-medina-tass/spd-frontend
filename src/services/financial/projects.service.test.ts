jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getProjects, getProject } from "./projects.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("projects.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getProjects", async () => {
    await getProjects("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("projects?page=1"));
  });

  it("getProject", async () => {
    await getProject("p1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("projects/p1"));
  });
});
