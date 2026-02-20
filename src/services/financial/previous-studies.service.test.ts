jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getPreviousStudies, getPreviousStudy } from "./previous-studies.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("previous-studies.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getPreviousStudies", async () => {
    await getPreviousStudies("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("previous-studies?page=1"));
  });

  it("getPreviousStudy", async () => {
    await getPreviousStudy("ps1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("previous-studies/ps1"));
  });
});
