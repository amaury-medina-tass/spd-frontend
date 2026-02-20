jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import {
  createVariableAdvance,
  getVariableAdvancesByActionIndicator,
  getVariableAdvancesByIndicativeIndicator,
  getVariableLocations,
  getIndicatorVariablesLocations,
  getVariableAdvancesWithLocations,
  getActionIndicatorDetailed,
  getIndicativeIndicatorDetailed,
} from "./variable-advances.service";
import { get, post } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;

describe("sub/variable-advances.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
  });

  it("createVariableAdvance", async () => {
    const dto = { variableId: "v1", year: 2024, month: 1, value: "10" } as any;
    await createVariableAdvance(dto);
    expect(mockPost).toHaveBeenCalled();
  });

  it("getVariableAdvancesByActionIndicator", async () => {
    await getVariableAdvancesByActionIndicator("i1", "page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("i1"));
  });

  it("getVariableAdvancesByIndicativeIndicator", async () => {
    await getVariableAdvancesByIndicativeIndicator("i1", "page=1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getVariableLocations", async () => {
    await getVariableLocations("v1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getIndicatorVariablesLocations", async () => {
    await getIndicatorVariablesLocations("i1", "action");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getVariableAdvancesWithLocations without params", async () => {
    await getVariableAdvancesWithLocations("v1");
    expect(mockGet).toHaveBeenCalled();
  });

  it("getVariableAdvancesWithLocations with year and month", async () => {
    await getVariableAdvancesWithLocations("v1", 2024, 6);
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("year=2024");
    expect(url).toContain("month=6");
  });

  it("getActionIndicatorDetailed", async () => {
    await getActionIndicatorDetailed("i1", 2024, 6);
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("year=2024");
    expect(url).toContain("month=6");
  });

  it("getIndicativeIndicatorDetailed", async () => {
    await getIndicativeIndicatorDetailed("i1", "2024", "6");
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("year=2024");
    expect(url).toContain("month=6");
  });
});
